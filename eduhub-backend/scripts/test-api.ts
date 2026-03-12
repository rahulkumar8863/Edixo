import fetch from "node-fetch";

async function run() {
  try {
    console.log("Fetching folders...");
    const req1 = await fetch("http://localhost:4000/api/mockbook/folders", {
      headers: {
        "X-Org-Id": "GK-ORG-00001"
      }
    });
    console.log("Folders status:", req1.status);
    console.log(await req1.json());

    console.log("Fetching categories...");
    const req2 = await fetch("http://localhost:4000/api/mockbook/categories", {
      headers: {
        "X-Org-Id": "GK-ORG-00001"
      }
    });
    console.log("Categories status:", req2.status);
    console.log(await req2.json());
  } catch (err) {
    console.error(err);
  }
}

run();
