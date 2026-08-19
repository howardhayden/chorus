import assert from "node:assert/strict";
import test from "node:test";

const productTitle = /<title>CHORUS — A Social Trust Simulation<\/title>/i;
const productDescription =
  /<meta(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']An interactive systems simulation about people, memes, machines, and manufactured social reality\.["'])[^>]*>/i;

test("renders only product-facing document metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, productTitle);
  assert.match(html, productDescription);
  assert.match(html, /href=["'](?:https:\/\/chorus\.observer)?\/favicon-32x32\.png["']/i);
  assert.match(html, /href=["'](?:https:\/\/chorus\.observer)?\/favicon\.ico["']/i);
  assert.match(html, /href=["'](?:https:\/\/chorus\.observer)?\/site\.webmanifest["']/i);
});
