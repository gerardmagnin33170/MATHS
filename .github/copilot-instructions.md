# Progressivité IA - Guide pour Copilot

## Vue d'ensemble du projet

**Progressivité IA** est une application web interactive pour visualiser et planifier la progression des compétences pédagogiques en intelligence artificielle à travers 7 niveaux scolaires (Sixième → Terminale). Les utilisateurs organisent 26 cartes-compétences (réparties en 3 catégories) sur un "escalier" visuel représentant la progression académique.

**Langage unique** : vanilla JavaScript (HTML5/CSS3/JS). Zéro dépendances externes.

## Architecture générale

### Structure hiérarchique
- **`public/index.html`** : Document unique. 3 catégories via système d'onglets (tabs).
- **`public/scripts/main.js`** : ~475 lignes. Cœur logique applicatif.
- **`public/styles/main.css`** : ~458 lignes. Design et responsive.
- **`public/` uniquement** : Pas de build, pas de node_modules.

### Flux de données principal
1. **Données cartes** : `DONNEES_CARTES[]` contient 26 objets {id, cat, texte}. 3 catégories = "savoir", "enjeux", "apprendre".
2. **État UI** : Objets `stairs{savoir, enjeux, apprendre}` = 3 escaliers indépendants (un par onglet).
3. **Persistance** : `droppedTiles{}` = objet global stockant chaque carte placée (clé=tileId).
4. **Sync escalier→tableau** : Onglet "Synthèse" agrège `droppedTiles` par niveau/catégorie pour affichage tableau.

## Patterns clés du codebase

### 1. Escalier dynamique (le "pourquoi" architectural)
**Fichiers** : `main.js` ligne ~120-160 (fonction `createStairs()`).

L'escalier **n'est pas un CSS grid classique**. C'est un layout absolus positionnés avec :
- Chaque marche = `<div class="stair-step">` positionné en `left/top`.
- Hauteur = **progression quadratique** : `Math.pow((i+1)/7, 2) * baseHeight + offset`.
  - Sixième = base basse. Terminale = sommet haut.
  - Formule validée pédagogiquement pour montrer la progressivité.
- **Container responsif** : récalcule tout lors du resize.

### 2. Drag-and-drop natif (HTML5)
**Fichiers** : `main.js` ligne ~215-300 (5 fonctions drag-drop).

**Flux complet** :
1. Source = `carte-item` en banque OU `dropped-tile` déjà placée.
2. Drop-target validé = `.stair-step` ou `#zone-banque`.
3. **Catégorie stricte** : une carte "savoir" ne peut aller que sur `stair-savoir`.
4. Clonage créatif : `carte-item` → `dropped-tile` clonée (modèle Source/Cloned).

**Événements clés** :
- `dragstart` : ajoute classe `.drag-source`.
- `dragover/drop` : validation catégorie + appel `createDroppedTile()` ou `moveDroppedTile()`.
- Retour banque : `deposerDansBanque()` supprime la tile, restaure orig. visible.

### 3. Gestion des onglets (tab switching)
**Fonction** : `switchTab(tabName)` ligne ~59-96.

**Comportement spécial** :
- Onglets "savoir"/"enjeux"/"apprendre" = affichent escalier + filtrent banque.
- Onglet "synthese" = masque banque, génère tableau croisé dynamique.
- Recherche d'éléments : `.querySelector(.tab-button.${tabName})` en utilisant classe CSS combinée.

### 4. Synthèse/Tableau d'impression
**Fichiers** : `main.js` ligne ~340-410 (2 fonctions).

**Transformation** : 
- `genererTableauSynthese()` : structure `tableauData[niveau][catégorie] = []` d'objets cartes.
- Tableau HTML généré avec classe `.synthese-card-wrapper` (flex).
- **Impression** : `imprimerTableau()` injecte contenu dans `<div id="tableau-impression">` invisible puis `window.print()`.
- CSS `@media print` masque barre outils + escaliers + affiche tableau plein écran.

