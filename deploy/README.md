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
  through `proc_open`; it falls back to plain questions (Symfony), which hide the password with
  `stty` through `shell_exec`. Run them with `ssh -t` (they need a terminal). If `diagnose.sh`
  lists `shell_exec` in `disabled_functions`, the password is shown on screen while typed (never
  stored): change it afterwards in the admin.
- PHP 8.4 is required (Symfony 8 in `composer.lock` needs ≥ 8.4.1).

## Production `.env` (once, before the first deploy)

1. hPanel → Databases → MySQL: create an empty database and its user (all privileges on that
   database). Keep the three values for step 3; they never go into the repository.
2. From your computer (Git Bash, repository root), create the folder and upload the template
   under its own name (an existing `.env` is never overwritten):

   ```
   ssh -p 65002 u133979320@<host> 'mkdir -p ~/domains/lapepiniere.artischools.com/app/shared && chmod 711 ~/domains/lapepiniere.artischools.com/app ~/domains/lapepiniere.artischools.com/app/shared'
   scp -P 65002 deploy/env.production.example u133979320@<host>:domains/lapepiniere.artischools.com/app/shared/env.production.example
   ```

3. On the server: create `.env` from the template only if it does not exist, lock it, generate
   `APP_KEY` straight into it only if it has none (the key is never typed, printed or stored in
   the shell history), then fill `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`:

   ```
   cd ~/domains/lapepiniere.artischools.com/app/shared
   chmod 711 .                            # the web server must cross it to reach media; .env stays 600
   if [ -e .env ]; then echo "STOP: .env already exists, not replaced"; else cp env.production.example .env && chmod 600 .env; fi
   if grep -q '^APP_KEY=base64:' .env; then echo "APP_KEY already set: not changed"; else sed -i "s|^APP_KEY=.*|APP_KEY=base64:$(php -r 'echo base64_encode(random_bytes(32));')|" .env; fi
   grep -c '^APP_KEY=base64:' .env       # must print 1 (prints a count, not the key)
   nano .env                             # DB_* only; do not touch APP_KEY
   stat -c %a .env                       # must print 600
   ```

   Each key must appear once (if a key is repeated, Laravel keeps the **last** one). A password with `#`, `$`,
   `"` or spaces goes in single quotes; avoid the `'` character. Never generate a new `APP_KEY`
   once the site is live (sessions and encrypted values would be lost).
4. Check without reading the file: the workflow with `dry_run` runs `diagnose.sh`, which must show
   `shared/.env exists, chmod 600`. The real deploy then runs `deploy/preflight.php` (production
   mode, no debug, key set, https URL, secure cookie, writable storage, database answers) and
   stops before any change if one check fails.

## Each operation is separate and explicit

| Operation | How | Default |
|---|---|---|
| Create the database | hPanel → Databases (by hand) | — |
| Read-only diagnostics | workflow with `dry_run` | on |
| First deploy (replaces the static site) | workflow input `allow_initial` | off |
| Migrations (`php artisan migrate --force`, after the verified DB backup) | workflow input `run_migrations`; required on the first deploy (empty database) | off |
| Reference data seed (`DatabaseSeeder` → `ReferenceDataSeeder`, `updateOrCreate`: safe to re-run) | `ssh -t -p 65002 u133979320@<host> 'cd ~/domains/lapepiniere.artischools.com/app/current && php artisan db:seed --force'` | by hand |
| Director account (asks name, email, password twice; refuses an email already used) | `ssh -t -p 65002 u133979320@<host> 'cd ~/domains/lapepiniere.artischools.com/app/current && php artisan pepiniere:create-director'` | by hand |
| Reset a password | same, `php artisan pepiniere:reset-password <email>` | by hand |
| Gallery import (the default folder `src/assets` does not exist on the server) | upload the photos folder, then `php artisan pepiniere:import-gallery --dir=<absolute folder> --dry-run`, then without `--dry-run` | by hand |

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

## Rollback to the previous release (application only)

```
bash ~/domains/lapepiniere.artischools.com/app/current/../deploy/rollback.sh lapepiniere.artischools.com [release-id]
```

Without `release-id` it goes back to the release that was active before the current one
(`backups/deploys.log`). It runs `optimize` in that release, switches `app/current` and syncs its
built site into `public_html`; `media`, `.well-known`, `.user.ini`, `.env` and `shared/storage`
are untouched. It refuses when there is no previous release, so it cannot undo the **first**
deploy (see below).

