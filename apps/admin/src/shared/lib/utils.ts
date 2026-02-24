export function generateTempId(): string {
  return `temp-${crypto.randomUUID()}`
}
