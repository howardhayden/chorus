# Cloudflare production deployment

CHORUS deploys from the verified `main` branch to the canonical custom domain
`https://chorus.observer`. GitHub Actions holds the deployment credentials;
neither credential belongs in source, local save files, build artifacts, or
workflow logs.

## One-time account preparation

1. Confirm that `chorus.observer` is an active zone in the intended Cloudflare
   account. If the registrar is external, its nameservers must point to the two
   nameservers assigned by Cloudflare.
2. In Cloudflare, open **My Profile → API Tokens → Create Token**.
3. Start from the **Edit Cloudflare Workers** template.
4. Name the token `chorus-github-production`.
5. Restrict account resources to the one account that owns
   `chorus.observer`.
6. Restrict zone resources to the `chorus.observer` zone.
7. Create the token and copy it once. Do not paste it into an issue, pull
   request, commit, message, or documentation file.
8. Copy the Cloudflare account ID from the account overview. The account ID is
   an identifier, but it is still stored as a GitHub Actions secret so the
   deployment contract has one consistent credential boundary.

Cloudflare documents these two required CI values as
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## GitHub secrets

In `howardhayden/chorus`, open **Settings → Secrets and variables → Actions**.
Create these repository secrets:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | The restricted token created above |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID that owns the domain |

Never create these as repository variables, commit them to a configuration
file, or expose them through workflow output.

## First deployment

After both secrets exist:

1. Merge the deployment workflow into `main`.
2. Open **Actions → Deploy CHORUS to Cloudflare**.
3. Select **Run workflow**, with branch `main`.
4. Observe the verification, deployment, and route smoke-test stages.

The workflow also runs on every later push to `main`. Its concurrency group
permits only one production deployment at a time and does not cancel a running
deployment in favor of a newer push.

## Deployment contract

The workflow:

1. checks out the exact commit;
2. installs only the locked dependency graph with `npm ci`;
3. runs the complete retained release verification;
4. deploys the already-verified `dist/server/wrangler.json` with the repository's
   pinned Wrangler version; and
5. confirms that the application, notebook index, and evidence index respond
   through `chorus.observer`.

The committed Vite configuration keeps `workers.dev`, preview URLs, Logpush,
invocation-log persistence, and Worker observability disabled. It declares
`chorus.observer` as the custom-domain route. No database, remote save service,
analytics service, or application secret is required by CHORUS.

## Failure behavior

- Missing or invalid secrets stop before deployment.
- A failed release check prevents deployment.
- A failed Worker upload leaves the previous deployment active.
- A failed public-route check marks the workflow failed and requires inspection;
  it does not delete the previous Worker version.
- DNS or certificate propagation can take time on the first deployment. The
  smoke test retries each canonical route for up to two minutes.

## Rollback

Open **Cloudflare → Workers & Pages → chorus → Deployments**, select the last
known-good version, and roll back to it. Then rerun the three canonical route
checks. Do not change nameservers or delete the custom-domain route to roll
back application code.

## Credential rotation

Create a replacement restricted token, replace the
`CLOUDFLARE_API_TOKEN` GitHub secret, run a manual deployment, and then revoke
the previous token in Cloudflare. The account ID normally does not rotate.
