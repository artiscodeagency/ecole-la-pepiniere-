# HANDOFF — La Pépinière CMS

Running log of the work turning the static public site into an administrable
site. **Read this first when a session starts**, then update it at every
stop (new commit, validated step, decision, open problem).

Last updated: 2026-10-20 — stage 4, after the Événements group (Galerie next).

---

## 1. Rules of the project (from the brief)

- The existing public site is the **visual reference**: no redesign, no route
  removed, no invented or fictitious data presented as real.
- Work in **stages**, and inside stages 3–4 **module by module**. After each
  one: test, report (done / files modified / files created / tests / problems /
  public site still works), then **STOP and wait for validation**. Never start
  the next step on your own.
- Each fix of a known issue is its own isolated, verifiable change.
- Provisional or fictitious content is never turned into official data.
- Contradictory official information: report it, don't pick one.

## 2. Architecture (validated stage 1)

| Part | Where | Notes |
|---|---|---|
| Public site | `src/` (React 19 + Vite + Tailwind 4, `index.html`) | FR/EN via `useLanguage`; static content in `src/data/school.ts` |
| Admin | `src/admin/` (second Vite entry `admin.html`, served at `/admin`) | French UI only (D15), React Query |
| API | `backend/` (Laravel 13, PHP 8.4) | `/api/public/*`, `/api/auth/*`, `/api/admin/*` — routes in `backend/routes/api.php` |
| Auth | Sanctum SPA cookie session, same domain | roles `director` / `assistant`, gates `manage-content`, `manage-school-info`, `manage-users`; 2 h idle (D11); login throttled |
| DB | MySQL (local: XAMPP MariaDB, DBs `pepiniere` + `pepiniere_test`) | seeder = official lists only, no demo content |
| Media | `backend/storage/app/public/media`, served as `/media` | GD/Intervention: WebP variants 400/1024/1920 + og.jpg, EXIF stripped, original not kept; outside the frontend build so deploys never delete uploads |
| SEO | `NewsSharePageController` injects meta for `/actualites/:slug` | per-article title/description/image |
| Hosting target | Hostinger PHP/MySQL, SSH + Composer, no Node server | currently a subdomain → no hardcoded domain |

## 3. Decisions D1–D17 (validated 2026-10-04, plus later answers)

