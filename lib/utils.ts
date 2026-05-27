import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. A lightweight utility helper to format Date objects to YYYY-MM-DD cleanly
export function formatToInputDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = new Date(date);

  // Guard against invalid date instances parsing into NaN values
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  // Months are 0-indexed in JS, so pad January (0) to become "01"
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
