# Progressivité IA

Application web interactive pour visualiser et planifier la progression des compétences en intelligence artificielle à travers 7 niveaux scolaires (6ème à Terminale). Les enseignants organisent des cartes-compétences dans 3 catégories sur un escalier visuel représentant la progression académique.

## Prérequis

- Node.js 16+ (pour npm)
- Navigateur moderne avec support ES6 modules (Chrome, Firefox, Safari, Edge)
- Aucune base de données ou serveur backend requis

## Installation

1. Cloner le repository :

```bash
git clone https://forge.apps.education.fr/dane-creteil/pole-socle-numerique/progression_ia.git
cd progression_ia
```

2. Installer les dépendances :

```bash
npm install
```

Cela installe :

- **Vite** : outil de build moderne et serveur de développement avec rechargement instantané
- **js-yaml** : parseur YAML pour charger les données des niveaux et catégories
- **PapaParse** : parseur CSV pour charger les cartes-compétences depuis un fichier CSV

## Développement

Démarrer le serveur de développement avec rechargement à chaud :

```bash
npm run dev
```

L'application s'ouvre à `http://localhost:5173`. Modifiez les fichiers dans `public/` et le navigateur se réactualise automatiquement.

## Build pour la production

Créer une version optimisée :

```bash
npm run build
```

Déployer le dossier `build/` sur un hébergement statique (GitHub Pages, Netlify, Forge, etc).

## Preview de la version build

Vérifier le rendu production localement avant déploiement :

```bash
npm run preview
```

Affiche un aperçu local du dossier `build/` avec la même configuration que la production.

## Structure du projet

```
public/
├── index.html              # Document HTML unique avec interface complète
├── src/
│   └── main.js             # Logique principale (~1000+ lignes ES6)
├── styles/
│   └── main.css            # Styles et mise en page responsive
└── data/
    ├── niveaux.yaml        # 7 niveaux scolaires
    ├── categories.yaml     # 3 catégories de compétences
    ├── cartes.yaml         # Format archivé (26+ cartes)
    └── cartes.csv          # Format actuel (cartes-compétences avec métadonnées)
```

Les sources de données (niveaux, catégories) sont des fichiers YAML chargés dynamiquement. Les cartes sont chargées depuis un fichier CSV. Modifiez-les pour changer le contenu sans éditer le code.

## Fonctionnalités

### Gestion des cartes

- **Banque** : Organisée par catégorie (Savoir / Enjeux / Apprendre)
- **Créer** : Cliquez sur "➕ Créer une carte vierge" en mode édition
- **Éditer** : Double-cliquez sur le texte ou utilisez le bouton éditer (quand déverrouillé)
- **Supprimer** : Utilisez le bouton supprimer (quand le mode édition est actif)
- **Glisser-déposer** : Placez les cartes sur l'escalier. Les cartes ne s'adaptent qu'à l'escalier de leur catégorie.

### Mode édition

