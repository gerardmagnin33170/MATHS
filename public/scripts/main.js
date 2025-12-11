// Charger les cartes depuis le fichier YAML
(async () => {
  try {
    const response = await fetch('../data/cartes.yaml');
    const yamlText = await response.text();
    const doc = jsyaml.load(yamlText);
    console.log('Cartes chargées depuis YAML:', doc);
  } catch (e) {
    console.error('Erreur lors du chargement du YAML:', e);
  }
})();

const NIVEAUX = ["Sixième", "Cinquième", "Quatrième", "Troisième", "Seconde", "Première", "Terminale"];
const CATEGORIES_DATA = [
    { id: "savoir", titre: "Savoir comment fonctionnent les IA", class: "print-col-savoir" },
    { id: "enjeux", titre: "Identifier les enjeux des IA", class: "print-col-enjeux" },
    { id: "apprendre", titre: "Apprendre avec les IA", class: "print-col-apprendre" }
];

const DONNEES_CARTES = [
    // Savoir (8 cartes)
    { id: 11, cat: "savoir", texte: "Comprendre ce qu'est un algorithme, un token" },
    { id: 12, cat: "savoir", texte: "Estimer le coût environnemental des IA" },
    { id: 13, cat: "savoir", texte: "Comprendre les biais des réponses" },
    { id: 14, cat: "savoir", texte: "Comprendre l'approche statistique" },
    { id: 15, cat: "savoir", texte: "Comprendre l'entrainement des IA génératives" },
    { id: 16, cat: "savoir", texte: "Distinguer IA adaptative et IA générative" },
    { id: 17, cat: "savoir", texte: "Diversité des réponses selon le prompt" },
    { id: 18, cat: "savoir", texte: "Connaitre le fonctionnement de l'auto-Tune" },
    // Enjeux (8 cartes)
    { id: 19, cat: "enjeux", texte: "Identifier des métiers impactés" },
    { id: 20, cat: "enjeux", texte: "Choix éclairés (utiliser ou non)" },
    { id: 21, cat: "enjeux", texte: "Importance de la vérification" },
    { id: 22, cat: "enjeux", texte: "Identifier les usages favorisant l'autonomie" },
    { id: 23, cat: "enjeux", texte: "Maîtrise des décisions humaine" },
    { id: 24, cat: "enjeux", texte: "Préserver santé mentale et lien social" },
    { id: 25, cat: "enjeux", texte: "Plagiat et IA" },
    { id: 26, cat: "enjeux", texte: "Financement et IA souveraines" },
    // Apprendre (10 cartes)
    { id: 1, cat: "apprendre", texte: "Renforcer l'accessibilité linguistique" },
    { id: 2, cat: "apprendre", texte: "Utiliser les IA pour mémoriser" },
    { id: 3, cat: "apprendre", texte: "Confronter production personnelle à IA" },
    { id: 4, cat: "apprendre", texte: "S'entraîner à l'oral en interaction" },
    { id: 5, cat: "apprendre", texte: "Pistes d'amélioration production écrite" },
    { id: 6, cat: "apprendre", texte: "Soumettre son travail pour approfondir" },
    { id: 7, cat: "apprendre", texte: "Usages créatifs respectueux" },
    { id: 8, cat: "apprendre", texte: "Créer des fiches de révision" },
    { id: 9, cat: "apprendre", texte: "Générer cartes mentales / QCM" },
    { id: 10, cat: "apprendre", texte: "Mettre en voix une leçon en LV" }
];

const stairs = {
    savoir: { container: null, steps: [] },
    enjeux: { container: null, steps: [] },
    apprendre: { container: null, steps: [] }
};

const droppedTiles = {};
let currentTab = 'savoir';

// Constantes pour le calcul de la hauteur d'offset
const TILE_HEIGHT_ESTIMATE = 50; 

const TILE_COUNTS = {
    'savoir': DONNEES_CARTES.filter(c => c.cat === 'savoir').length,
    'enjeux': DONNEES_CARTES.filter(c => c.cat === 'enjeux').length,
    'apprendre': DONNEES_CARTES.filter(c => c.cat === 'apprendre').length
};

