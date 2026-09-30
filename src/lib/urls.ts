export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string, prefix = basePath) {
  return `${prefix}/${path.replace(/^\/+/, "")}`;
}

export function verificationUrl(number: string, origin: string) {
  const url = new URL(asset("verify/"), origin);
  url.searchParams.set("number", number);
  return url.toString();
}
