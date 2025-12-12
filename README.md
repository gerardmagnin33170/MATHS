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
cd progressivite_ia
```

2. Installer les dépendances :
```bash
npm install
```

Cela installe Vite (outil de build) et js-yaml (parseur YAML pour le chargement des données).

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

Déployer le dossier `build/` sur un hébergement statique (GitHub Pages, Netlify, etc).

## Structure du projet

```
public/
├── index.html              # Document HTML unique
├── src/
│   └── main.js            # Logique principale (~750 lignes ES6)
├── styles/
│   └── main.css           # Styles et mise en page responsive
└── data/
    ├── niveaux.yaml       # 7 niveaux scolaires
    ├── categories.yaml    # 3 catégories de compétences
    └── cartes.yaml        # 26+ cartes-compétences
```

Les sources de données sont des fichiers YAML chargés dynamiquement au démarrage. Modifiez-les pour changer le contenu sans éditer le code.

## Fonctionnalités

### Gestion des cartes
- **Banque** : Organisée par catégorie (Savoir / Enjeux / Apprendre)
- **Créer** : Cliquez sur "Créer une carte vierge" en mode édition
- **Éditer** : Double-cliquez sur le texte ou utilisez le bouton éditer (quand déverrouillé)
- **Supprimer** : Utilisez le bouton supprimer (quand le mode édition est actif)
- **Glisser-déposer** : Placez les cartes sur l'escalier. Les cartes ne s'adaptent qu'à l'escalier de leur catégorie.

### Mode édition
- **Par défaut** : Verrouillé (boutons masqués, cartes en lecture seule)
- Cliquez sur "✏️ Mode édition" pour déverrouiller (les boutons d'action apparaissent)
- Cliquez sur "🔒 Verrouiller" pour verrouiller (annule les éditions en attente, masque les boutons)

### Restrictions de niveau
Les cartes peuvent avoir une propriété `minLevel` (0-6) empêchant le placement en dessous de ce niveau :
- 0 = 6ème+, 1 = 5ème+, 2 = 4ème+, etc.
- Les placements restreints affichent une alerte visuelle (bordure rouge, fond jaune)
- L'alerte disparaît automatiquement après 5 secondes

Définissez `minLevel` dans `public/data/cartes.yaml` :
```yaml
- categorie: savoir
  texte: "Concept avancé"
  minLevel: 3  # 4ème et au-dessus uniquement
```

### Vue de synthèse
Cliquez sur l'onglet "Synthèse" pour voir un résumé croisé de toutes les cartes placées par niveau et catégorie. Mise en page imprimable pour les documents.

## Système de couleurs

Les catégories utilisent des couleurs cohérentes partout :
- **Savoir** (jaune) : Connaissances/faits
- **Enjeux** (bleu) : Enjeux/implications
- **Apprendre** (vert) : Méthodes d'apprentissage

Les boutons d'édition reflètent la couleur de la catégorie de l'onglet actuel. Les entrées d'édition affichent des bordures colorées par catégorie.

## Personnalisation

### Ajouter une nouvelle carte
Éditez `public/data/cartes.yaml` :
```yaml
- categorie: savoir
  texte: "Votre texte de carte ici"
```

Aucune modification de code requise. Actualisez le navigateur pour charger la nouvelle carte.

### Ajouter un nouveau niveau ou une nouvelle catégorie
Requiert des modifications aux fichiers YAML, structure HTML et CSS :
1. Mettez à jour `public/data/niveaux.yaml` (ajoutez le niveau)
2. Mettez à jour `public/data/categories.yaml` (ajoutez la catégorie)
3. Ajoutez `<div id="stair-{categoryid}"></div>` à `public/index.html`
4. Ajoutez les variables de couleur de catégorie à `public/styles/main.css`

## Tests et débogage

### Vérifier les erreurs console
Ouvrez DevTools du navigateur (F12) → onglet Console. Surveillez les erreurs d'analyse YAML ou les fichiers de données manquants.

### Imprimer la vue de synthèse
1. Cliquez sur l'onglet "Synthèse"
2. Appuyez sur Ctrl+P (Cmd+P sur Mac)
3. Imprimez en PDF ou sur papier

Les règles CSS `@media print` masquent la barre d'outils et les escaliers, affichant uniquement le tableau.

## Comportements connus

- Les cartes placées sur un escalier sont stockées en mémoire de session du navigateur (perdues au rafraîchissement)
- L'état du mode édition n'est pas sauvegardé ; revient à l'état verrouillé au rechargement de la page
- La hauteur de l'escalier s'ajuste de manière réactive ; utilise une formule d'échelle quadratique pour la progression visuelle

## Notes de développement

L'application utilise des modules JavaScript ES6 vanilla (sans frameworks). Toutes les mises à jour d'interface utilisateur sont basées sur le DOM. Le glisser-déposer utilise l'API HTML5 native avec des écouteurs d'événements (pas jQuery ou bibliothèques de drag).

Fichiers clés :
- **main.js** : ~750 lignes, gère le chargement YAML, génération des cartes, glisser-déposer, opérations d'édition
- **main.css** : ~700 lignes, mise en page (escalier + grille), couleurs, conception responsive, styles d'impression
- **Données YAML** : Source de vérité pour les cartes, niveaux, catégories

## Licence

Ce projet est sous licence [**GNU General Public License v3.0**](https://www.gnu.org/licenses/gpl-3.0.html).
