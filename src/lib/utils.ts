import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return new Intl.NumberFormat("en-IN").format(val);
}

export function formatDateIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// Advertising metric calculations with strict zero-denominator handling returning "N/A"
export function calculateCTR(clicks: number, impressions: number): string {
  if (!impressions || impressions <= 0) return "N/A";
  const ctr = (clicks / impressions) * 100;
  return `${ctr.toFixed(2)}%`;
}

export function calculateCPC(spend: number, clicks: number): string {
  if (!clicks || clicks <= 0) return "N/A";
  const cpc = spend / clicks;
  return `₹${cpc.toFixed(2)}`;
}

export function calculateCPM(spend: number, impressions: number): string {
  if (!impressions || impressions <= 0) return "N/A";
  const cpm = (spend / impressions) * 1000;
  return `₹${cpm.toFixed(2)}`;
}

export function calculateCPL(spend: number, leads: number): string {
  if (!leads || leads <= 0) return "N/A";
  const cpl = spend / leads;
  return `₹${cpl.toFixed(2)}`;
}

export function calculateCostPerMessage(spend: number, messages: number): string {
  if (!messages || messages <= 0) return "N/A";
  const cost = spend / messages;
  return `₹${cost.toFixed(2)}`;
}

export function calculateROAS(revenue: number, spend: number): string {
  if (!spend || spend <= 0) return "N/A";
  const roas = revenue / spend;
  return `${roas.toFixed(2)}x`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
