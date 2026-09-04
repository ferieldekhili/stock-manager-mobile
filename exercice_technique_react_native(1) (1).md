# Exercice Technique — Développeur Full Stack Mobile
## Application de Gestion de Stock

**Durée estimée :** 2 à 3 jours  
**Rendu attendu :** Dépôt Git (GitHub / GitLab) avec un `README.md` expliquant comment lancer le projet

---

## Contexte

Vous devez développer une application mobile de **gestion de stock** pour un entrepôt fictif. L'application doit permettre à un gestionnaire de consulter l'état de son stock, d'ajouter ou retirer des articles, et d'être alerté en cas de rupture imminente.

---

## Stack technique attendue

- **React Native** (avec Expo ou React Native CLI, au choix)
- **TypeScript** (obligatoire)
- **React Navigation** pour la navigation
- **Backend :** Les technos sont au choix, mais pas de simulation du backend avec local Storage, il faut mettre en place une base de données dédiée, et au moins 3 endpoints.
- Gestion d'état : `useState` / `useReducer` / Zustand / Redux Toolkit (au choix)

---

## Fonctionnalités attendues

### 1. Liste des produits (écran principal)
- Afficher tous les produits en stock sous forme de liste ou de cartes
- Chaque produit affiche : nom, catégorie, quantité en stock, seuil d'alerte
- Indicateur visuel de l'état du stock :
  - 🟢 Normal (quantité > seuil)
  - 🟡 Faible (quantité ≤ seuil)
  - 🔴 Rupture (quantité = 0)
- Barre de recherche / filtre par catégorie

### 2. Détail d'un produit
- Afficher les informations complètes du produit (nom, référence, description, catégorie, quantité, seuil, dernière mise à jour)
- Boutons **Entrée de stock** (+) et **Sortie de stock** (−) avec saisie de la quantité

### 3. Ajout / modification d'un produit
- Formulaire de création d'un nouveau produit (nom, référence, catégorie, quantité initiale, seuil d'alerte)
- Modification d'un produit existant

### 4. Tableau de bord (optionnel, bonus)
- Nombre total de produits
- Nombre de produits en rupture
- Nombre de produits en stock faible
- Graphique simple (bar chart ou pie chart) de la répartition par catégorie

---

## Points de vigilance

- La navigation doit être fluide et intuitive sur mobile (penser aux tailles de zones tactiles)
- Les formulaires doivent valider les données (quantités positives, champs obligatoires)
- Le code doit être organisé en composants réutilisables
- Un `README.md` clair est obligatoire (instructions de lancement, versions utilisées, choix techniques)

---

## Bonus (optionnel)

- Notifications locales pour les produits en rupture au lancement de l'app

---

## Livrables attendus

1. Dépôt Git public (GitHub ou GitLab)
2. `README.md` avec : instructions d'installation et de lancement, captures d'écran ou vidéo courte, choix techniques justifiés
3. Le projet doit démarrer avec `npx expo start` ou `npx react-native run-android/ios` sans configuration supplémentaire

---

*Bonne chance ! N'hésitez pas à faire des choix techniques et à les justifier dans votre README.*
