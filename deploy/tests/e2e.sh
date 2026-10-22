#!/usr/bin/env bash
# CI end-to-end test of the deploy scripts, the .htaccess routing and media
# persistence, in containers (needs Docker). Never touches a real server.
#   bash deploy/tests/e2e.sh release.tgz
set -euo pipefail

ARCHIVE="$(realpath "${1:?release.tgz}")"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
SITE=lapepiniere.test
H=/srv/home
ROOT="$H/domains/$SITE"
WEB_PORT=8080
fails=0

pass() { printf '  PASS  %s\n' "$*"; }
fail() { printf '  FAIL  %s\n' "$*"; fails=$((fails + 1)); }
check() { local label="$1"; shift; if "$@"; then pass "$label"; else fail "$label"; fi; }

as_site() { docker exec -u www-data -e HOME="$H" pepweb bash -c "$1"; }
as_root() { docker exec pepweb bash -c "$1"; }

# GET through Apache as the browser would see it behind Hostinger's HTTPS proxy.
fetch() { # path -> sets CODE, BODY, HEAD
  local tmp; tmp=$(mktemp)
  HEAD=$(curl -s -D - -o "$tmp" -H "Host: $SITE" -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$WEB_PORT$1")
  CODE=$(printf '%s' "$HEAD" | awk 'NR==1 {print $2}')
  BODY=$(cat "$tmp"); rm -f "$tmp"
}
is_site()  { [[ "$BODY" == *"<title>Groupe Scolaire"* ]]; }
is_admin() { [[ "$BODY" == *"<title>Administration | La P"* ]]; }
expect() { # path code kind(site|admin|json|text:<needle>|any)
  fetch "$1"
  local ok=1
  [ "$CODE" = "$2" ] || ok=0
  case "$3" in
    site) is_site || ok=0 ;;
    admin) is_admin || ok=0 ;;
    json) [[ "$HEAD" == *"application/json"* ]] || ok=0 ;;
    text:*) [[ "$BODY" == *"${3#text:}"* ]] || ok=0 ;;
  esac
  check "GET $1 -> $2 ($3) [got $CODE]" test "$ok" = 1
}

