import { supabaseAdmin, db } from "$lib/db/server";
import { supabase } from "$lib/db/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const results = {
    clientCheck: false,
    adminCheck: false,
    drizzleCheck: false,
    tablesCheck: false,
    authCheck: false,
    errors: [] as string[],
    details: {
      supabaseUrl: "",
      hasAnonKey: false,
      hasServiceKey: false,
      hasDatabaseUrl: false,
      tables: [] as string[],
    },
  };

  // 1. Check Client Supabase (PUBLIC vars)
  try {
    const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
    if (!error) {
      results.clientCheck = true;
      results.details.hasAnonKey = true;
    } else {
      results.errors.push(`Client check failed: ${error.message}`);
    }
  } catch (err) {
    results.errors.push(`Client check error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. Check Admin Supabase (SERVICE_ROLE)
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("profiles").select("count", { count: "exact", head: true });
      if (!error) {
        results.adminCheck = true;
        results.details.hasServiceKey = true;
      } else {
        results.errors.push(`Admin check failed: ${error.message}`);
      }
    } else {
      results.errors.push("Admin client not initialized - SUPABASE_SERVICE_ROLE_KEY missing");
    }
  } catch (err) {
    results.errors.push(`Admin check error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 3. Check Drizzle ORM (DATABASE_URL)
  try {
    if (db) {
      results.details.hasDatabaseUrl = true;
      
      // Try a simple query
      const testQuery = await db.execute`SELECT 1 as test`;
      if (testQuery) {
        results.drizzleCheck = true;
      }
    } else {
      results.errors.push("Drizzle ORM not initialized - DATABASE_URL missing");
    }
  } catch (err) {
    results.errors.push(`Drizzle check error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 4. Check if required tables exist
  try {
    if (db) {
      const tablesQuery = await db.execute`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'products', 'orders', 'order_items')
        ORDER BY table_name
      `;
      
      results.details.tables = tablesQuery.rows.map((row: any) => row.table_name);
      results.tablesCheck = results.details.tables.length === 4;
      
      if (!results.tablesCheck) {
        const missing = ["profiles", "products", "orders", "order_items"].filter(
          (t) => !results.details.tables.includes(t)
        );
        results.errors.push(`Missing tables: ${missing.join(", ")}`);
      }
    }
  } catch (err) {
    results.errors.push(`Tables check error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 5. Check Auth functionality
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (!error) {
        results.authCheck = true;
      } else {
        results.errors.push(`Auth check failed: ${error.message}`);
      }
    }
  } catch (err) {
    results.errors.push(`Auth check error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Get environment info (for display)
  results.details.supabaseUrl = process.env.PUBLIC_SUPABASE_URL || "Not set";

  return results;
};

