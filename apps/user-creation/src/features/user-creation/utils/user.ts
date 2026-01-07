export function generateEmailFromName(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, "")}@example.com`;
}