Limits — **the database is never rolled back**:

- Without migrations in between, nothing else is needed.
- If the newer release ran migrations, the older code may not match the schema. The only way back
  is the dump taken just before that deploy (`db=` on its line in `backups/deploys.log`).
  Restoring it **erases everything written since** (messages, admission requests, edits, users).
  Photos uploaded since stay in `shared/storage` but lose their database rows.

  ```
  cd ~/domains/lapepiniere.artischools.com
  grep ' deploy ' backups/deploys.log | tail -n 3          # read the db=… file of the deploy to undo
  F=backups/db-<stamp>.sql.gz                              # type that one exact file name
  CNF=$(umask 077; mktemp)
  test -f "$F" && gzip -t "$F" \
    && php app/current/../deploy/mysql-defaults.php app/current cnf > "$CNF" \
    && DB=$(php app/current/../deploy/mysql-defaults.php app/current name) \
    && gunzip -c "$F" | mysql --defaults-extra-file="$CNF" "$DB" \
    && echo "restored from $F"
  rm -f "$CNF"
  ```

  `F` names one file typed by hand (no wildcard). Nothing is restored unless that file exists and
  passes `gzip -t`; without "restored from …", nothing was done or the restore failed. Use
  `mariadb` instead of `mysql` if only that client exists. The password stays in the 0600
  temporary file, never on the command line; `rm -f` removes only that temporary file.

## Back to the old static site (after the first deploy)

The first deploy archived the static site, `media`, `.user.ini` and `.well-known` included, in
`backups/public_html-initial-<stamp>.tar.gz` (never rotated, verified entry by entry before any
change). Its `media` folder was also moved, unchanged, to `backups/old-public_html-media-<stamp>`.
Aborted attempts can leave several `initial` archives: the right one is the `web=` file of the
deploy that ran with `prev=none`. The steps below never overwrite a file: the archive is unpacked
into a new empty folder, then the two folders are swapped (one second without a site).

```
cd ~/domains/lapepiniere.artischools.com
STAMP=$(date +%Y%m%d-%H%M%S)
NEW="public_html.static-$STAMP"; OLD="public_html.cms-$STAMP"

# 1. The archive of the successful first deploy: one line (tail -n 1), one file.
F=$(grep ' prev=none ' backups/deploys.log | tail -n 1 | sed -n 's/.* web=\([^ ]*\).*/\1/p')
test -n "$F" && test -f "$F" && gzip -t "$F" && echo "archive ok: $F"

# 2. Unpack into a NEW folder (mkdir fails if it exists): nothing existing is touched.
test -f "$F" && gzip -t "$F" && mkdir "$NEW" && tar -xzf "$F" -C "$NEW" && ls -la "$NEW"
#    expect the old index.html, media/, .user.ini

# 3. Copy the current SSL challenge files into the new folder only (no --delete).
[ -d "$NEW" ] && [ -d public_html/.well-known ] && rsync -a public_html/.well-known/ "$NEW/.well-known/"

# 4. Swap, only if the new folder is there and the CMS name is free (mv -T never moves a
#    folder into another one). The CMS docroot is kept as public_html.cms-<stamp>.
[ -f "$NEW/index.html" ] && [ ! -e "$OLD" ] && mv -T public_html "$OLD" && mv -T "$NEW" public_html \
  && echo "static site restored; CMS docroot kept in $OLD"
```

Each step runs only if the previous checks pass; without the final message, `public_html` was
not changed. Nothing is deleted: the archive, `backups/` and the CMS docroot all stay.

`.user.ini` is never changed by a deploy, so the archived copy is the current one
(`cmp public_html/.user.ini "$OLD/.user.ini"` to check). The media are restored by
the archive itself; `backups/old-public_html-media-<stamp>` stays as a second copy. Laravel
(`app/`), its database and its uploads are left as they are; disable the cron job. Deploying
again later is a normal deploy (`app/current` exists), with a fresh verified backup first.

## Running scripts from Windows

`.gitattributes` forces LF. For a manual run, strip CR anyway:

```
tr -d '\r' < deploy/diagnose.sh | ssh -p 65002 u133979320@<host> 'bash -s -- lapepiniere.artischools.com'
```

## GitHub secrets (environment `production`)

`SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`
