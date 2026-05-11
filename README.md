# Progressivité MATHEMATIQUES

Application web permettant d'organiser des cartes-compétences en intelligence artificielle sur un escalier de progression, de la 6e à la Terminale.

## Objectif

- Visualiser la progression des compétences sur plusieurs niveaux scolaires.
- Travailler par 3 catégories : Savoir, Enjeux, Apprendre.
- Produire une vue de synthèse exploitable à l'écran et à l'impression.

## Prérequis

- Node.js 16 ou supérieur
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

## Installation

1. Cloner le dépôt :

```bash
git clone https://forge.apps.education.fr/dane-creteil/pole-socle-numerique/progression_ia.git
cd progression_ia
```

1. Installer les dépendances :

```bash
npm install
```

## Utilisation

### Lancer en développement

```bash
npm run dev
```

Application disponible sur `http://localhost:5173`.

### Générer la version de production

```bash
npm run build
```

### Prévisualiser la build

```bash
npm run preview
```

## Fonctionnalités principales

- Banque de cartes par catégorie
- Glisser-déposer vers l'escalier correspondant
- Mode édition des cartes (boutons « Mode édition » et « Verrouiller »)
- Création, modification et suppression de cartes
- Import et export de cartes au format CSV
- Vue de synthèse par niveau et catégorie

## Données

- `public/data/niveaux.yaml` : niveaux scolaires
- `public/data/categories.yaml` : catégories
- `public/data/cartes.csv` : cartes-compétences

Les niveaux et catégories sont chargés depuis YAML. Les cartes sont chargées depuis CSV.

## Structure du projet

```text
public/
├── index.html
├── src/main.js
├── styles/main.css
└── data/
    ├── niveaux.yaml
    ├── categories.yaml
    ├── cartes.yaml
    └── cartes.csv
```

## Personnalisation rapide

### Ajouter une carte

- Via l'interface : activer « Mode édition », puis cliquer sur « Créer une carte vierge ».
- Via le fichier : ajouter une ligne dans `public/data/cartes.csv`.

Exemple :

```csv
categorie,texte,niveauMin,id
savoir,"Votre texte",0,100
```

### Ajouter un niveau ou une catégorie

1. Mettre à jour `public/data/niveaux.yaml` et/ou `public/data/categories.yaml`
1. Ajouter le conteneur d'escalier dans `public/index.html`
1. Ajouter les styles associés dans `public/styles/main.css`

## Licence

Ce projet est sous licence GNU Affero General Public License v3.0 ou ultérieure (AGPL-3.0-or-later).

Points essentiels :

- conservation des mentions de copyright et de licence
- citation de la source du projet
- accès au code source correspondant en cas de mise à disposition d'une version modifiée sur le web

Voir [LICENSE](LICENSE).

## Contribution

Les contributions sont bienvenues via issue ou merge request sur le dépôt Forge.

---

Dernière mise à jour: 12 mars 2026
