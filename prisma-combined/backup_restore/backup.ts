import { Client } from "pg";
import * as fs from "fs/promises";
import * as path from "path";

const connectionString = "postgresql://zonic:aduisg@localhost:5432/trello_db";
const target_schema = "public";
const output_dir = "backups";

async function runBackup() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("successfully connected to the database");

    await fs.mkdir(output_dir, { recursive: true });

    const tableQuery = `
    select table_name from information_schema.tables where table_schema = $1 and table_type = 'BASE TABLE';`;

    const result = await client.query(tableQuery, [target_schema]);
    const tables = result.rows.map((row) => row.table_name);

    console.log(`Found ${tables.length} tables to back up:`, tables);

    if (tables.length === 0) {
      console.log("No tables found. Exiting.");
      return;
    }

    // TODO : Extract Data as JSON
    for (const table of tables) {
      console.log(`Exporting table: ${table}...`);

      // We sanitize table/schema identifiers by quoting them to prevent injection vulnerabilities
      const exportQuery = `
        SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) AS json_data
        FROM (SELECT * FROM "${target_schema}"."${table}") t;
    `;

      const queryResult = await client.query(exportQuery);

      // The query returns a single row containing a structured JSON array string/object
      const jsonPayload = queryResult.rows[0].json_data;

      // Format the JSON data into a readable, pretty-printed string string
      const stringifiedData = JSON.stringify(jsonPayload, null, 2);

      // Construct the destination file path
      const filePath = path.join(output_dir, `${table}.json`);

      // Write the string file asynchronously
      await fs.writeFile(filePath, stringifiedData, "utf-8");
      console.log(`Saved ${table}.json successfully.`);
    }

    console.log(`All operations completed. View files in: ${output_dir}`);
  } catch (error) {
    console.log("error occured", error);
  } finally {
    await client.end();
    console.log("connection to database closed");
  }
}

runBackup();
