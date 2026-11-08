import { Client } from "pg";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString =
  "postgresql://zonic:aduisg@localhost:5432/trello_db_test";
const TARGET_SCHEMA = "public";
const BACKUP_DIR = path.join(__dirname, "backups");

async function runRestore() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL for restoration.");

    // 1. Read all files inside the backup directory
    const files = await fs.readdir(BACKUP_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      console.log("No backup .json files found to restore.");
      return;
    }

    console.log(`Found ${jsonFiles.length} files to restore.`);

    // TODO: Restoration loop starts.

    for (const file of jsonFiles) {
      // Deduce the table name by stripping the '.json' extension
      const tableName = path.basename(file, ".json");
      const filePath = path.join(BACKUP_DIR, file);

      console.log(`Analyzing backup file for table: ${tableName}...`);

      // 1. Read and parse the JSON file
      const fileContent = await fs.readFile(filePath, "utf-8");
      const records = JSON.parse(fileContent);

      // Handle the edge case of an empty table backup
      if (!Array.isArray(records) || records.length === 0) {
        console.log(
          `Skipping ${tableName}: File contains an empty array (No schema info available).`,
        );
        continue;
      }

      // 2. DYNAMICALLY GENERATE THE CREATE TABLE STATEMENT
      // We inspect the keys of the very first record to determine the column names
      const sampleRecord = records[0];
      const columnDefinitions: string[] = [];

      for (const [key, value] of Object.entries(sampleRecord)) {
        let columnType = "TEXT"; // Fallback default data type

        if (typeof value === "number") {
          // Check if it's an integer or a floating-point decimal
          columnType = Number.isInteger(value) ? "INTEGER" : "NUMERIC";
        } else if (typeof value === "boolean") {
          columnType = "BOOLEAN";
        } else if (value instanceof Object) {
          columnType = "JSONB"; // Handle nested objects or arrays natively
        } else if (typeof value === "string") {
          // Simple check to guess if the string string is a timestamp
          const isTimestamp = !isNaN(Date.parse(value)) && isNaN(value as any);
          if (isTimestamp && value.includes("-")) {
            columnType = "TIMESTAMP";
          }
        }

        // Wrap columns in quotes to protect against reserved keywords (like "user" or "order")
        columnDefinitions.push(`"${key}" ${columnType}`);
      }

      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS "${TARGET_SCHEMA}"."${tableName}" (
                    ${columnDefinitions.join(",\n                    ")}
                );
            `;

      console.log(`Creating table structure for "${tableName}"...`);
      await client.query(createTableQuery);

      // 3. GENERATE THE BULK INSERT STATEMENT
      const columns = Object.keys(sampleRecord)
        .map((col) => `"${col}"`)
        .join(", ");

      console.log(`Streaming ${records.length} records into "${tableName}"...`);

      // To avoid hit-performance limits or query character caps, insert chunks of rows
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);

        // Use a subquery to transform the JSON chunk straight into matching rows
        const insertQuery = `
                    INSERT INTO "${TARGET_SCHEMA}"."${tableName}" (${columns})
                    SELECT * FROM json_to_recordset($1) AS (${columnDefinitions.join(", ")});
                `;

        // Stringify just this specific chunk array and pass it to the query
        await client.query(insertQuery, [JSON.stringify(chunk)]);
      }

      console.log(`Successfully recreated and restored table: ${tableName}`);
    }

    console.log("✨ All tables recreated and datasets restored perfectly.");
  } catch (error) {
    console.error("Restoration failed:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runRestore();
