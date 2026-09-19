/**
 * Safely convert any Firestore Timestamp, Date, string, or number to a JavaScript Date.
 */
export function toJsDate(val: any): Date {
  if (!val) return new Date();
  if (typeof val.toDate === 'function') {
    return val.toDate();
  }
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === 'number') {
    return new Date(val);
  }
  if (typeof val === 'string') {
    return new Date(val);
  }
  if (typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000);
  }
  return new Date();
}

/**
 * Safely get milliseconds from any Timestamp, Date, string, or number.
 */
export function toMillis(val: any): number {
  if (!val) return Date.now();
  if (typeof val.toMillis === 'function') {
    return val.toMillis();
  }
  return toJsDate(val).getTime();
}
