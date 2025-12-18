import { supabaseAdmin, db } from "$lib/db/server";
import { supabase } from "$lib/db/client";
import type { PageServerLoad } from "./$types";

// Helper to mask sensitive strings
function maskString(str: string | undefined): string {
  if (!str) return "Not set";
  if (str.length <= 8) return "***";
  return str.substring(0, 4) + "..." + str.substring(str.length - 4);
}

export const load: PageServerLoad = async () => {
  const env = {
    supabaseUrl: process.env.PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: process.env.PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    databaseUrl: process.env.DATABASE_URL || "",
  };

  // Environment variables status
  const connectionStatus = {
    supabaseConfigured: !!env.supabaseUrl && !!env.supabaseAnonKey,
    databaseConfigured: !!env.databaseUrl,
    serviceRoleConfigured: !!env.serviceRoleKey,
    supabaseUrl: env.supabaseUrl || "Not set",
    supabaseAnonKey: maskString(env.supabaseAnonKey),
    serviceRoleKey: maskString(env.serviceRoleKey),
    databaseUrl: env.databaseUrl
      ? env.databaseUrl.replace(/:[^:@]+@/, ":****@")
      : "Not set",
  };

  // Test 1: Supabase Auth Connection
  let authTest = {
    connected: false,
    error: null as string | null,
    details: "",
  };
  try {
    const { data, error } = await supabase.auth.getSession();
    authTest.connected = !error;
    authTest.error = error?.message || null;
    authTest.details = authTest.connected
      ? "Auth service is accessible"
      : "Cannot reach auth service";
  } catch (err: any) {
    authTest.error = err.message;
    authTest.details = "Failed to connect to Supabase Auth";
  }

  // Test 2: Supabase Database (via Supabase client)
  let supabaseTest = {
    connected: false,
    error: null as string | null,
    details: "",
    productCount: 0,
  };
  try {
    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: false })
      .limit(1);

    supabaseTest.connected = !error;
    supabaseTest.error = error?.message || null;
    supabaseTest.productCount = count || 0;
    supabaseTest.details = supabaseTest.connected
      ? `Found ${count || 0} products in database`
      : "Cannot query products table";
  } catch (err: any) {
    supabaseTest.error = err.message;
    supabaseTest.details = "Database connection failed";
  }

  // Test 3: Drizzle ORM Connection
  let drizzleTest = {
    connected: false,
    error: null as string | null,
    details: "",
  };
  if (db) {
    try {
      const result = await db.execute("SELECT 1 as test");
      drizzleTest.connected = true;
      drizzleTest.details = "Direct database connection working";
    } catch (err: any) {
      drizzleTest.error = err.message;
      drizzleTest.details = "SQL execution failed";
    }
  } else {
    drizzleTest.error = "DATABASE_URL not set";
    drizzleTest.details = "Drizzle ORM not initialized";
  }

  // Test 4: Service Role (Admin) Connection
  let adminTest = {
    connected: false,
    error: null as string | null,
    details: "",
  };
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      adminTest.connected = !error;
      adminTest.error = error?.message || null;
      adminTest.details = adminTest.connected
        ? `Admin access working (${data?.users?.length || 0} users found)`
        : "Admin access denied";
    } catch (err: any) {
      adminTest.error = err.message;
      adminTest.details = "Service role authentication failed";
    }
  } else {
    adminTest.error = "SUPABASE_SERVICE_ROLE_KEY not set";
    adminTest.details = "Admin client not initialized";
  }

  // Test 5: Database Schema Check
  let schemaTest = {
    connected: false,
    error: null as string | null,
    details: "",
    tables: [] as string[],
  };
  if (db) {
    try {
      // Try to query each expected table
      const tables = ["profiles", "products", "orders", "order_items"];
      const foundTables: string[] = [];

      for (const table of tables) {
        try {
          await db.execute(`SELECT 1 FROM ${table} LIMIT 1`);
          foundTables.push(table);
        } catch {
          // Table doesn't exist or no access
        }
      }

      schemaTest.connected = foundTables.length > 0;
      schemaTest.tables = foundTables;
      schemaTest.details =
        foundTables.length === tables.length
          ? "All tables exist"
          : `Found ${foundTables.length}/${tables.length} tables`;
    } catch (err: any) {
      schemaTest.error = err.message;
      schemaTest.details = "Cannot check schema";
    }
  } else {
    schemaTest.error = "Database not connected";
    schemaTest.details = "Cannot verify schema without DATABASE_URL";
  }

  // Overall health score
  const testsRun = 5;
  const testsPassed = [
    authTest,
    supabaseTest,
    drizzleTest,
    adminTest,
    schemaTest,
  ].filter((t) => t.connected).length;
  const healthScore = Math.round((testsPassed / testsRun) * 100);

  return {
    connectionStatus,
    authTest,
    supabaseTest,
    drizzleTest,
    adminTest,
    schemaTest,
    healthScore,
    timestamp: new Date().toISOString(),
  };
};
