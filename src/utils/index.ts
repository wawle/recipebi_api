export function truncate(
  str: string | undefined,
  start: number,
  end: number,
  isDot?: boolean
): string {
  if (!str) return "";
  if (isDot) {
    if (str.length > end) return `${str.substring(start, end)}..`;
    else str.substring(start, end);
  }
  return str.substring(start, end);
}