cleanup() { docker rm -f pepweb pepdb >/dev/null 2>&1 || true; docker network rm pepnet >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

echo "== Containers"
docker build -q -t pep-e2e "$REPO/deploy/tests" >/dev/null
docker network create pepnet >/dev/null
# Throwaway test credentials (not secrets). The password has a quote and a #
# to prove the MySQL options file escaping.
docker run -d --name pepdb --network pepnet \
  -e MARIADB_ROOT_PASSWORD=root-ci -e MARIADB_DATABASE=pepiniere \
  -e MARIADB_USER=pep -e 'MARIADB_PASSWORD=ci#pa"ss' mariadb:11 >/dev/null
docker run -d --name pepweb --network pepnet -p "$WEB_PORT:80" \
  -v "$REPO/deploy:/repo/deploy:ro" -v "$ARCHIVE:/repo/release.tgz:ro" pep-e2e >/dev/null
for _ in $(seq 60); do
  docker exec pepdb mariadb -upep -p'ci#pa"ss' -e 'select 1' pepiniere >/dev/null 2>&1 && break; sleep 2
done
as_root 'php -r "exit(function_exists(\"proc_open\") ? 1 : 0);"' && pass "proc_open disabled in the test box" || fail "proc_open still enabled"

echo "== Fake Hostinger account with the current static site"
KEY=$(as_root 'php -r "echo base64_encode(random_bytes(32));"')
as_root "set -e
mkdir -p $ROOT/public_html/media $ROOT/app/shared
echo '<title>old static site</title>' > $ROOT/public_html/index.html
echo old > $ROOT/public_html/old-page.html
echo old-photo > $ROOT/public_html/media/old.jpg
echo upload_max_filesize=20M > $ROOT/public_html/.user.ini
cat > $ROOT/app/shared/.env <<'ENV'
APP_NAME=\"La Pépinière\"
APP_ENV=production
APP_KEY=base64:$KEY
APP_DEBUG=false
APP_URL=https://$SITE
FRONTEND_URL=https://$SITE
LOG_CHANNEL=single
DB_CONNECTION=mysql
DB_HOST=pepdb
DB_PORT=3306
DB_DATABASE=pepiniere
DB_USERNAME=pep
DB_PASSWORD='ci#pa\"ss'
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=$SITE
SANCTUM_STATEFUL_DOMAINS=$SITE
CACHE_STORE=database
QUEUE_CONNECTION=sync
SPA_INDEX_PATH=$ROOT/public_html/index.html
ENV
chown -R www-data:www-data $H
chmod 600 $ROOT/app/shared/.env
sed -ri 's#DocumentRoot .*#DocumentRoot $ROOT/public_html\n\t<Directory $H/domains>\n\t\tAllowOverride All\n\t\tRequire all granted\n\t</Directory>#' /etc/apache2/sites-available/000-default.conf
apache2ctl -k graceful"
sleep 2

deploy() { # release migrations initial
  as_site "cp /repo/release.tgz /tmp/$1.tgz && bash /repo/deploy/remote-deploy.sh $SITE $1 /tmp/$1.tgz $2 $3; s=\$?; rm -f /tmp/$1.tgz; exit \$s"
}
old_site_intact() { as_site "grep -q 'old static site' $ROOT/public_html/index.html && test -f $ROOT/public_html/old-page.html && test -f $ROOT/public_html/media/old.jpg"; }

echo "== 1. First deploy refused without allow-initial"
if deploy r0 1 0; then fail "deploy without allow-initial should fail"; else pass "refused"; fi
check "old site untouched" old_site_intact
check "no release left behind" as_site "test ! -e $ROOT/app/releases/r0"

echo "== 2. Initial deploy without migrations aborts on the empty database"
if deploy r0 0 1; then fail "should fail on an empty DB"; else pass "aborted"; fi
check "old site untouched" old_site_intact
check "aborted release removed" as_site "test ! -e $ROOT/app/releases/r0"
check "no app/current" as_site "test ! -e $ROOT/app/current"

echo "== 3. Initial deploy with migrations"
check "deploy r1" deploy r1 1 1
check "DB backup verified and private" as_site "f=\$(ls $ROOT/backups/db-*.sql.gz | tail -n 1); gzip -t \$f && test \$(stat -c %a \$f) = 600"
check "docroot backup holds the old site" as_site "tar -tzf \$(ls -t $ROOT/backups/public_html-*.tar.gz | head -n 1) | grep -q old-page.html"
check "old media folder moved to backups, not deleted" as_site "test -f \$(ls -d $ROOT/backups/old-public_html-media-* | head -n 1)/old.jpg"
check "public_html/media is a symlink to shared storage" as_site "test \"\$(readlink $ROOT/public_html/media)\" = $ROOT/app/shared/storage/app/public/media"
check "old static page replaced" as_site "test ! -e $ROOT/public_html/old-page.html"
check "initial backup named and kept apart" as_site "ls $ROOT/backups/public_html-initial-*.tar.gz >/dev/null"
check ".user.ini kept in public_html" as_site "grep -q upload_max_filesize $ROOT/public_html/.user.ini"
check "seed is a separate explicit step" as_site "cd $ROOT/app/current && php artisan db:seed --force --no-interaction >/dev/null"
as_site "echo ci-media > $ROOT/app/shared/storage/app/public/media/ci-probe.txt"

echo "== Routing"
expect / 200 site
expect /notre-ecole 200 site
expect /actualites 200 site
expect /actualites/article-inconnu 404 site
expect /admin 200 admin
expect /admin/connexion 200 admin
expect /admin/actualites/12 200 admin
expect /up 200 any
expect /robots.txt 200 "text:Disallow: /admin"
expect /sitemap.xml 200 "text:<urlset"
expect /api/public/school-info 200 json
expect /api/route-inexistante 404 json
expect /sanctum/csrf-cookie 204 any
check "csrf cookie is Secure" grep -qi '^set-cookie: XSRF-TOKEN=.*secure' <<<"$HEAD"
expect /media/ci-probe.txt 200 text:ci-media
expect /media/absent.webp 404 any
expect /.htaccess 403 any
asset=$(as_site "ls $ROOT/public_html/assets | grep -m1 '\.js$'")
expect "/assets/$asset" 200 any
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $SITE" "http://127.0.0.1:$WEB_PORT/contact")
check "plain http redirects to https [got $code]" test "$code" = 301

echo "== 4. Second deploy keeps media"
check "deploy r2" deploy r2 0 0
check "media survived" as_site "grep -q ci-media $ROOT/app/shared/storage/app/public/media/ci-probe.txt"
check "initial backup not rotated" as_site "ls $ROOT/backups/public_html-initial-*.tar.gz >/dev/null"
expect /media/ci-probe.txt 200 text:ci-media
check "current is r2" as_site "readlink $ROOT/app/current | grep -q /r2/"

echo "== 5. Rollback"
check "rollback.sh" as_site "bash $ROOT/app/releases/r2/deploy/rollback.sh $SITE"
check "current is r1" as_site "readlink $ROOT/app/current | grep -q /r1/"
expect /media/ci-probe.txt 200 text:ci-media
expect / 200 site

echo "== 6. Cron command runs without proc_open"
check "pepiniere:prune-media" as_site "cd $ROOT/app/current && php artisan pepiniere:prune-media --no-interaction"

echo
if [ "$fails" -gt 0 ]; then
  echo "$fails check(s) failed"; docker logs pepweb 2>&1 | tail -n 30
  as_root "tail -n 40 $ROOT/app/shared/storage/logs/laravel.log 2>/dev/null" || true
  exit 1
fi
echo "All e2e checks passed"
