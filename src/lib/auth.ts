import { z } from "zod";

const credentials = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(8, "Use at least 8 characters for your demo password."),
});

export type DemoAccount = {
  name: string;
  email: string;
  salt: number[];
  verifier: number[];
};

export function candidateDestination(value: string | null) {
  const routes = ["/candidate", "/candidate/profile", "/candidate/register", "/candidate/application", "/candidate/theory", "/candidate/practical", "/candidate/results", "/candidate/appeals"];
  try {
    const url = new URL(value || "/candidate", "https://demo.invalid");
    if (url.origin === "https://demo.invalid" && routes.includes(url.pathname.replace(/\/$/, ""))) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {}
  return "/candidate";
}

async function passwordVerifier(password: string, salt: number[]) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits));
}

export async function createDemoAccount(name: string, email: string, password: string) {
  const parsed = credentials.safeParse({ name, email: email.trim(), password });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
  return {
    name: parsed.data.name,
    email: parsed.data.email,
    salt,
    verifier: await passwordVerifier(password, salt),
  } satisfies DemoAccount;
}

export async function matchesDemoAccount(account: DemoAccount, email: string, password: string) {
  if (account.email !== email.trim().toLowerCase()) return false;
  const verifier = await passwordVerifier(password, account.salt);
  return verifier.every((value, index) => value === account.verifier[index]);
}