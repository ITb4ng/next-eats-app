const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:XBzGPxadQmVZ3uTy@db.onvxbcfictsydqdgwuuz.supabase.co:5432/postgres'
});

async function test() {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('DB connected:', res.rows[0]);
  } catch (e) {
    console.error('DB connection error:', e);
  } finally {
    await client.end();
  }
}

test();