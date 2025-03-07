import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ClanWarLeagueWar, CurrentWar } from "@/types/clash";

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
 * @param war War object
 * @returns Number of attacks per member (1 for CWL, 2 for regular war)
 */
export function getWarAttacksPerMember(
  war: CurrentWar | ClanWarLeagueWar
): number {
  // Check if it's a CWL war (has warLeague property or is accessed via a war tag)
  if ("warLeague" in war || "warTags" in war) {
    return 1;
  }
  return 2;
}

/**
 * Format a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format the date
    return format(date, "MMM d, yyyy h:mm a");
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
  const endTime = new Date(endTimeString).getTime();
  const now = Date.now();

  // If the end time has passed, return empty string
  if (now >= endTime) {
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
