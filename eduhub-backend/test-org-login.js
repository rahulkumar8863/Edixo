const fetch = require('node-fetch'); // If needed, but fetch is global in node 20+
async function test() {
    const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgId: "demo-org", email: "orgadmin@eduhub.com", password: "password123", role: "ORG_STAFF" }),
    });
    const data = await res.json();
    console.log(data);
}
test().catch(console.error);
