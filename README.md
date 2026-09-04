# Stock Manager

Application mobile de gestion de stock réalisée dans le cadre d’un exercice
technique de recrutement. Elle permet de consulter les produits d’un entrepôt,
de rechercher et filtrer le catalogue, de gérer les entrées et sorties de stock,
ainsi que de créer ou modifier un produit.

## Fonctionnalités

- Liste des produits avec quantité, seuil d’alerte et statut visuel.
- Tableau de bord avec indicateurs, alertes prioritaires et répartition par
  catégorie.
- Recherche par nom ou référence et filtre par catégorie.
- Détail complet d’un produit.
- Entrées et sorties de stock avec protection contre les stocks négatifs.
- Création et modification avec validation des champs.
- États de chargement, liste vide et erreurs réseau avec nouvelle tentative.
- API REST connectée à une véritable base MySQL.

| Statut | Règle |
| --- | --- |
| Normal | quantité supérieure au seuil d’alerte |
| Stock faible | quantité comprise entre 1 et le seuil d’alerte |
| Rupture | quantité égale à 0 |

## Stack technique

### Application mobile

- Expo SDK 57
- React Native 0.86 et React 19
- TypeScript
- React Navigation 7
- `fetch` et `useState` pour garder une architecture adaptée à la taille du projet

### API

- Node.js et Express 5
- TypeScript
- Prisma 6
- MySQL 8

Versions utilisées pendant le développement : Node.js 24.15, npm 11.12,
Expo 57.0.20 et Prisma 6.12.

## Architecture

```text
.
├── App.tsx                    # Point d’entrée de l’application
├── src/
│   ├── components/           # Composants réutilisables
│   ├── navigation/           # Routes React Navigation typées
│   ├── screens/              # Tableau de bord, liste, détail et formulaire
│   ├── services/             # Client HTTP centralisé
│   ├── types/                # Types du domaine produit
│   └── utils/                # Calcul du statut de stock
└── server/
    ├── prisma/               # Schéma, migration et données initiales
    ├── src/
    │   ├── controllers/      # Validation HTTP et réponses
    │   ├── middleware/       # Gestion centralisée des erreurs
    │   ├── routes/           # Déclaration des endpoints
    │   └── services/         # Accès Prisma et règles métier
    └── tests/                # Test d’intégration de l’API
```

## Installation

Prérequis : Node.js, npm, MySQL Server 8 et Expo Go sur le téléphone. MySQL
Workbench peut être utilisé pour administrer la base graphiquement.

```bash
git clone https://github.com/ferieldekhili/stock-manager-mobile.git
cd stock-manager-mobile
npm install
npm install --prefix server
```

### 1. Configurer MySQL

Créer une base nommée `stock_manager` dans MySQL Workbench, ou exécuter :

```sql
CREATE DATABASE IF NOT EXISTS stock_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Préparer ensuite la configuration du serveur :

```bash
cp server/.env.example server/.env
```

Adapter ensuite `server/.env` avec les identifiants MySQL locaux :

```dotenv
PORT=3000
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/stock_manager"
```

Créer les tables et ajouter les neuf produits de démonstration :

```bash
npm run db:generate --prefix server
npm run db:migrate --prefix server
npm run db:seed --prefix server
```

### 2. Configurer l’application mobile

```bash
cp .env.example .env.local
```

Dans `.env.local`, remplacer l’adresse d’exemple par l’adresse IP locale de
l’ordinateur :

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Sur un iPhone physique, `localhost` désigne le téléphone et ne permet donc pas
de joindre le serveur. L’iPhone et l’ordinateur doivent être connectés au même
réseau Wi-Fi. Le pare-feu doit également autoriser les connexions au port 3000.

Sur macOS, l’adresse Wi-Fi peut généralement être obtenue avec :

```bash
ipconfig getifaddr en0
```

Les fichiers `.env` et `.env.local` sont ignorés par Git. La variable
`EXPO_PUBLIC_API_URL` ne doit contenir aucun secret, car elle est intégrée dans
l’application cliente.

## Lancement

Ouvrir deux terminaux à la racine du projet.

Terminal 1 — API :

```bash
npm run dev --prefix server
```

Terminal 2 — application Expo :

```bash
npx expo start
```

Scanner ensuite le QR code avec Expo Go. L’API répond sur
`http://ADRESSE_IP:3000` et son endpoint de santé est disponible sur `/health`.

## Endpoints API

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/products` | Récupérer les produits |
| `GET` | `/api/products/:id` | Récupérer un produit |
| `POST` | `/api/products` | Créer un produit |
| `PUT` | `/api/products/:id` | Modifier un produit |
| `PATCH` | `/api/products/:id/stock` | Effectuer une entrée ou une sortie |

Exemple de mouvement de stock :

```json
{
  "type": "OUT",
  "quantity": 2
}
```

L’API utilise les statuts HTTP `200`, `201`, `400`, `404`, `409` et `500`. La
référence d’un produit est unique. Les sorties sont réalisées atomiquement en
base afin que le stock ne puisse pas devenir négatif.

## Vérifications

Le serveur MySQL doit être démarré avant le test d’intégration.

```bash
# Vérifier TypeScript côté mobile et serveur
npm run check

# Tester le parcours complet de l’API
npm run test:api

# Compiler l’API
npm run build --prefix server

# Vérifier la création du bundle iOS
npx expo export --platform ios
```

Le test d’intégration couvre la liste, les validations, la création, le conflit
de référence, le détail, la modification et les mouvements de stock. Son produit
temporaire est supprimé automatiquement à la fin.

## Choix techniques

- L’état reste local aux écrans avec `useState` : un store global ajouterait de
  la complexité sans bénéfice pour ce projet.
- Les appels HTTP sont regroupés dans un service `fetch` unique et configurable.
- Les responsabilités de l’API sont séparées entre routes, contrôleurs et
  services sans multiplier les couches.
- MySQL garantit la persistance, l’unicité des références et des quantités non
  négatives. La sortie de stock est atomique pour éviter une course entre deux
  requêtes.
- Les notifications locales, indiquées comme bonus dans l’énoncé, ne sont pas
  incluses afin de conserver une application simple et centrée sur la gestion du
  stock.

## Captures d’écran

Les captures réelles du dernier test sur iPhone seront déposées dans
`docs/screenshots/` avant l’envoi du dépôt :

- `products.png` — liste, recherche et filtres ;
- `dashboard.png` — indicateurs et alertes prioritaires ;
- `product-detail.png` — détail et mouvement de stock ;
- `product-form.png` — formulaire de création.

## Auteur

Feriel Dekhili — exercice technique Développeur·se FullStack Mobile.
