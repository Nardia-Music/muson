"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
        set({ data: checkpoint(name), error: "" });
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
      partialize: (state) => ({ data: state.data }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.warn("Demo storage could not be restored", error);
      },
    },
  ),
);

export function startTheory(id: string) {
  return useDemo.getState().run({ type: "start-theory", id, now: Date.now() });
}
