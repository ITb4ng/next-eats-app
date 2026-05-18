const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required. Set it in your local environment only.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Database connection succeeded:", result.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});
