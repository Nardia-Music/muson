import { describe, expect, it } from "vitest";
import { candidateDestination, createDemoAccount, matchesDemoAccount } from "./auth";
import { useDemo } from "./store";

describe("browser-local demo credentials", () => {
  it("normalizes identity, verifies credentials, and never stores the password", async () => {
    const account = await createDemoAccount("  Tola Bello  ", " TOLA@example.test ", "demo-password");
    expect(account.name).toBe("Tola Bello");
    expect(account.email).toBe("tola@example.test");
    expect(JSON.stringify(account)).not.toContain("demo-password");
    expect(await matchesDemoAccount(account, "TOLA@example.test", "demo-password")).toBe(true);
    expect(await matchesDemoAccount(account, "tola@example.test", "wrong-password")).toBe(false);
    expect(await matchesDemoAccount(account, "other@example.test", "demo-password")).toBe(false);
  });

  it("rejects incomplete sign-ups", async () => {
    await expect(createDemoAccount("", "tola@example.test", "demo-password")).rejects.toThrow("full name");
    await expect(createDemoAccount("Tola Bello", "not-an-email", "demo-password")).rejects.toThrow("valid email");
    await expect(createDemoAccount("Tola Bello", "tola@example.test", "short")).rejects.toThrow("8 characters");
  });

  it("uses a different salt for each account", async () => {
    const first = await createDemoAccount("Tola Bello", "tola@example.test", "demo-password");
    const second = await createDemoAccount("Tola Bello", "tola@example.test", "demo-password");
    expect(first.salt).not.toEqual(second.salt);
    expect(first.verifier).not.toEqual(second.verifier);
  });

  it("only returns to known candidate routes", () => {
    expect(candidateDestination("/candidate/application/?step=2")).toBe("/candidate/application/?step=2");
    for (const target of [null, "https://example.com", "//example.com/candidate", "/admin", "/candidate/unknown", "javascript:alert(1)"]) {
      expect(candidateDestination(target)).toBe("/candidate");
    }
  });

  it("creates one local candidate, preserves progress on logout, and resets credentials with checkpoints", async () => {
    useDemo.getState().reset("start");
    useDemo.getState().signOut();
    await useDemo.getState().signUp("Tola Bello", "tola@example.test", "demo-password");
    expect(useDemo.getState().signedIn).toBe(true);
    expect(useDemo.getState().data.profile.name).toBe("Tola Bello");
    expect(useDemo.getState().data.applications[0].name).toBe("Tola Bello");
    await expect(useDemo.getState().signUp("Other Name", "other@example.test", "another-password")).rejects.toThrow("already exists");
    useDemo.getState().signOut();
    expect(useDemo.getState().signedIn).toBe(false);
    expect(useDemo.getState().data.profile.name).toBe("Tola Bello");
    await expect(useDemo.getState().signIn("tola@example.test", "wrong-password")).rejects.toThrow("does not match");
    expect(useDemo.getState().signedIn).toBe(false);
    await useDemo.getState().signIn("tola@example.test", "demo-password");
    expect(useDemo.getState().signedIn).toBe(true);
    useDemo.getState().reset("start");
    expect(useDemo.getState().account).toBeNull();
    useDemo.getState().signOut();
  });
});