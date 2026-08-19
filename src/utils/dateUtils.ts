/**
 * Utility functions for consistent date & time formatting across Lone Worker Safety modules
 */

export const formatDisplayDate = (dateVal: string | number | null | undefined): string => {
  if (!dateVal) {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  const d = typeof dateVal === 'number' ? new Date(dateVal) : new Date(dateVal);
  if (isNaN(d.getTime())) {
    return String(dateVal);
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export const formatDateGroupHeader = (dateVal: string | number | null | undefined): string => {
  return formatDisplayDate(dateVal).toUpperCase();
};

export const formatDisplayTime = (timeVal: string | number | null | undefined): string => {
  if (!timeVal) return '--:--';
  if (typeof timeVal === 'number') {
    const d = new Date(timeVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  const str = String(timeVal);
  if (str.includes('AM') || str.includes('PM')) {
    return str;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  return str;
};

export const isToday = (dateVal: string | number | null | undefined): boolean => {
  if (!dateVal) return false;
  const today = new Date();
  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.toDateString() === today.toDateString();
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return d.toDateString() === today.toDateString();
  }
  const todayFormatted = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  return String(dateVal).toLowerCase() === todayFormatted.toLowerCase();
};

export const isYesterday = (dateVal: string | number | null | undefined): boolean => {
  if (!dateVal) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.toDateString() === yesterday.toDateString();
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return d.toDateString() === yesterday.toDateString();
  }
  const yesterdayFormatted = yesterday.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  return String(dateVal).toLowerCase() === yesterdayFormatted.toLowerCase();
};

export const isWithinDays = (dateVal: string | number | null | undefined, days: number): boolean => {
  if (!dateVal) return false;
  const now = Date.now();
  const cutoff = now - days * 86400000;
  if (typeof dateVal === 'number') {
    return dateVal >= cutoff;
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return d.getTime() >= cutoff;
  }
  return true;
};
