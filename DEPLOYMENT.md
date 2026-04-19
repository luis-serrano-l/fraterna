# iOS Deployment Checklist

CI/CD pipeline: merge to `main` → EAS cloud build → App Store submission + screenshots upload.
No Mac required locally. Free macOS GitHub runner (requires public repo).

---

## Phase 0 — One-time setup

### 0a. App Store Connect — Find your App ID
- [ ] Log in to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- [ ] Open your app → copy the **numeric App ID** from the URL (e.g. `6478392011`)

### 0b. App Store Connect — API Key
- [ ] Users & Access → Integrations → App Store Connect API → Generate Key
  - Role: **App Manager**
- [ ] Download `.p8` file (only available once — store securely)
- [ ] Copy **Key ID** and **Issuer ID**

### 0c. EAS token
- [ ] Go to [expo.dev](https://expo.dev) → Account (top right) → Access Tokens → Create Token
- [ ] Copy the token

### 0d. GitHub Secrets
Repo → Settings → Secrets and variables → Actions → New repository secret

| Secret name | Value |
|---|---|
| `EXPO_TOKEN` | Token from 0c |
| `ASC_API_KEY_ID` | Key ID from 0b |
| `ASC_API_KEY_ISSUER_ID` | Issuer ID from 0b |
| `ASC_API_KEY_CONTENT` | Full contents of `.p8` file |
| `ASC_APP_ID` | Numeric App ID from 0a |

- [ ] All 5 secrets added

---

## Phase 1 — Repo settings

### 1a. Set repo public
- [ ] Repo → Settings → Danger Zone → Change visibility → **Public**

### 1b. Protect main branch
- [ ] Repo → Settings → Branches → Add rule
  - Branch name pattern: `main`
  - ✅ Require a pull request before merging
  - ✅ Require status checks to pass
  - ✅ Do not allow bypassing the above settings
- [ ] After first CI run: add `deploy` job as required status check

---

## Phase 2 — Store assets

### 2a. Screenshots
Place PNG files in the correct folders (replace `.gitkeep`):

```
store-assets/screenshots/en-US/
  iPhone65Inch/    ← 6.5" (1242×2688 or 1284×2778 px) — required
    01_home.png
    02_notes.png
    03_history.png
  iPhone55Inch/    ← 5.5" (1242×2208 px) — required
    01_home.png
    02_notes.png
    03_history.png
```

- [ ] 6.5" screenshots added
- [ ] 5.5" screenshots added

### 2b. Metadata
Edit files in `store-assets/metadata/en-US/`:

- [ ] `name.txt` — app name (max 30 chars)
- [ ] `subtitle.txt` — short tagline (max 30 chars)
- [ ] `description.txt` — full description (max 4000 chars)
- [ ] `keywords.txt` — comma-separated (max 100 chars total)
- [ ] `release_notes.txt` — what's new (update each release)

---

## Phase 3 — First deploy

- [ ] Commit all changes and open a PR
- [ ] Merge PR to `main`
- [ ] Watch Actions tab → `Deploy iOS to App Store` job (~30–60 min total)
- [ ] Verify build in [Expo dashboard](https://expo.dev)
- [ ] Verify submission in App Store Connect → TestFlight
- [ ] Verify screenshots in App Store Connect → App → App Store → Screenshots

---

## Ongoing — Each release

1. Update `store-assets/metadata/en-US/release_notes.txt`
2. Make changes on a branch → open PR → merge to `main`
3. CI handles build, submission, and screenshot upload automatically
4. Version number auto-increments (`autoIncrement: true` in `eas.json`)

---

## Secrets reference

| Secret | Where to find it |
|---|---|
| `EXPO_TOKEN` | [expo.dev](https://expo.dev) → Account (top right) → Access Tokens → Create Token |
| `ASC_API_KEY_ID` | App Store Connect → Users & Access → Integrations → API Keys |
| `ASC_API_KEY_ISSUER_ID` | Same page as Key ID |
| `ASC_API_KEY_CONTENT` | Downloaded `.p8` file contents |
| `ASC_APP_ID` | App Store Connect → App URL (numeric ID) |

## Key files

| File | Purpose |
|---|---|
| `.github/workflows/deploy-ios.yml` | CI workflow |
| `eas.json` | EAS build + submit config |
| `fastlane/Fastfile` | Screenshot + metadata upload lane |
| `store-assets/screenshots/` | App Store screenshots |
| `store-assets/metadata/` | App Store text metadata |
