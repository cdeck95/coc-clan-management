import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { ClanWar, ClanWarLeagueWar } from "@/types/clash";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case "leader":
      return "bg-red-500 text-white";
    case "coleader":
      return "bg-orange-500 text-white";
    case "admin":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export function getDonationRatio(donated: number, received: number): number {
  if (received === 0) return donated > 0 ? Infinity : 1;
  return donated / received;
}

export function getWarStateColor(state: string) {
  switch (state.toLowerCase()) {
    case "preparation":
      return "bg-blue-500 hover:bg-blue-600";
    case "inwar":
      return "bg-red-500 hover:bg-red-600";
    case "warended":
      return "bg-green-500 hover:bg-green-600";
    case "notinwar":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

/**
 * Determine the number of attacks per member based on war type
 * @param war The war object
 * @returns Number of attacks per member (1 for CWL, 2 for regular war)
 */
export function getWarAttacksPerMember(
  war: ClanWar | ClanWarLeagueWar
): number {
  // Simple check for CWL wars vs regular wars
  return war.hasOwnProperty("warLeague") ? 1 : 2;
}

/**
 * Format a date string for display, adjusting for EST timezone
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    // Parse date, assuming it's in UTC
    let date: Date;

    if (dateString.includes("T") && !dateString.includes("-")) {
      // Parse non-standard format - YYYYMMDDTHHMMSS.msZ
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1; // Months are 0-based
      const day = parseInt(dateString.substring(6, 8));
      const hour = parseInt(dateString.substring(9, 11));
      const minute = parseInt(dateString.substring(11, 13));
      const second = parseInt(dateString.substring(13, 15));

      // Create date in UTC
      date = new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format the date, using locale formatting (which will use system timezone)
    // EST timezone will be applied automatically if the system is set to EST
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York", // Force EST timezone
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}

/**
 * Format a date string as a relative time (e.g. "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Date error";
  }
}

/**
 * Calculate and format the time remaining until a given end time
 * @param endTimeString ISO timestamp string for the end time
 * @returns Formatted time remaining string (e.g. "1h 30m 15s")
 */
export function calculateTimeRemaining(endTimeString: string): string {
  // Handle non-standard date format like "20250308T023906.000Z"
  let endTime: number;

  if (endTimeString.includes("T") && !endTimeString.includes("-")) {
    // Parse non-standard format - YYYYMMDDTHHMMSS.msZ
    const year = parseInt(endTimeString.substring(0, 4));
    const month = parseInt(endTimeString.substring(4, 6)) - 1; // Months are 0-based
    const day = parseInt(endTimeString.substring(6, 8));
    const hour = parseInt(endTimeString.substring(9, 11));
    const minute = parseInt(endTimeString.substring(11, 13));
    const second = parseInt(endTimeString.substring(13, 15));

    // Create date in UTC
    const date = new Date(Date.UTC(year, month, day, hour, minute, second));
    // Adjust for EST timezone (UTC-5)
    endTime = date.getTime();
  } else {
    // Standard ISO format
    const date = new Date(endTimeString);
    endTime = date.getTime();
  }

  const now = Date.now();

  // If the end time has passed or is invalid, return empty string
  if (isNaN(endTime) || now >= endTime) {
    return "";
  }

  // Calculate the difference in seconds
  let diff = Math.floor((endTime - now) / 1000);

  // Calculate hours, minutes, seconds
  const hours = Math.floor(diff / 3600);
  diff = diff % 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  // Format the time parts
  let result = "";
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (hours > 0 || minutes > 0) {
    result += `${minutes.toString().padStart(2, "0")}m `;
  }
  result += `${seconds.toString().padStart(2, "0")}s`;

  return result;
}