// --- GESTION DES ONGLETS ---
function switchTab(tabName) {
    currentTab = tabName;
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-button.${tabName}`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const activePane = document.getElementById(`tab-${tabName}`);
    activePane.classList.add('active');
    
    const zoneBanqueElement = document.getElementById('zone-vignettes-wrapper');
    const tabsContainerElement = document.querySelector('.tabs-container');
    const printButton = document.getElementById('btn-print-tableau');

    
    if (tabName === 'synthese') {
        genererTableauSynthese();
        // Masquer la banque de vignettes et étendre le conteneur des onglets
        zoneBanqueElement.classList.add('hidden');
        tabsContainerElement.classList.add('full-width');
        printButton.classList.remove('hidden'); // Afficher le bouton Imprimer
    } else {
        // Afficher la banque de vignettes et restaurer la largeur
        zoneBanqueElement.classList.remove('hidden');
        tabsContainerElement.classList.remove('full-width');
        printButton.classList.add('hidden'); // Masquer le bouton Imprimer
        
        createStairs(tabName);
    }
    filterBanque(tabName);
}

function filterBanque(category) {
    const cartes = document.querySelectorAll('#zone-banque .carte-item');
    cartes.forEach(carte => {
        const catCarte = carte.dataset.cat;
        if (category === 'synthese') {
            carte.classList.add('hidden'); // Masquer toutes les cartes si synthèse est actif
        } else if (catCarte === category) {
            carte.classList.remove('hidden');
        } else {
            carte.classList.add('hidden');
        }
    });
}

// --- INITIALISATION ---
function init() {
    ['savoir', 'enjeux', 'apprendre'].forEach(cat => {
        stairs[cat].container = document.getElementById(`stair-${cat}`);
    });

    genererEtiquettes();
    setupDragAndDrop(); 
    
    switchTab('savoir'); 
}

// --- CRÉATION DE L'ESCALIER ---
function createStairs(category) {
    const container = stairs[category].container;
    if (!container) return; 

    container.innerHTML = ''; 
    
    const numSteps = NIVEAUX.length; 
    const paddingValue = 5;
    const totalPadding = 5 * paddingValue;
    
    const containerWidth = container.offsetWidth - totalPadding; 
    const containerHeight = container.offsetHeight - totalPadding; 
    
    const stepWidth = (containerWidth * 0.98) / numSteps; 
    
    stairs[category].steps = [];
    
    // --- Calcul de l'Offset Dynamique pour la Marche la plus Basse (Sixième) ---
    const totalCategoryTiles = TILE_COUNTS[category];
    const requiredHeightForOffset = ((totalCategoryTiles/2) * TILE_HEIGHT_ESTIMATE) + 50; // Hauteur requise + padding/marge
    
    const heightOffset = requiredHeightForOffset; 
    
    const baseHeightAvailableForProgression = containerHeight - heightOffset;
    
    const stepSpacing = 2; // Espacement entre les marches en px
    
    for (let i = 0; i < numSteps; i++) {
        const step = document.createElement('div');
        step.className = 'stair-step';
        step.dataset.step = i;
        step.dataset.category = category;
        step.dataset.level = NIVEAUX[i];
        
        step.setAttribute('ondragover', 'autoriserDepot(event)');
        step.setAttribute('ondrop', 'deposerDansMarche(event)');
        
        // Calcul de la hauteur de la marche (Progression quadratique validée)
        const progression = .9 * Math.pow(((i + 1) / numSteps), 1.75);
        
        // Hauteur de la marche = (Progression * Hauteur disponible) + Offset de base
        const minStepHeight = (progression * baseHeightAvailableForProgression) + heightOffset;
        const left = i * stepWidth + (i * stepSpacing);
        
        // Calcul du TOP
        const top = containerHeight - minStepHeight + paddingValue; 
        
        step.style.left = left + paddingValue + 'px'; 
        step.style.top = top + 'px';
        step.style.width = (stepWidth - stepSpacing) + 'px';
        
        // Fixer la hauteur de la marche
        step.style.minHeight = minStepHeight + 'px'; 
        
        const label = document.createElement('div');
        label.className = 'step-label';
        label.textContent = NIVEAUX[i];
        step.appendChild(label);
        
        container.appendChild(step);
        
        const newStepObj = {
            element: step,
            index: i,
            left: left + paddingValue, 
            top: top, 
            width: stepWidth,
            minHeight: minStepHeight,
            tiles: [] 
        };
        stairs[category].steps.push(newStepObj);
        
        // RESTAURATION des cartes déposées
        Object.values(droppedTiles).forEach(tile => {
            const tileStepIndex = parseInt(tile.dataset.stepIndex);
            const tileCategory = tile.dataset.category;

            if (tileCategory === category && tileStepIndex === i) {
                step.appendChild(tile);
                newStepObj.tiles.push({ id: tile.id, element: tile });
                
                tile.setAttribute('draggable', 'true');
                tile.setAttribute('ondragstart', 'glisser(event)');
                
                tile.style.position = 'static';
                tile.style.transform = 'none';
            }
        });
    }
}

function genererEtiquettes() {
    const zoneBanque = document.getElementById('zone-banque');
    zoneBanque.innerHTML = '';
    
    DONNEES_CARTES.forEach(c => {
        const carte = document.createElement('div');
        carte.className = `carte-item carte-${c.cat}`;
        carte.id = `c-${c.id}`;
        
        carte.setAttribute('draggable', 'true');
        carte.setAttribute('ondragstart', 'glisser(event)');
        
        carte.dataset.cat = c.cat;
        carte.dataset.text = c.texte;
        carte.dataset.tileId = `tile-${c.id}`; 
        carte.textContent = c.texte;
        zoneBanque.appendChild(carte);
    });
}

// --- DRAG AND DROP NATIF (LOGIQUE) ---

function setupDragAndDrop() {
    document.addEventListener('dragstart', function(e) {
        e.target.classList.add('drag-source');
        e.dataTransfer.setData("text/id", e.target.id); 
        e.dataTransfer.setData("text/cat", e.target.dataset.cat); 
    });

    document.addEventListener('dragend', function(e) {
        e.target.classList.remove('drag-source');
        document.querySelectorAll('.stair-step, #zone-banque').forEach(el => {
            el.classList.remove('drop-target');
        });
    });
}

function glisser(ev) { 
        // Fonction appelée par ondragstart
}

function autoriserDepot(ev) { 
    ev.preventDefault();
    const target = ev.target.closest('.stair-step, #zone-banque');
    if (target) {
        document.querySelectorAll('.stair-step, #zone-banque').forEach(el => el.classList.remove('drop-target'));
        target.classList.add('drop-target');
    }
}

function deposerDansMarche(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/id");
    const itemCat = ev.dataTransfer.getData("text/cat");
    const draggedElement = document.getElementById(id);
    let targetStepElement = ev.target.closest('.stair-step');

    if (!targetStepElement || !draggedElement) return;

    const category = targetStepElement.dataset.category;
    const stepIndex = parseInt(targetStepElement.dataset.step);

    if (itemCat !== category) return; 

    if (draggedElement.classList.contains('carte-item')) {
        draggedElement.classList.add('hidden');
        createDroppedTile(draggedElement, category, stepIndex);
    } else if (draggedElement.classList.contains('dropped-tile')) {
        const oldStepIndex = parseInt(draggedElement.dataset.stepIndex);
        moveDroppedTile(draggedElement, category, oldStepIndex, stepIndex);
    }
    targetStepElement.classList.remove('drop-target');
}

function deposerDansBanque(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/id");
    const draggedElement = document.getElementById(id);
    const targetBanque = ev.target.closest('#zone-banque');

    if (!targetBanque || !draggedElement.classList.contains('dropped-tile')) return;
    
    const tileId = draggedElement.id;
    const stepIndex = parseInt(draggedElement.dataset.stepIndex);
    const category = draggedElement.dataset.category;
    
    removeTile(tileId, category, stepIndex);
    
    const originalId = `c-${tileId.split('-')[1]}`; 
    const originalTile = document.getElementById(originalId);

    if (originalTile) {
        originalTile.classList.remove('hidden');
        filterBanque(currentTab); 
    }
    
    draggedElement.remove();
    targetBanque.classList.remove('drop-target');
}

// --- GESTION DES CARTES (Création, Mouvement, Suppression) ---
function createDroppedTile(originalTile, category, stepIndex) {
    const step = stairs[category].steps[stepIndex];
    const originalNumId = originalTile.id.split('-')[1]; 
    const tileId = `tile-${originalNumId}`; 
    
    const tile = document.createElement('div');
    tile.className = `dropped-tile ${category}`;
    tile.id = tileId; 
    tile.textContent = originalTile.dataset.text;

    tile.setAttribute('draggable', 'true');
    tile.setAttribute('ondragstart', 'glisser(event)');

    tile.dataset.tileId = tileId;
    tile.dataset.stepIndex = stepIndex;
    tile.dataset.category = category;
    tile.dataset.text = originalTile.dataset.text;
    tile.dataset.cat = category;
    
    step.element.appendChild(tile);
    tile.style.position = 'static'; 
    
    step.tiles.push({ id: tileId, element: tile });
    droppedTiles[tileId] = tile;
}

function moveDroppedTile(tile, category, oldStepIndex, newStepIndex) {
    const tileId = tile.id;
    const oldStep = stairs[category].steps[oldStepIndex];
    const newStep = stairs[category].steps[newStepIndex];
    
    oldStep.tiles = oldStep.tiles.filter(t => t.id !== tileId);
    
    newStep.element.appendChild(tile);
    
    tile.dataset.stepIndex = newStepIndex;
    
    newStep.tiles.push({ id: tileId, element: tile });
    
    tile.style.position = 'static';
    tile.style.transform = 'none';
}

function removeTile(tileId, category, stepIndex) {
    const step = stairs[category].steps[stepIndex];
    const tile = droppedTiles[tileId];
    
    if (tile) {
        delete droppedTiles[tileId];
        step.tiles = step.tiles.filter(t => t.id !== tileId);
    }
}

// --- FONCTION: Génération du Tableau de Synthèse dans l'onglet ---
function genererTableauSynthese() {
    const container = document.getElementById('tab-synthese');
    // 1. Organiser les données par Niveau et Catégorie
    const tableauData = {}; 
    NIVEAUX.forEach(niveau => {
        tableauData[niveau] = { savoir: [], enjeux: [], apprendre: [] };
    });

    Object.values(droppedTiles).forEach(tile => {
        const category = tile.dataset.category;
        const stepIndex = parseInt(tile.dataset.stepIndex);
        const niveau = NIVEAUX[stepIndex];
        
        if (niveau) {
            tableauData[niveau][category].push({
                texte: tile.dataset.text,
                cat: category
            });
        }
    });

    // 2. Générer le HTML du tableau
    let htmlTable = `
        <table id="tableau-synthese">
            <thead>
                <tr>
                    <th class="synthese-col-niveau">Niveau</th>
                    <th class="synthese-cell-savoir">${CATEGORIES_DATA.find(c => c.id === 'savoir').titre}</th>
                    <th class="synthese-cell-enjeux">${CATEGORIES_DATA.find(c => c.id === 'enjeux').titre}</th>
                    <th class="synthese-cell-apprendre">${CATEGORIES_DATA.find(c => c.id === 'apprendre').titre}</th>
                </tr>
            </thead>
            <tbody>`;
    
    NIVEAUX.forEach(niveau => {
        htmlTable += `<tr>
            <td class="synthese-col-niveau">${niveau}</td>`;
        
        CATEGORIES_DATA.forEach(cat => {
            const cartes = tableauData[niveau][cat.id];
            htmlTable += `<td class="synthese-cell-${cat.id}">
                <div class="synthese-card-wrapper">`;
            
            cartes.forEach(carte => {
                htmlTable += `<div class="synthese-card ${carte.cat}">${carte.texte}</div>`;
            });
            
            htmlTable += `</div></td>`;
        });
        
        htmlTable += `</tr>`;
    });
    
    htmlTable += `
            </tbody>
        </table>`;
    
    container.innerHTML = htmlTable;
}


// --- NOUVELLE FONCTION: Impression en Tableau (Optimisée pour la fenêtre principale) ---
function imprimerTableau() {
    // 1. Assure que le tableau de synthèse est généré dans le DOM visible
    genererTableauSynthese();
    
    const tableauDom = document.getElementById('tableau-synthese');
    const printContainer = document.getElementById('tableau-impression');
    
    if (!tableauDom || !printContainer) return;
    
    // 2. Cloner le contenu et le préparer avec le titre pour l'impression
    const tableauContentHtml = `
        <h1 style="text-align:center; margin-bottom: 20px;">Matrice de Progressivité IA - Compétences Élèves</h1>
        ${tableauDom.outerHTML}`;
    
    // 3. Injecter le contenu dans le conteneur d'impression
    printContainer.innerHTML = tableauContentHtml;
    
    // 4. Déclencher l'impression de la fenêtre actuelle
    // Les règles @media print dans le CSS gèrent le masquage du reste du contenu
    window.print();
    
    // 5. Nettoyer le conteneur d'impression après un court délai
    setTimeout(() => { 
        printContainer.innerHTML = '';
    }, 100); 
}


// --- GESTION DES EVENEMENTS & DÉMARRAGE ---
function reinitialiser() {
    Object.values(droppedTiles).forEach(tile => tile.remove());
    Object.keys(droppedTiles).forEach(key => delete droppedTiles[key]);
    
    ['savoir', 'enjeux', 'apprendre'].forEach(cat => {
        stairs[cat].steps.forEach(step => {
            step.tiles = [];
        });
    });
    
    genererEtiquettes();
    switchTab(currentTab); 
}

window.addEventListener('resize', () => {
    createStairs(currentTab);
});

init();