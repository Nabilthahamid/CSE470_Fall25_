import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { supabase } from "$lib/db/client";
import { db } from "$lib/db/server";

export const GET: RequestHandler = async () => {
  let testsRun = 0;
  let testsPassed = 0;

  // Test 1: Supabase Auth
  testsRun++;
  try {
    const { error } = await supabase.auth.getSession();
    if (!error) testsPassed++;
  } catch {
    // Failed
  }

  // Test 2: Supabase Database
  testsRun++;
  try {
    const { error } = await supabase.from("products").select("count").limit(1);
    if (!error) testsPassed++;
  } catch {
    // Failed
  }

  // Test 3: Drizzle ORM
  testsRun++;
  if (db) {
    try {
      await db.execute("SELECT 1");
      testsPassed++;
    } catch {
      // Failed
    }
  }

  const health = Math.round((testsPassed / testsRun) * 100);

  let message = "";
  if (health >= 80) {
    message = "All systems operational";
  } else if (health >= 60) {
    message = "Some services unavailable";
  } else {
    message = "Setup required";
  }

  return json({
    health,
    message,
    testsPassed,
    testsRun,
    timestamp: new Date().toISOString(),
  });
};
