// See https://kit.svelte.dev/docs/types#app
// for information about these files
import type { User, Session } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      session: Session | null;
      role: "user" | "admin" | null;
    }
    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
