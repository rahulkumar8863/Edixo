const { Client } = require('pg');

async function testConnection(password) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // connect to default db first
        password: password,
        port: 5432,
    });

    try {
        await client.connect();
        console.log(`✅ Success with password: ${password}`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ Failed with password: ${password} - ${err.message}`);
        return false;
    }
}

async function run() {
    const passwords = ['password', 'postgres', 'admin', 'root', '123456', 'mysecret_123'];
    for (const pw of passwords) {
        if (await testConnection(pw)) break;
    }
}

run();
