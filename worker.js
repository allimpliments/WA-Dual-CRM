// Cloudflare Worker – WhatsApp Webhook for 11 Avatar WA Dual CRM

const SERVICE_ACCOUNT = {
  client_email: "firebase-adminsdk-fbsvc@avatar-wa-dual-crm.iam.gserviceaccount.com",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyLj7Q+KJ1mB2M
/Qxf9bETEj9A4/v6g2raq6e9hNYrQ0Gft5uLRUrkcQgQuZG//DjnCDPhfe5jrEZK
YcxkG5Lr+EmFYN704q9db9yWRep8t7YBcxwO4r6x/OzOKXHtAADhjSw+60D0FAxw
yT3O/GmLiQ2HGwIgr75cPQpOl95ewc2c5toyXNNvREQ0US39kBVgLzk4SCpwKzZZ
QIaS1KpkcLBhSOHucD1LSFd8hzp96e2mPdu2G3DoGZd2VSfqDDNbWMj7Rci3BTa0
TEi1Ttf2n10zufiCOrvhtuaa0/yQKVKWmBTZXj7pO3txCAtHki0SsoisHTmBRgwo
DV8k/ScfAgMBAAECggEABduMWB1cZeZGzmxBPGRc2mYmqzDzhzRLzn2HKa1Uxx5S
aXhFRkpUYHcwzy/ykS+vBTVZU0frDt7KfsaBTCc16MkETby2B7HuFvHG/C+3Ojtl
4d1RZlHg+AP7Gvn001hFLyUPd9APFhcUo56SCBx3Mc2jIrZqFv4AEZM2JAhNGKtT
VLYbK9unJS1ZDwE9qUelrKnhw6UGDU6YfocQy5RMYKQX69EGr6xuSKtSaJd8s5Hi
FIEoCXS+QBxxzyu4fdKeUtDDg6YrWOC7rxnbAaDjmNIiwrUgHVlWIdUCZNvKi3Fv
ErL6nhKy+1KsCmctGZh7agGTDh+mTlpIv1K/2Uu5QQKBgQDc0+ouNgHfftnMM9ru
A4iOuuRsmnY2dJSSPXpKHCUTmkkxGBstdsWPHfABpPg1OLpZ3t1v16YBn10D3dtl
jkYqO17Gh06yUxPv403rV0EMthT6gJ0Eg4uGCDV1tAaeh+dZ7M9yi0Bx/fk602Qc
oNmbS793r3We0K9FZHQmL4KvwQKBgQDOj2z4v5lkmgimqBU2d/FuQBv+CvuEXtiN
CuUIKkXX6SuHnTD44nkT4EbrNdsH/xJFIfMZ3nwfocUU6yvpgT+hsvKptDm/HFff
C771/rZf0BuxrMUL8LqPXH0yLgNxQODkgdqJ0mLUOU5UNlvtIjnJRJqn/CezpFb1
JqLizumO3wKBgQDLFXzFeNeqIa/NM1dBEzDQCqKuGjNjCz3ja/R+GXojl/19z+yW
mCdB4kdqS7wUvhHrOqGtDMbXsSbKuordz8VJa4ZSz/cY2nx4XjO3nmvtc7rBUeyV
TSDQZ9Y6ZBC+VL/4HGf/sH7ZFrfRWL018tuNDVGNkWh7YPH/wE1tHL50QQKBgQDB
DGap7FeuIA+pwjlhGKQ5iA0hVp5Ozl3RI7d99BQmgDNAoXadhPvnyZo+Ra0ZQhiP
J/WN3dNftM7+h/QYXcVcmGQWmuvFYvX07YNhYNaNoW/glDnsuOWDCsuvVDW/aQVG
St42JLxc39oG9m7fpzceldF84jswt4zVvXBKTVsXPQKBgHB6vQteFC7s79Necwuo
Tx0Mc5lO9ok4M93S9XztRv46aEQYktHNUwA1Oh0SejVrEsJyV5VAAwaghr71QGET
XjrnrYj5ijT+lZXAiaE/q07dfJF8OeYcAliDGUWsJTo6gBJ4XFh95CO7h0aMjD/P
U9zgHs3EZPfAkxXe43z0SUm0
-----END PRIVATE KEY-----`,
  project_id: "avatar-wa-dual-crm"
};

const PRIVATE_KEY = SERVICE_ACCOUNT.private_key;
const VERIFY_TOKEN = "my_verify_token_123";
const PHONE_NUMBER_ID = "342354115627791";
const WHATSAPP_TOKEN = "EAA1OYCPXuvoBR2EO28cL1FgY7dZBfGohYPZByXicxZCE30QyaLhnMtvgaxRPi7mhVCzVmCLZBAiLU6XHT0420fFNsw2ZAwesmG0z9egSckC7WZCq4ja2MoZBvwR8dCY9IAdSpTzzaaNyTk71I4l2xjQ8DtFA7q9KN7scIU4cTTZBciySmKesOMqPgsqxM3g7cAZDZD";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/databases/(default)/documents`;

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const pemContents = PRIVATE_KEY
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    "pkcs8", binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3500,
    iat: now
  };

  const encoder = new TextEncoder();
  const base64url = (str) => btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(claim));
  const toSign = `${headerB64}.${payloadB64}`;
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(toSign));
  const sigB64 = base64url(String.fromCharCode(...new Uint8Array(sig)));
  const jwt = `${toSign}.${sigB64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  return data.access_token;
}

async function saveToFirestore(collection, docId, fields) {
  const token = await getAccessToken();
  const url = `${FIRESTORE_BASE}/${collection}?documentId=${encodeURIComponent(docId)}`;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });
}

function getAutoReply(body) {
  const msg = (body || "").toLowerCase();
  if (msg.includes("price") || msg.includes("pricing")) return "Our plans start at ₹999/month.";
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) return "Hello! How can I help you? 😊";
  if (msg.includes("support") || msg.includes("help")) return "Sure! Please describe your issue.";
  return null;
}

async function sendReply(to, text) {
  await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } })
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/health") {
    return new Response("OK", { status: 200 });
  }

  if (request.method === "GET" && url.pathname === "/test-firestore") {
    try {
      await saveToFirestore("messages", "test-" + Date.now(), {
        from: { stringValue: "test" },
        to: { stringValue: "test" },
        body: { stringValue: "Test OK" },
        type: { stringValue: "incoming" },
        waMessageId: { stringValue: "test-" + Date.now() },
        createdAt: { timestampValue: new Date().toISOString() }
      });
      return new Response("Status: 200 OK", { status: 200 });
    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  }

  if (request.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();

      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value || {};
            if (value.messages && value.messages.length > 0) {
              for (const msg of value.messages) {
                event.waitUntil(
                  saveToFirestore("messages", "wa-" + (msg.id || Date.now()), {
                    from: { stringValue: msg.from || "" },
                    to: { stringValue: PHONE_NUMBER_ID },
                    body: { stringValue: msg.text?.body || "(media)" },
                    type: { stringValue: "incoming" },
                    waMessageId: { stringValue: msg.id || "" },
                    createdAt: { timestampValue: new Date().toISOString() }
                  })
                );

                const replyText = getAutoReply(msg.text?.body || "");
                if (replyText) {
                  event.waitUntil(sendReply(msg.from, replyText));
                }
              }
            }
          }
        }
      }
      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
