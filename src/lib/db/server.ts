import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "$env/dynamic/public";
import { env as privateEnv } from "$env/dynamic/private";

// Get environment variables from SvelteKit env
const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || "";

// Supabase admin client for server-side usage (with service role key)
export const supabaseAdmin =
  supabaseServiceKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Drizzle connection (for type-safe queries)
// Use Supabase connection string: postgresql://postgres:[password]@[host]:5432/postgres
const connectionString = privateEnv.DATABASE_URL || "";

if (!connectionString) {
  console.warn("DATABASE_URL not set. Drizzle ORM will not be available.");
}

const client = connectionString ? postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;
export const db = client ? drizzle(client, { schema }) : null;

// Export schema for use in models
export * from "./schema";