- **D1** PHP 8.4 (local: `C:\php\8.4\php.exe`; XAMPP's 8.2 untouched).
- **D2** assistant publishes directly (actions logged). **D3** assistant may delete photos, director restores. **D5** assistant has a reduced dashboard.
- **D4** announcement end date mandatory.
- **D6** events reuse the 12 news categories.
- **D7** urgent/pinned announcements = banner under the header; announcements + "Agenda" blocks on `/actualites` and home; **no new nav item; no event detail page**.
- **D8** news: cover image only, no inline images.
- **D9** levels: anglophone primary = Class 1 to Class 6; no levels for pré-maternelle/maternelle; francophone primary levels **not supplied yet** — don't invent.
- **D10** admission statuses: nouveau / en cours / traité. **D12** retention period: to be set by the school.
- **D11** session 2 h idle, no "remember me".
- **D13** hide the 3 fictitious testimonials (**not done yet**); keep provisional stats for now. **D14** hide social icons until real URLs exist.
- **D15** admin UI French only; content FR + optional EN, falls back to FR (never "undefined").
- **D16** the site is LIVE with forms that used to fake success → interim fix: forms open WhatsApp with a pre-filled message (commit `21358c3`), to be replaced by the API.
- **D17** Hostinger: SSH + Composer + cron; **no domain mailbox yet** → password reset by email unavailable; director resets the assistant's password in the admin, or `php artisan pepiniere:reset-password <email>`.
- Official email: **gsbpepiniere92@gmail.com** (`bc8fe8a`). Main phone + WhatsApp: **694 797 162** (`4442b82`); older numbers kept in the lists.

## 4. Progress

### Stage 1 — Architecture ✅ validated 2026-10-04
### Stage 2 — Backend + DB ✅ (`e08bf20`)
### Stage 3 — Admin ✅ all modules committed
| Module | Commit |
|---|---|
| Login / forgot / reset password | `d42c7e7`, `0aaecef` |
| Dashboard + navigation | `6bcbc61` |
| Actualités (+ photo uploads) | `c1683fc` |
| Annonces | `c9d0330` |
| Événements | `31c2760` |
| Galerie | `50be149` |
| Messages de contact | `5c6ead5` |
| Demandes d'inscription | `37b2a49` |
| Infos école: contacts, horaires, réseaux | `c359bc4` |
| Frais, pièces à fournir, transport | `268a37c` |
| Documents PDF | `6812d22` (+ shown on Vie scolaire: `1178ab3`) |
| Niveaux, équipe de direction, FAQ | `6ff8332` |
| Utilisateurs + profil | `2270af8` |

### Stage 4 — Connect the public site (in progress)
| Group | Status | Commit |
|---|---|---|
| Actualités (list, home, `/actualites/:slug`) | ✅ | `3c963cb` |
| Annonces (banner + blocks on home, /actualites, Maternelle, Primaire) | ✅ | `cfdc0d8` |
| Événements ("Agenda" on home (3) and /actualites) | ✅ committed, visual check by user pending | `49fd213` |
| **Galerie** (public gallery from the API instead of `src/assets`) | ⏭ next | — |
| Formulaires (contact + admission → API, replacing WhatsApp) | to do | — |
| Infos école (contacts, fees, FAQ, team… from `/api/public/school-info` instead of `school.ts`) | to do — confirm scope with user | — |

Public pattern used so far: hooks in `src/lib/api/public*.ts` (React Query),
`useApiText()` for FR/EN fallback, blocks that render **nothing** while
loading / on error / when empty so the page looks as before.

### Stage 5 — Migrate confirmed official data: not started
### Stage 6 — Hostinger prep (build, .htaccess, storage, HTTPS, backups): not started — never deploy automatically

## 5. Open items / known issues

- D13: the 3 fictitious testimonials still show on the home page (`Testimonials` in `src/App.tsx`) — separate isolated change, waiting for the user's go.
- Francophone primary levels not supplied by the school (D9).
- `backend/app/Enums/enm.txt` = the user's pasted brief, untracked; not code, keep out of commits.
- Visual checks: Chrome tooling was disconnected in past sessions → the user checks desktop/mobile rendering themselves.

## 6. Local environment

- API: `cd backend && C:/php/8.4/php.exe artisan serve --host=127.0.0.1 --port=8010`
- Site + admin: Vite on **5180** (strictPort), proxies `/api`, `/sanctum`, `/media` to 8010. The user often has it running already — reuse it, don't kill it.
- **Never touch port 8000 / 5173 or `localhost`→::1 processes**: they belong to the user's other project (routier+237).
- Checks before each stop: `npx tsc -b`, `npx oxlint src`, `npx vite build`, `php artisan test` (or `--filter=Public…`).
- Smoke tests: delete only rows you created; curl uploads with `C:/…` paths; JSON with accents from a UTF-8 file; target `127.0.0.1:8010`.
- Known local false failure: `MediaUploadTest::test_a_script_disguised_as_a_photo_is_refused_from_its_content` (antivirus blocks the temp file).

## 7. Session log

- **2026-10-04** Stage 1 validated (D1–D17); stage 2 backend built.
- **2026-10-05 → 10-20** Stage 3 admin modules, one commit each (table above). Official email and phone set.
- **2026-10-20** Stage 4: Actualités connected (`3c963cb`). Annonces audited and committed (`cfdc0d8`). Événements/Agenda built and committed (`49fd213`). This HANDOFF.md created. Next: Galerie group.
