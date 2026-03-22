import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 2;

  // 1. Enable WAL mode IMMEDIATELY.
  // This is the "Magic Fix" for the crashing during theme toggles.
  await db.execAsync("PRAGMA journal_mode = WAL;");

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) return;

  try {
    // PHASE 1: Fresh Installation
    if (currentDbVersion === 0) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          id_number TEXT UNIQUE NOT NULL,
          status TEXT DEFAULT 'Approved',
          loan_limit REAL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS loans (
          loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
          borrower_id INTEGER,
          amount_loaned REAL NOT NULL,
          interest REAL DEFAULT 0.20,
          transaction_cost REAL DEFAULT 0,
          total_repayment REAL NOT NULL,
          status TEXT DEFAULT 'Not Paid',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (borrower_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        INSERT OR IGNORE INTO settings (key, value) VALUES ('default_loan_limit', '5000');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('default_interest_rate', '0.2');
      `);
    }

    // PHASE 2: Migration for existing users (v1 -> v2)
    if (currentDbVersion === 1) {
      // We check if the column exists before adding to avoid "duplicate column" errors
      const tableInfo = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(users)",
      );
      const hasLoanLimit = tableInfo.some((col) => col.name === "loan_limit");

      if (!hasLoanLimit) {
        await db.execAsync(
          "ALTER TABLE users ADD COLUMN loan_limit REAL DEFAULT 0;",
        );
      }

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        INSERT OR IGNORE INTO settings (key, value) VALUES ('default_loan_limit', '5000');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('default_interest_rate', '0.2');
      `);
    }

    // Update the internal database version
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log(
      `Database successfully migrated to version ${DATABASE_VERSION}`,
    );
  } catch (error) {
    console.error("Migration Error:", error);
    // We don't throw here to prevent the app from getting stuck in a crash loop
  }
}