### 5. Filtrage dynamique de la banque
**Fonction** : `filterBanque(category)` ligne ~87.

Masque/affiche `carte-item` selon onglet actif. Logique :
- Si category = "synthese" → masque toutes cartes.
- Sinon → affiche si `carte.dataset.cat === category`.

## Conventions et patterns projet

### Nommage des éléments DOM
- **Banque** : `carte-item carte-{categorie}` avec id=`c-{numId}` (ex: `c-1`).
- **Dropped tiles** : `dropped-tile {categorie}` avec id=`tile-{numId}` (ex: `tile-1`).
- **Escaliers** : `stair-step` avec dataset={step, category, level}.
- **Synthèse** : `synthese-card` avec classe catégorie enfant.

### dataset HTML
Chaque élément draggable conserve :
- `data-cat` = catégorie.
- `data-text` = texte complet (pour clonage).
- `data-step-index` = position sur escalier (dropped-tiles only).
- `data-category` = catégorie (stair-steps only).

### Classes CSS catégoriques
- `.carte-savoir`, `.carte-enjeux`, `.carte-apprendre` = couleurs uniques (CSS vars `--coul-*`).
- Herites par `.dropped-tile.{categorie}`.
- Tableau synthèse = `.synthese-cell-{categorie}` pour colonnes.

### Variables CSS (@root)
- `--coul-savoir: #f1c40f` (jaune/orange).
- `--coul-enjeux: #3498db` (bleu).
- `--coul-apprendre: #2ecc71` (vert).
- Bordures = `hsl(from ...)` calculée pour contraste.

## Points critiques pour modifications futures

### Ajouter une catégorie
1. Ajouter objet dans `CATEGORIES_DATA[]`.
2. Ajouter `{ id: "newcat", ... }` dans `DONNEES_CARTES[]` (au moins 1 carte).
3. Créer `<div id="stair-newcat" class="stair-container"></div>` dans HTML.
4. Créer `<button class="tab-button newcat">` pour onglet.
5. Ajouter variables CSS `--coul-newcat`, `--coul-bord-newcat`, etc.
6. Ajouter styles `.carte-newcat`, `.dropped-tile.newcat`.

### Ajouter une carte
1. Insérer objet `{ id: uniqueInt, cat: "existant", texte: "..." }` dans `DONNEES_CARTES[]`.
2. Aucune autre modification (génération dynamique via boucle).

### Modifier l'escalier (hauteur, niveaux)
- Constante `NIVEAUX[]` ligne ~1 = source de vérité pour levels.
- `numSteps = NIVEAUX.length` utilisé pour itération escalier.
- Modifier que `NIVEAUX[]` = auto-ajuste escalier.
- **Calcul de hauteur** : ligne ~139 = `progression = Math.pow(..., 2)`. Tester responsivité après changement.

### Déboguer le drag-drop
- Vérifier `dataset.category` === catégorie escalier (ligne ~275).
- Logs utiles : `console.log(e.dataTransfer.getData(...))` en dragstart/drop.
- Tester avec `autoriserDepot()` qui ajoute visuelle `.drop-target`.

## Commandes de développement

**Pas de build** = servez simplement `/public/` via HTTP local (ex: `python -m http.server 8000`).

**Test impression** : Ctrl+P ou Cmd+P → aperçu montre mise en page print.

**Responsive** : F12 DevTools → Toggle Device Toolbar → test tous résolutions.

## Fichiers clés par tâche

| Tâche | Fichier | Lignes |
|-------|---------|--------|
| Ajouter/modifier cartes | `main.js` | 4-48 |
| Logique escalier | `main.js` | 120-220 |
| Drag-drop | `main.js` | 215-335 |
| Onglets/filtrage | `main.js` | 59-96 |
| Synthèse tableau | `main.js` | 340-410 |
| Layout escalier | `main.css` | 150-250 |
| Couleurs catégories | `main.css` | 1-20 |
| Impression | `main.css` | 400-458 |
