# La Pépinière — API

API Laravel du site La Pépinière : contenus publics (actualités, annonces,
événements, galerie, documents, informations de l'école), formulaires de
contact et d'inscription, et authentification de l'administration.

Le site public et l'administration (React, à la racine du dépôt) l'appellent
sous `/api`, sur le même domaine.

## Prérequis

- PHP 8.4 (extensions : gd, exif, fileinfo, intl, mbstring, pdo_mysql, pdo_sqlite, zip)
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

Le port 8010 évite le port 8000, souvent occupé par d'autres projets.

Le seeder ne crée que les listes officielles (sections, catégories
d'actualités, catégories de galerie). Aucun compte ni contenu de démonstration.

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
