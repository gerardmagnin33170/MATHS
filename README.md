# Modele HTML <aside> Modèle de site HTML/CSS </aside>

Ce projet est [un modèle de site web](https://iaconellicyril.forge.apps.education.fr/modele-html/) **simple en HTML et CSS**, hébergé sur **La Forge des Communs Numériques Éducatifs**.

## 🔧 Comment l'utiliser

1. Créez une bifurcation (fork) de ce projet dans votre espace.
2. Le dossier `public` contient le site web qui sera publié. Donc :
    1. Modifiez le fichier `public/index.html`, ajoutez à ce dossier d'autres pages HTML, des images, du CSS, ou encore du JavaScript.
    2. Ne modifiez pas le fichier `.gitlab-ci.yml` — il est nécessaire au bon fonctionnement de l’hébergement.

## 📁 Contenu du projet

- `readme.md` : fichier qui présente votre projet sur le dépôt
- `.gitlab-ci.yml` : configuration pour GitLab Pages (**à conserver tel quel**)
- `public/` (dossier)
    - `index.html` : page principale du site
    - `style.css` : fichier de styles modifiable
    - `images/` : dossier d’exemples d’images (vous pouvez le supprimer ou le remplacer)

## 🧰 Pour aller plus loin

Vous pouvez ajouter :
- Un fichier `public/script.js` pour des interactions JavaScript
- D'autres pages HTML (`public/page2.html`, `public/contact.html`...)
- Des ressources comme des polices, des icônes, etc.


## Au sujet du `.gitlab-ci` (⚠️ pour les curieux du code ⚠️)

- Dans le `.gitlab-ci` de [cette vidéo](https://tube-numerique-educatif.apps.education.fr/w/vAMyPdtMNRPe8c4TuqhX1d), le job *pages* déplace manuellement les fichiers dans un dossier `public` via une suite de commandes (`mkdir`, `cp`, `rm`, `mv`). Il définit aussi explicitement un stage et l’environnement.
- Dans celui de ce modèle, aucune manipulation de fichiers : on suppose que le dossier `public` est déjà présent dans le dépôt. Le script se limite à un message, et l’essentiel est que `public` soit publié en artefact.

Pourquoi celui de ce modèle est préférable :
- Plus simple, lisible et maintenable.
- Respecte davantage la philosophie GitLab Pages : *ne pas copier tout le dépôt*, mais uniquement ce qui doit être publié.
- Réduit les risques d’erreurs et le temps d’exécution.
- Évite la duplication inutile de fichiers, ce qui économise de l’espace et accélère les pipelines.

## 📄 Licence

Ce projet est sous licence [**Creative Commons Zero v1.0 Universal**](https://creativecommons.org/publicdomain/zero/1.0/deed.fr) — vous pouvez le réutiliser, le modifier et le partager en citant l’auteur.
