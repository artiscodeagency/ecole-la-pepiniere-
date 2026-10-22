#!/usr/bin/env bash
# Run ON the server, by hand:
#   bash ~/domains/<site>/app/current/../deploy/rollback.sh <site> [release-id]
# Without release-id: goes back to the release that was active before the
# current one (read from backups/deploys.log).
# Restores Laravel and the built site; media and .env are shared, untouched.
# It does NOT roll the database back. If a migration ran, restore by hand:
#   gunzip -c ~/domains/<site>/backups/db-<stamp>.sql.gz | mysql <database>
# (credentials: hPanel, or a 0600 options file made with mysql-defaults.php)
# Back to the old static site (before the first deploy):
#   tar -xzf ~/domains/<site>/backups/public_html-initial-<stamp>.tar.gz -C ~/domains/<site>/public_html
# (the "initial" archive is never rotated)
set -euo pipefail
umask 022

die() { echo "ERROR: $*" >&2; exit 1; }

SITE="${1:?site}"
[[ "$SITE" =~ ^[a-z0-9.-]+$ ]] || die "bad site name"
ROOT="$HOME/domains/$SITE"; APP="$ROOT/app"; WEB="$ROOT/public_html"; LOG="$ROOT/backups/deploys.log"
[ -L "$APP/current" ] || die "no active release"
CUR=$(basename "$(dirname "$(readlink "$APP/current")")")

if [ -n "${2:-}" ]; then
  TARGET="$2"
else
  line=$(grep " deploy $CUR " "$LOG" 2>/dev/null | tail -n 1 || true)
  prev=$(sed -n 's/.* prev=\([^ ]*\).*/\1/p' <<<"$line")
  [ -n "$prev" ] && [ "$prev" != "none" ] || die "no previous release recorded for $CUR; pass a release id: $(ls -1 "$APP/releases" | tr '\n' ' ')"
  TARGET=$(basename "$(dirname "$prev")")
fi
[[ "$TARGET" =~ ^[A-Za-z0-9._-]+$ ]] || die "bad release id"
[ "$TARGET" != "$CUR" ] || die "$TARGET is already active"
[ -f "$APP/releases/$TARGET/backend/artisan" ] && [ -f "$APP/releases/$TARGET/web/index.html" ] \
  || die "release $TARGET not found: $(ls -1 "$APP/releases" | tr '\n' ' ')"

echo "Rollback: $CUR -> $TARGET"
(cd "$APP/releases/$TARGET/backend" && php artisan optimize --no-interaction)
ln -sfn "$APP/releases/$TARGET/backend" "$APP/current.tmp"
mv -Tf "$APP/current.tmp" "$APP/current"
rsync -a --delete --exclude=/media --exclude=/.well-known --exclude=/.user.ini "$APP/releases/$TARGET/web/" "$WEB/"
echo "$(date +%Y%m%d-%H%M%S) rollback $CUR -> $TARGET" >> "$LOG"
echo "Done. Database not changed."