- **Par défaut** : Verrouillé (boutons masqués, cartes en lecture seule)
- Cliquez sur "✏️ Mode édition" pour déverrouiller (les boutons d'action apparaissent)
- Cliquez sur "🔒 Verrouiller" pour verrouiller (annule les éditions en attente, masque les boutons)

### Restrictions de niveau

Les cartes peuvent avoir une propriété `niveauMin` (0-6) alertant lors du placement en dessous de ce niveau :

- `0` = 6ème+
- `1` = 5ème+
- `2` = 4ème+
- (etc.)

Les placements restreints affichent une alerte visuelle (bordure rouge, fond jaune) qui disparaît automatiquement après 5 secondes.

Exemple dans `public/data/cartes.csv` :

```csv
categorie,texte,niveauMin,id
savoir,"Concept avancé",3,15
```

### Vue de synthèse

Cliquez sur l'onglet "Synthèse" pour voir un résumé croisé de toutes les cartes placées par niveau et catégorie. Mise en page imprimable pour les documents et les rapports.

### Import / Export de cartes

- **Exporter** : Téléchargez les cartes actuelles en format CSV via le bouton "Exporter les cartes"
- **Importer** : Chargez un fichier CSV via le bouton "Importer un fichier de cartes"
- **Réinitialiser** : Effacez toutes les cartes placées et revenir à l'état initial

## Système de couleurs

Les catégories utilisent des couleurs cohérentes partout :

- **Savoir** (jaune) : Connaissances/concepts fondamentaux
- **Enjeux** (bleu) : Enjeux sociétaux et implications
- **Apprendre** (vert) : Méthodes et outils d'apprentissage

Les boutons d'édition reflètent la couleur de la catégorie de l'onglet actuel. Les entrées d'édition affichent des bordures colorées par catégorie.

## Personnalisation

### Ajouter une nouvelle carte

Deux approches :

#### Option 1 : Mode édition (interface)

1. Cliquez sur "✏️ Mode édition"
2. Cliquez sur "➕ Créer une carte vierge"
3. Entrez le texte et appuyez sur Entrée

#### Option 2 : Fichier CSV

Éditez `public/data/cartes.csv` :

```csv
categorie,texte,niveauMin,id
savoir,"Votre texte de carte ici",0,100
```

Actualisez le navigateur pour charger les nouvelles cartes.

### Ajouter un nouveau niveau ou une nouvelle catégorie

Requiert des modifications aux fichiers YAML, structure HTML et CSS :

1. Mettez à jour `public/data/niveaux.yaml` (ajoutez le niveau)
2. Mettez à jour `public/data/categories.yaml` (ajoutez la catégorie avec id et titre)
3. Ajoutez `<div id="stair-{categoryid}" class="stair-container"></div>` à `public/index.html`
4. Ajoutez les variables CSS pour les couleurs dans `public/styles/main.css` :
   - `--coul-{categoryid}` : couleur principale
   - `--coul-bord-{categoryid}` : couleur de bordure

## Tests et débogage

### Vérifier les erreurs console

Ouvrez DevTools du navigateur (F12) → onglet **Console**. Surveillez les erreurs d'analyse YAML/CSV ou les fichiers de données manquants.

### Imprimer la vue de synthèse

1. Cliquez sur l'onglet "Synthèse"
2. Appuyez sur Ctrl+P (Cmd+P sur Mac)
3. Imprimez en PDF ou sur papier

Les règles CSS `@media print` masquent la barre d'outils et les escaliers, affichant uniquement le tableau de synthèse en pleine page.

### Tester la responsivité

Utilisez F12 DevTools → **Toggle device toolbar** pour tester sur différentes résolutions d'écran (mobile, tablette, desktop).

## Comportements connus

- Les cartes placées sur un escalier sont stockées en mémoire de session du navigateur (perdues au rafraîchissement de la page)
- L'état du mode édition n'est pas sauvegardé ; revient à l'état verrouillé au rechargement de la page
- La hauteur de l'escalier s'ajuste de manière réactive ; utilise une formule d'échelle quadratique pour la progression visuelle
- Les alertes de restrictions de niveau disparaissent automatiquement après 5 secondes

## Notes de développement

### Architecture technique

L'application utilise des **modules JavaScript ES6 vanilla** (sans frameworks). Toutes les mises à jour d'interface utilisateur sont basées sur le DOM. Le glisser-déposer utilise l'**API HTML5 native** avec des écouteurs d'événements (pas jQuery ou bibliothèques de drag).

### Fichiers clés par fonction

| Fonction               | Fichier                       | Détails                                                                                                  |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| Logique principale     | `public/src/main.js`          | ~1000+ lignes, gère le chargement YAML/CSV, génération des cartes, glisser-déposer, opérations d'édition |
| Styles et mise en page | `public/styles/main.css`      | ~700 lignes, escalier responsive, couleurs, conception mobile-first, styles d'impression                 |
| Données niveaux        | `public/data/niveaux.yaml`    | Source de vérité pour les 7 niveaux scolaires                                                            |
| Données catégories     | `public/data/categories.yaml` | Source de vérité pour les 3 catégories avec métadonnées                                                  |
| Données cartes         | `public/data/cartes.csv`      | Source de vérité pour les cartes-compétences (id, catégorie, texte, niveauMin)                           |
| Interface HTML         | `public/index.html`           | Structure avec onglets, zones de drop, barre d'outils                                                    |

### Patterns importants

#### Chargement des données

```javascript
// YAML chargé au démarrage
LEVELS = JSON.parse(sessionStorage.getItem("niveaux"));
CATEGORIES = JSON.parse(sessionStorage.getItem("categories"));

// CSV chargé dynamiquement avec PapaParse
Papa.parse(content, { encoding: "UTF-8", header: true });
```

#### Drag-and-drop

Utilise les événements HTML5 natifs (`dragstart`, `dragover`, `drop`) avec validation de catégorie et gestion des zones de drop.

#### Gestion du mode édition

- Variable globale `editMode` (true/false)
- Fonctions `toggleEditMode()` et `lockEditMode()` pour basculer l'état
- Boutons d'action affichés/masqués en fonction de `editMode`

## Ressources et références

- [Vite Documentation](https://vitejs.dev/)
- [js-yaml Documentation](https://github.com/nodeca/js-yaml)
- [PapaParse Documentation](https://www.papaparse.com/)
- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## Licence

Ce projet est sous licence **GNU General Public License v3.0**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contribution

Les contributions sont bienvenues. Pour toute question ou suggestion, veuillez ouvrir une **issue** ou un **merge request** sur le dépôt Forge.

---

**Dernière mise à jour** : 8 février 2026
