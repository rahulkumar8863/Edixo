const { Client } = require('pg');

async function run() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'eduhub_db'");
        if (res.rowCount === 0) {
            console.log("Creating eduhub_db...");
            await client.query("CREATE DATABASE eduhub_db");
            console.log("✅ Created eduhub_db successfully.");
        } else {
            console.log("✅ eduhub_db already exists.");
        }
        await client.end();
    } catch (err) {
        console.error("❌ Error checking/creating database:", err.message);
        process.exit(1);
    }
}

run();
