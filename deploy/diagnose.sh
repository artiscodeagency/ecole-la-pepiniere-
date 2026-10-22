#!/usr/bin/env bash
# Read-only Hostinger diagnostics: changes nothing, prints no secret (never reads .env).
# Only side effects: a temp dir in /tmp for the symlink test (removed at once)
# and three GET requests to the site.
# From Windows, strip CR so the script also works from a CRLF checkout:
#   tr -d '\r' < deploy/diagnose.sh | ssh -p 65002 u133979320@<host> 'bash -s -- lapepiniere.artischools.com'
SITE="${1:-lapepiniere.artischools.com}"
ROOT="$HOME/domains/$SITE"
ok() { printf '  [OK]  %s\n' "$*"; }
ko() { printf '  [!!]  %s\n' "$*"; }

echo "== PHP CLI ($(command -v php))"
php -v | head -n 1
php -r 'exit(version_compare(PHP_VERSION,"8.4.1",">=")?0:1);' \
  && ok "PHP >= 8.4.1 (composer.lock: Symfony 8)" || ko "PHP < 8.4.1: choose 8.4 in hPanel"
for m in pdo_mysql mbstring openssl tokenizer xml ctype fileinfo gd intl bcmath curl zip; do
  php -m | grep -qix "$m" && ok "ext $m" || ko "ext $m missing"
done
php -r 'echo "  memory_limit=",ini_get("memory_limit")," upload_max_filesize=",ini_get("upload_max_filesize")," post_max_size=",ini_get("post_max_size"),PHP_EOL;'
php -r 'echo "  disabled_functions=",ini_get("disabled_functions") ?: "(none)",PHP_EOL;'
php -r 'echo function_exists("gd_info") && (gd_info()["WebP Support"] ?? false) ? "  [OK]  GD WebP\n" : "  [!!]  GD without WebP\n";'

echo "== PHP binaries for cron (cron may not use the same php as SSH)"
for p in /usr/bin/php /usr/local/bin/php /opt/alt/php84/usr/bin/php; do
  [ -x "$p" ] && echo "  $p -> $("$p" -r 'echo PHP_VERSION;' 2>/dev/null)"
done

echo "== Tools"
for t in git tar gzip rsync mariadb-dump mysqldump mysql; do
  command -v "$t" >/dev/null && ok "$t: $("$t" --version 2>&1 | head -n 1)" || ko "$t absent"
done
command -v composer >/dev/null && echo "  composer present (not needed: vendor/ is built in CI)"

echo "== Site layout"
[ -d "$ROOT/public_html" ] && ok "public_html: $(find "$ROOT/public_html" -mindepth 1 | wc -l) entries, $(du -sh "$ROOT/public_html" | cut -f1)"
[ -e "$ROOT/public_html/media" ] && { [ -L "$ROOT/public_html/media" ] && echo "  public_html/media is a symlink" || ko "public_html/media is a real folder (it will be moved to backups, not deleted)"; }
[ -f "$ROOT/public_html/.user.ini" ] && echo "  public_html/.user.ini present (kept by deploys)"
[ -d "$ROOT/public_html/.well-known" ] && echo "  public_html/.well-known present (kept by deploys)"
[ -f "$ROOT/public_html/.htaccess" ] && { grep -qiE 'AddHandler|SetHandler|php_value|php_flag' "$ROOT/public_html/.htaccess" \
  && ko "current .htaccess has PHP handler/settings lines (the new one replaces it; copy them over if needed)" \
  || echo "  current .htaccess: no PHP handler lines"; }
[ -L "$ROOT/app/current" ] && ok "app/current -> $(readlink "$ROOT/app/current")" || echo "  app/current absent: first deploy needs allow_initial"
if [ -f "$ROOT/app/shared/.env" ]; then
  [ "$(stat -c %a "$ROOT/app/shared/.env")" = "600" ] && ok "shared/.env exists, chmod 600 (content not read)" || ko "shared/.env is not chmod 600"
else
  echo "  shared/.env not created yet"
fi
[ -d "$ROOT/backups" ] && echo "  backups: $(find "$ROOT/backups" -maxdepth 1 -type f | wc -l) files"

echo "== Symlinks"
t=$(mktemp -d) && ln -s "$t" "$t/l" && [ -L "$t/l" ] && ok "ln -s works"; rm -rf "$t"

echo "== HTTP"
curl -sI "https://$SITE/" | head -n 3 | sed 's/^/  /'
for p in /up /api/public/school-info; do
  curl -s -o /dev/null -w "  $p -> %{http_code}\n" "https://$SITE$p"
done

echo "== Cron"
echo "  crontab -l (hPanel jobs may not appear here, see deploy/README.md):"
crontab -l 2>/dev/null | sed 's/^/    /' || echo "    (empty or not readable)"
L="$ROOT/app/shared/storage/logs/cron.log"
[ -f "$L" ] && echo "  cron.log last written: $(date -r "$L" '+%Y-%m-%d %H:%M')" || echo "  cron.log absent (the cron job has not run yet)"

echo "== Disk"
df -h "$HOME" | tail -n 1 | sed 's/^/  /'
