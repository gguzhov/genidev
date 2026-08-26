import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("deploys only the static genidev release through a dedicated GitHub identity", async () => {
  const workflow = await read(".github/workflows/deploy.yml");

  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /dist\/client\//);
  assert.match(workflow, /DEPLOY_SSH_KEY/);
  assert.match(workflow, /DEPLOY_KNOWN_HOSTS/);
  assert.match(workflow, /\/srv\/genidev\/releases\/\$\{\{ github\.sha \}\}/);
  assert.match(workflow, /\/srv\/genidev\/current/);
  assert.doesNotMatch(workflow, /\/srv\/wedding|wedding\.genidev\.ru|data\.genidev\.ru/);
});

test("serves genidev.ru from its own root without changing sibling virtual hosts", async () => {
  const nginx = await read("ops/nginx/genidev.ru.conf");

  assert.match(nginx, /server_name genidev\.ru;/);
  assert.match(nginx, /root \/srv\/genidev\/current;/);
  assert.match(nginx, /try_files \$uri \$uri\/ \$uri\/index\.html \/index\.html;/);
  assert.match(nginx, /ssl_certificate \/etc\/letsencrypt\/live\/genidev\.ru\/fullchain\.pem;/);
  assert.doesNotMatch(nginx, /wedding\.genidev\.ru|data\.genidev\.ru|proxy_pass/);
});
