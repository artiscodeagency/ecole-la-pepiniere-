# La Pépinière

Site officiel du Groupe Scolaire Privé Bilingue La Pépinière, situé à Bertoua, Cameroun.

Le site est une application frontend statique construite avec React, TypeScript et Vite. Il présente l'école, ses sections maternelle et primaire, la vie scolaire, les admissions, la galerie, les actualités et les informations de contact.

## Technologies

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React

## Installation

Prérequis : Node.js et npm.

```bash
npm install
```

## Développement local

```bash
npm run dev
```

## Vérification et build production

```bash
npm run lint
npm run build
```

Le build de production est généré dans le dossier `dist`.

## Prévisualisation du build

```bash
npm run preview
```

## Déploiement Hostinger

Le projet peut être déployé comme site frontend statique. Après `npm run build`, téléversez le contenu du dossier `dist` dans le dossier public du domaine, généralement `public_html`.

Comme le site utilise `BrowserRouter`, configurez une réécriture vers `index.html` pour que les URLs internes fonctionnent lors d'un accès direct. Sur Apache, un fichier `.htaccess` placé dans le dossier public peut contenir :

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

## Routes principales

- `/`
- `/notre-ecole`
- `/maternelle`
- `/primaire`
- `/vie-scolaire`
- `/galerie`
- `/actualites`
- `/admissions`
- `/contact`
