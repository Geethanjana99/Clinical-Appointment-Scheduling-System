// src/utils/dateHelpers.ts

/**
 * Date and time utility functions
 */

/**
 * Format a date string or Date object to a readable format
 * @param date - Date string or Date object
 * @param format - Format string (default: 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  format: string = 'MM/DD/YYYY'
): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  const formatMap: Record<string, string> = {
    'MM': month,
    'DD': day,
    'YYYY': String(year),
    'YY': String(year).slice(-2),
    'HH': hours,
    'mm': minutes,
  };
  
  return format.replace(/MM|DD|YYYY|YY|HH|mm/g, (match) => formatMap[match]);
};

/**
 * Format time in 12-hour format with AM/PM
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return 'N/A';
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if a date is today
 */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (Math.abs(diffMins) < 1) return 'just now';
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  }
  
  return formatDate(date);
};

/**
 * Check if a time slot is available (not in the past)
 */
export const isTimeSlotAvailable = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date} ${time}`);
  return slotDateTime > new Date();
};

/**
 * Get estimated wait time based on queue position
 */
export const estimateWaitTime = (position: number, avgTimePerPatient: number = 15): string => {
  const minutes = position * avgTimePerPatient;
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
};
