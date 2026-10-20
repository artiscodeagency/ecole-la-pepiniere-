# La Pépinière — API

API Laravel du site La Pépinière : contenus publics (actualités, annonces,
événements, galerie, documents, informations de l'école), formulaires de
contact et d'inscription, et authentification de l'administration.

Le site public et l'administration (React, à la racine du dépôt) l'appellent
sous `/api`, sur le même domaine.

## Prérequis

- PHP 8.4 (extensions : gd, exif, fileinfo, intl, mbstring, pdo_mysql, pdo_sqlite, zip).
  Vérifiez avec `php -v` : le PHP 8.2 de XAMPP provoque l'erreur « Composer detected
  issues in your platform ». En local, PHP 8.4 est dans `C:\php\8.4` ; après une
  modification du PATH, VS Code doit être entièrement redémarré pour la voir.
- Composer
- MySQL ou MariaDB (XAMPP en local)

## Installation locale

```bash
composer install
cp .env.example .env
php artisan key:generate
# Créer la base `pepiniere` (utf8mb4), puis :
php artisan migrate --seed
php artisan pepiniere:create-director
php artisan serve --host=127.0.0.1 --port=8010
```

Ports fixes : 8010 pour l'API, 5180 pour le site et l'administration (Vite),
qui redirige `/api` vers l'API. Ils évitent 8000 et 5173, souvent pris par d'autres projets.

Le seeder ne crée que les listes officielles (sections, catégories
d'actualités, catégories de galerie). Aucun compte ni contenu de démonstration.

Photos d'origine du site : `php artisan pepiniere:import-gallery` les importe
une fois dans la galerie (versions WebP optimisées, album par photo listé dans
la commande ; `--dry-run` pour vérifier, `--dir=` pour un autre dossier que
`src/assets`). Relancée, elle n'importe rien deux fois. À lancer aussi en
production, après avoir envoyé le dossier des photos sur le serveur.

## Tests

```bash
php artisan test
```

Ils utilisent SQLite en mémoire. Pour les lancer sur MariaDB (base `pepiniere_test`) :

```bash
DB_CONNECTION=mysql DB_DATABASE=pepiniere_test php artisan test
```

## Comptes

- Aucune inscription publique : le premier Directeur est créé avec
  `php artisan pepiniere:create-director`.
- Tant que l'école n'a pas de boîte mail, la réinitialisation par email
  n'arrive pas : le Directeur redéfinit le mot de passe de l'assistante
  depuis l'administration, et `php artisan pepiniere:reset-password <email>`
  le fait depuis le serveur.
