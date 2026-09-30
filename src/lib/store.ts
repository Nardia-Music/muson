"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createDemoAccount, matchesDemoAccount, type DemoAccount } from "./auth";
import {
  checkpoint,
  createSeed,
  transition,
  type Action,
  type State,
} from "./workflows";

type DemoStore = {
  data: State;
  hydrated: boolean;
  error: string;
  account: DemoAccount | null;
  signedIn: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  enterDemo: (role: State["role"]) => void;
  run: (action: Action) => boolean;
  reset: (name: Parameters<typeof checkpoint>[0]) => void;
  ready: () => void;
  clearError: () => void;
};

export const useDemo = create<DemoStore>()(
  persist(
    (set, get) => ({
      data: createSeed(),
      hydrated: false,
      error: "",
      account: null,
      signedIn: false,
      async signUp(name, email, password) {
        if (get().account) throw new Error("An account already exists in this browser. Log in or reset the demo account.");
        const account = await createDemoAccount(name, email, password);
        if (get().account) throw new Error("An account already exists in this browser. Please log in.");
        const data = createSeed();
        data.role = "candidate";
        data.profile = { name: account.name, email: account.email, phone: "", birthDate: "", guardian: "", prerequisite: false };
        data.applications[0].name = account.name;
        set({ account, signedIn: true, data, error: "" });
      },
      async signIn(email, password) {
        const account = get().account;
        if (!account || !(await matchesDemoAccount(account, email, password)) || get().account !== account) {
          throw new Error("Email or password does not match this browser's demo account.");
        }
        set({ signedIn: true, data: { ...get().data, role: "candidate" }, error: "" });
      },
      signOut() {
        set({ signedIn: false, data: { ...get().data, role: "visitor" }, error: "" });
      },
      enterDemo(role) {
        set({ signedIn: role !== "visitor", data: { ...get().data, role }, error: "" });
      },
      run(action) {
        try {
          set({ data: transition(get().data, action), error: "" });
          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "This action could not be completed.",
          });
          return false;
        }
      },
      reset(name) {
        set({ data: checkpoint(name), account: null, signedIn: true, error: "" });
      },
      ready() {
        set({ hydrated: true });
      },
      clearError() {
        set({ error: "" });
      },
    }),
    {
      name: "muson-demo-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ data: state.data, account: state.account, signedIn: state.signedIn }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.warn("Demo storage could not be restored", error);
      },
    },
  ),
);

export function startTheory(id: string) {
  return useDemo.getState().run({ type: "start-theory", id, now: Date.now() });
}
