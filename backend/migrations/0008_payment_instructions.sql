CREATE TABLE IF NOT EXISTS payment_instructions (
 currency TEXT PRIMARY KEY CHECK(currency IN ('USD','NGN','GBP','EUR')),
 instructions TEXT NOT NULL CHECK(length(trim(instructions)) BETWEEN 1 AND 3000),
 active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1)),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
