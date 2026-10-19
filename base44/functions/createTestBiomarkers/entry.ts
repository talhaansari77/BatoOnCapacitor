// Test data must never be inserted into or replace client medical records.
// This legacy endpoint remains explicitly disabled for all callers.
Deno.serve(() => Response.json(
  { error: "Test data generation is disabled in BATO. Use a separate test app for demonstrations." },
  { status: 403 }
));
