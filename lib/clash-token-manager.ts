import { randomUUID } from "crypto";

interface ClashApiKey {
  id: string;
  name: string;
  description: string;
  cidrRanges: string[];
  key: string;
  createdAt?: string; // Changed to optional since it's not in the actual response
  developerId: string;
  tier?: string;
  origins?: string[] | null;
  scopes?: string[];
  validUntil?: string | null;
}

interface ClashApiKeyListResponse {
  status: {
    code: number;
    message: string;
    detail: string | null;
  };
  sessionExpiresInSeconds: number;
  keys: ClashApiKey[];
}

export class ClashTokenManager {
  private static instance: ClashTokenManager;
  private token: string | null = null;
  private lastFetch: number = 0;
  private sessionCookies: string[] = [];
  private readonly TOKEN_REFRESH_INTERVAL = 1000 * 60 * 60; // 1 hour

  private constructor() {
    console.debug("ClashTokenManager: Constructor initialized");
  }

  public static getInstance(): ClashTokenManager {
    console.debug("ClashTokenManager: Getting instance");
    if (!ClashTokenManager.instance) {
      console.debug("ClashTokenManager: Creating new instance");
      ClashTokenManager.instance = new ClashTokenManager();
    }
    return ClashTokenManager.instance;
  }

  private extractCookies(response: Response): string[] {
    const cookies: string[] = [];

    // Standard approach - Headers doesn't have getAll method in standard fetch API
    const cookieHeader = response.headers.get("set-cookie");
    if (cookieHeader) {
      console.debug(
        `ClashTokenManager: Found cookies from headers.get: ${cookieHeader}`
      );
      // Split multiple cookies if they're in a single header
      const multipleCookies = cookieHeader.split(/,(?=\s*[^;,]+=[^;,]+)/);
      return multipleCookies;
    }

    // Get all headers to check for multiple Set-Cookie entries
    // This works with node-fetch and similar implementations
    const cookieEntries: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        cookieEntries.push(value);
      }
    });

    if (cookieEntries.length > 0) {
      console.debug(
        `ClashTokenManager: Found ${cookieEntries.length} cookies from headers iteration`
      );
      return cookieEntries;
    }

    console.debug("ClashTokenManager: No cookies found in response headers");
    return cookies;
  }

  public async getToken(): Promise<string> {
    const currentTime = Date.now();
    console.debug(
      `ClashTokenManager: getToken called at ${new Date(
        currentTime
      ).toISOString()}`
    );

    // Reuse token if it's not expired
    if (
      this.token &&
      currentTime - this.lastFetch < this.TOKEN_REFRESH_INTERVAL
    ) {
      console.debug(
        `ClashTokenManager: Returning cached token (age: ${
          (currentTime - this.lastFetch) / 1000
        }s)`
      );
      return this.token;
    }

    console.debug(
      "ClashTokenManager: Token not available or expired, generating new one"
    );

    try {
      const email = process.env.CLASH_DEV_EMAIL;
      const password = process.env.CLASH_DEV_PASSWORD;

      console.debug(
        `ClashTokenManager: Email configured: ${!!email}, Password configured: ${!!password}`
      );

      if (!email || !password) {
        throw new Error("Clash developer credentials not configured");
      }

      // Step 1: Get current IP address
      console.debug("ClashTokenManager: Fetching current IP address");
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      if (!ipResponse.ok) {
        console.debug(
          `ClashTokenManager: IP fetch failed with status ${ipResponse.status}`
        );
        throw new Error(`Failed to get IP: ${ipResponse.status}`);
      }

      const ipData = await ipResponse.json();
      const ip = ipData.ip;
      console.debug(`ClashTokenManager: Current IP: ${ip}`);

      // Step 2: Login to developer portal
      console.debug("ClashTokenManager: Logging in to developer portal");
      const loginResponse = await fetch(
        "https://developer.clashofclans.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      console.debug(
        `ClashTokenManager: Login response status: ${loginResponse.status}`
      );
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.debug(
          `ClashTokenManager: Login failed with response: ${errorText}`
        );
        throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
      }

      // Extract and save cookies from login response
      this.sessionCookies = this.extractCookies(loginResponse);
      console.debug(
        `ClashTokenManager: Saved ${this.sessionCookies.length} session cookies`
      );

      const loginData = await loginResponse.json();
      console.debug("ClashTokenManager: Login successful", loginData);

      // Step 3: List existing keys
      console.debug("ClashTokenManager: Fetching API keys list");
      const keysResponse = await fetch(
        "https://developer.clashofclans.com/api/apikey/list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Include all saved cookies in the request
            Cookie: this.sessionCookies.join("; "),
          },
          body: JSON.stringify({}),
        }
      );

      console.debug(
        `ClashTokenManager: Keys list response status: ${keysResponse.status}`
      );
      if (!keysResponse.ok) {
        const errorText = await keysResponse.text();
        console.debug(
          `ClashTokenManager: Keys list fetch failed with response: ${errorText}`
        );
        throw new Error(
          `Failed to list keys: ${keysResponse.status} - ${errorText}`
        );
      }

      // Update cookies if any new ones are set
      const newCookies = this.extractCookies(keysResponse);
      if (newCookies.length > 0) {
        this.sessionCookies = newCookies;
        console.debug(
          `ClashTokenManager: Updated session cookies from keys response`
        );
      }

      const keysData: ClashApiKeyListResponse = await keysResponse.json();
      console.debug(
        "ClashTokenManager: Keys list response",
        JSON.stringify(keysData, null, 2)
      );

      const keys: ClashApiKey[] = keysData.keys || [];
      console.debug(`ClashTokenManager: Found ${keys.length} existing keys`);

      // Step 4: Check for existing key with this IP
      console.debug(
        `ClashTokenManager: Checking for existing key with IP ${ip}`
      );
      const existingKey = keys.find((key) => {
        console.debug(
          `ClashTokenManager: Checking key ${key.id} with CIDR ranges:`,
          key.cidrRanges
        );
        return (
          key.cidrRanges &&
          key.cidrRanges.some((range) => range === ip || range === `${ip}/32`)
        );
      });

      if (existingKey) {
        console.debug(
          `ClashTokenManager: Found existing key ${existingKey.id} for current IP`
        );
        this.token = existingKey.key;
        this.lastFetch = currentTime;
        return this.token;
      }

      console.debug("ClashTokenManager: No existing key found for current IP");

      // Step 5: Clean up old keys if approaching limit (10 keys max)
      if (keys.length >= 9) {
        console.debug(
          "ClashTokenManager: Approaching keys limit, cleaning up old keys"
        );

        // Sort by key ID as a proxy for creation date (since createdAt might not be available)
        keys.sort((a, b) => a.id.localeCompare(b.id));

        console.debug(`ClashTokenManager: Deleting oldest key ${keys[0].id}`);
        const deleteResponse = await fetch(
          "https://developer.clashofclans.com/api/apikey/revoke",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Cookie: this.sessionCookies.join("; "),
            },
            body: JSON.stringify({ id: keys[0].id }),
          }
        );

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.debug(`ClashTokenManager: Key deletion failed: ${errorText}`);
          console.warn(
            `Failed to delete old key: ${deleteResponse.status} - ${errorText}`
          );
          // Continue anyway - this is not a fatal error
        } else {
          console.debug(
            "ClashTokenManager: Deleted oldest API key successfully"
          );
        }

        // Update cookies if any new ones are set
        const newDeleteCookies = this.extractCookies(deleteResponse);
        if (newDeleteCookies.length > 0) {
          this.sessionCookies = newDeleteCookies;
          console.debug(
            `ClashTokenManager: Updated session cookies from delete response`
          );
        }
      }

      // Step 6: Create new key
      const deploymentId = randomUUID().substring(0, 8);
      const keyName = `deployment-${deploymentId}`;
      const keyDescription = `Auto-generated on ${new Date().toLocaleString()}`;

      console.debug(
        `ClashTokenManager: Creating new key "${keyName}" for IP ${ip}`
      );
      console.debug(
        `ClashTokenManager: Request body:`,
        JSON.stringify({
          name: keyName,
          description: keyDescription,
          cidrRanges: [`${ip}`],
        })
      );

      const createResponse = await fetch(
        "https://developer.clashofclans.com/api/apikey/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Cookie: this.sessionCookies.join("; "),
          },
          body: JSON.stringify({
            name: keyName,
            description: keyDescription,
            cidrRanges: [`${ip}`],
          }),
        }
      );

      console.debug(
        `ClashTokenManager: Key creation response status: ${createResponse.status}`
      );
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.debug(`ClashTokenManager: Key creation failed: ${errorText}`);
        throw new Error(
          `Failed to create API key: ${createResponse.status} - ${errorText}`
        );
      }

      const newKeyData = await createResponse.json();
      console.debug(
        "ClashTokenManager: Key creation response:",
        JSON.stringify(newKeyData, null, 2)
      );

      // Check the structure of the response to find the token
      if (newKeyData && newKeyData.key && newKeyData.key.key) {
        console.debug(
          "ClashTokenManager: Successfully extracted new key from response"
        );
        this.token = newKeyData.key.key;
        this.lastFetch = currentTime;

        console.debug("ClashTokenManager: Created new API key for current IP");
        if (this.token) {
          return this.token;
        } else {
          throw new Error("Token is empty in response");
        }
      } else {
        console.debug(
          "ClashTokenManager: Unexpected response structure from key creation"
        );
        throw new Error(
          "Failed to obtain Clash API token: unexpected response structure"
        );
      }
    } catch (error) {
      console.error(
        "ClashTokenManager: Error managing Clash API token:",
        error
      );

      // Fall back to static token if available
      const staticToken = process.env.CLASH_API_TOKEN;
      if (staticToken) {
        console.warn("ClashTokenManager: Using fallback static API token");
        return staticToken;
      }

      throw new Error(
        `Failed to obtain Clash API token: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

export async function getClashApiToken(): Promise<string> {
  console.debug("getClashApiToken: Called");
  const manager = ClashTokenManager.getInstance();
  console.debug("getClashApiToken: Got manager instance, getting token");
  const token = await manager.getToken();
  console.debug(
    `getClashApiToken: Received token (length: ${token?.length || 0})`
  );
  return token;
}
