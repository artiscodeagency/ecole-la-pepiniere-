# Deployment — Hostinger (lapepiniere.artischools.com)

GitHub Actions builds everything (React `dist/`, Laravel `vendor/`) and sends one
archive over SSH. The server never runs Node or Composer.

## Layout on the server

```
~/domains/lapepiniere.artischools.com/
├─ public_html/          built site + index.php + .htaccess (document root)
│  └─ media -> ../app/shared/storage/app/public/media
├─ app/
│  ├─ releases/<id>/     backend/ web/ deploy/   (5 kept, plus active and previous)
│  ├─ current -> releases/<id>/backend
│  └─ shared/            .env (chmod 600) + storage/ (media, logs, sessions) — never deleted
└─ backups/              db-*.sql.gz, public_html-*.tar.gz (10 kept, chmod 600), deploys.log
```

Routing (`public_html/.htaccess`): `/api`, `/sanctum`, `/up`, `/actualites/{slug}` → Laravel;
`/media/*` → files only; existing files → served; `/admin*` → `admin.html`; everything else → `index.html`.

## Hostinger restrictions taken into account

- **`proc_open` is disabled.** Composer needs it to run its scripts (`package:discover`) and
  `php artisan about` needs it, so neither runs on the server: `vendor/` comes from CI, and the
  boot check is `deploy/preflight.php`. `migrate`, `db:seed`, `optimize` and the `pepiniere:*`
  commands do not need it (the CI e2e test runs them with `proc_open` disabled).
- **The Laravel scheduler (`schedule:run`) does not work:** it starts each task with
  Symfony Process (`proc_open`). The cron job calls the command directly (below).
- **`pepiniere:create-director` / `reset-password` prompts:** Laravel Prompts needs `stty`
  through `proc_open`; it falls back to plain questions. Run them with `ssh -t`. If the password
  input cannot be hidden it may be shown on screen while typed (not stored anywhere).
- PHP 8.4 is required (Symfony 8 in `composer.lock` needs ≥ 8.4.1).

## Each operation is separate and explicit

| Operation | How | Default |
|---|---|---|
| Create the database | hPanel → Databases (by hand) | — |
| Read-only diagnostics | workflow with `dry_run` | on |
| First deploy (replaces the static site) | workflow input `allow_initial` | off |
| Migrations | workflow input `run_migrations` | off |
| Reference data seed | `ssh -t … 'cd ~/domains/<site>/app/current && php artisan db:seed --force'` | by hand |
| Director account | `ssh -t … 'cd …/app/current && php artisan pepiniere:create-director'` | by hand |
| Gallery import | upload the photos folder, then `php artisan pepiniere:import-gallery --dir=<folder> --dry-run`, then without `--dry-run` | by hand |

`remote-deploy.sh` order: checks (PHP, tools, disk space, `.env` chmod 600) → unpack → preflight
→ **verified** DB dump and docroot archive → migrations if asked → `optimize` → switch
`app/current` → replace `public_html`. Any failure before the switch removes the new release and
leaves the site unchanged. A real `public_html/media` folder from the old site is moved to
`backups/`, never deleted.

## Cron (hPanel → Advanced → Cron Jobs, custom command)

Daily, e.g. 03:00:

```
cd /home/u133979320/domains/lapepiniere.artischools.com/app/current && /usr/bin/php artisan pepiniere:prune-media >> /home/u133979320/domains/lapepiniere.artischools.com/app/shared/storage/logs/cron.log 2>&1
```

Use the PHP 8.4 binary that `diagnose.sh` lists under "PHP binaries for cron". Replace any
`schedule:run` job: it cannot work with `proc_open` disabled.

`crontab -l` over SSH can show nothing even when hPanel has jobs: hPanel keeps its cron jobs
in its own system, not in the crontab that the SSH session sees. The reliable check is the
log: `diagnose.sh` prints when `cron.log` was last written.

## Rollback

```
bash ~/domains/lapepiniere.artischools.com/app/releases/<active>/deploy/rollback.sh lapepiniere.artischools.com [release-id]
```

Restores the previous release's Laravel code and built site; media and `.env` are untouched.
The database is **not** rolled back: if a migration ran, restore `backups/db-<stamp>.sql.gz`.
Back to the old static site: extract `backups/public_html-initial-<stamp>.tar.gz` into
`public_html` (that archive is never rotated). `rsync` never deletes `media`, `.well-known` or
`.user.ini` in `public_html`.

## Running scripts from Windows

`.gitattributes` forces LF. For a manual run, strip CR anyway:

```
tr -d '\r' < deploy/diagnose.sh | ssh -p 65002 u133979320@<host> 'bash -s -- lapepiniere.artischools.com'
```

## GitHub secrets (environment `production`)

`SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`
