import yaml from 'js-yaml';

// =============================================================================
// CONSTANTES
// =============================================================================
const TILE_HEIGHT_ESTIMATE = 50;

// =============================================================================
// VARIABLES GLOBALES
// =============================================================================
let LEVELS, CATEGORIES, CARDS, TILE_COUNTS, stairs;
let currentTab = 'savoir';
const droppedTiles = {};

// =============================================================================
// CLASSES DE DONNÉES
// =============================================================================
function Card(category, text) {
    Card.nextId = Card.nextId || 0;
    this.id = Card.nextId++;
    this.category = category;
    this.text = text;
}

function Category(id, title) {
    this.id = id;
    this.title = title;
    this.class = `print-col-${id}`;
}

// =============================================================================
// CHARGEMENT DES DONNÉES
// =============================================================================
async function loadLevels() {
    try {
        const response = await fetch('./data/niveaux.yaml');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const textYaml = await response.text();
        const data = yaml.load(textYaml);
        console.log('✓ Niveaux chargés depuis YAML:', data);
        sessionStorage.setItem('niveaux', JSON.stringify(data));
    } catch (e) {
        console.log(`ℹ ${e}`);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('./data/categories.yaml');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const textYaml = await response.text();
        const data = yaml.load(textYaml);
        const categories = data.map(item => new Category(item.id || '', item.titre || ''));
        console.log('✓ Catégories chargées depuis YAML:', categories);
        sessionStorage.setItem('categories', JSON.stringify(categories));
    } catch (e) {
        console.log(`ℹ ${e}`);
    }
}

async function loadCards() {
    try {
        const response = await fetch('./data/cartes.yaml');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const textYaml = await response.text();
        const data = yaml.load(textYaml);
        const cards = data.map(item => new Card(item.categorie || '', item.texte || ''));
        console.log('✓ Cartes chargées depuis YAML:', cards);
        sessionStorage.setItem('cartes', JSON.stringify(cards));
    } catch (e) {
        console.log(`ℹ ${e}`);
    }
}

// =============================================================================
// GÉNÉRATION DU DOM
// =============================================================================
function generateCards() {
    const cardBank = document.getElementById('zone-banque');
    cardBank.innerHTML = '';
    
    CARDS.forEach(c => {
        const card = document.createElement('div');
        card.className = `carte-item carte-${c.category}`;
        card.id = `c-${c.id}`;
        card.setAttribute('draggable', 'true');
        card.setAttribute('ondragstart', 'drag(event)');
        card.dataset.category = c.category;
        card.dataset.text = c.text;
        card.dataset.tileId = `tile-${c.id}`; 
        card.textContent = c.text;
        cardBank.appendChild(card);
    });
}

function createStairs(category) {
    const container = stairs[category].container;
    if (!container) return; 

    container.innerHTML = ''; 
    
    const numSteps = LEVELS.length; 
    const paddingValue = 5;
    const totalPadding = 5 * paddingValue;
    const containerWidth = container.offsetWidth - totalPadding; 
    const containerHeight = container.offsetHeight - totalPadding; 
    const stepWidth = (containerWidth * 0.98) / numSteps; 
    
    stairs[category].steps = [];
    
    const totalCategoryTiles = TILE_COUNTS[category];
    const requiredHeightForOffset = ((totalCategoryTiles / 2) * TILE_HEIGHT_ESTIMATE) + 50;
    const heightOffset = requiredHeightForOffset; 
    const baseHeightAvailableForProgression = containerHeight - heightOffset;
    const stepSpacing = 2;
    
    for (let i = 0; i < numSteps; i++) {
        const step = document.createElement('div');
        step.className = 'stair-step';
        step.dataset.step = i;
        step.dataset.category = category;
        step.dataset.level = LEVELS[i];
        step.setAttribute('ondragover', 'allowDrop(event)');
        step.setAttribute('ondrop', 'dropOnStep(event)');
        
        const progression = .9 * Math.pow(((i + 1) / numSteps), 1.75);
        const minStepHeight = (progression * baseHeightAvailableForProgression) + heightOffset;
        const left = i * stepWidth + (i * stepSpacing);
        const top = containerHeight - minStepHeight + paddingValue; 
        
        step.style.left = left + paddingValue + 'px'; 
        step.style.top = top + 'px';
        step.style.width = (stepWidth - stepSpacing) + 'px';
        step.style.minHeight = minStepHeight + 'px'; 
        
        const label = document.createElement('div');
        label.className = 'step-label';
        label.textContent = LEVELS[i];
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
        
        // Restauration des cartes déposées
        Object.values(droppedTiles).forEach(tile => {
            const tileStepIndex = parseInt(tile.dataset.stepIndex);
            const tileCategory = tile.dataset.category;

            if (tileCategory === category && tileStepIndex === i) {
                step.appendChild(tile);
                newStepObj.tiles.push({ id: tile.id, element: tile });
                tile.setAttribute('draggable', 'true');
                tile.setAttribute('ondragstart', 'drag(event)');
                tile.style.position = 'static';
                tile.style.transform = 'none';
            }
        });
    }
}

function generateSummaryTable() {
    const container = document.getElementById('tab-synthese');
    
    const tableData = {}; 
    LEVELS.forEach(level => {
        tableData[level] = { savoir: [], enjeux: [], apprendre: [] };
    });

    Object.values(droppedTiles).forEach(tile => {
        const category = tile.dataset.category;
        const stepIndex = parseInt(tile.dataset.stepIndex);
        const level = LEVELS[stepIndex];
        
        if (level) {
            tableData[level][category].push({
                text: tile.dataset.text,
                category: category
            });
        }
    });

    let htmlTable = `
        <table id="tableau-synthese">
            <thead>
                <tr>
                    <th class="synthese-col-niveau">Niveau</th>
                    <th class="synthese-cell-savoir">${CATEGORIES.find(c => c.id === 'savoir').title}</th>
                    <th class="synthese-cell-enjeux">${CATEGORIES.find(c => c.id === 'enjeux').title}</th>
                    <th class="synthese-cell-apprendre">${CATEGORIES.find(c => c.id === 'apprendre').title}</th>
                </tr>
            </thead>
            <tbody>`;
    
    LEVELS.forEach(level => {
        htmlTable += `<tr>
            <td class="synthese-col-niveau">${level}</td>`;
        
        CATEGORIES.forEach(cat => {
            const cards = tableData[level][cat.id];
            htmlTable += `<td class="synthese-cell-${cat.id}">
                <div class="synthese-card-wrapper">`;
            
            cards.forEach(card => {
                htmlTable += `<div class="synthese-card ${card.category}">${card.text}</div>`;
            });
            
            htmlTable += `</div></td>`;
        });
        
        htmlTable += `</tr>`;
    });
    
    htmlTable += `</tbody></table>`;
    
    container.innerHTML = htmlTable;
}

// =============================================================================
// DRAG AND DROP
// =============================================================================
function setupDragAndDrop() {
    document.addEventListener('dragstart', function(e) {
        e.target.classList.add('drag-source');
        e.dataTransfer.setData("text/id", e.target.id); 
        e.dataTransfer.setData("text/cat", e.target.dataset.category); 
    });

    document.addEventListener('dragend', function(e) {
        e.target.classList.remove('drag-source');
        document.querySelectorAll('.stair-step, #zone-banque').forEach(el => {
            el.classList.remove('drop-target');
        });
    });
}

function drag(ev) { 
    // Fonction appelée par ondragstart
}

function allowDrop(ev) { 
    ev.preventDefault();
    const target = ev.target.closest('.stair-step, #zone-banque');
    if (target) {
        document.querySelectorAll('.stair-step, #zone-banque').forEach(el => el.classList.remove('drop-target'));
        target.classList.add('drop-target');
    }
}

function dropOnStep(ev) {
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

function dropOnBank(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/id");
    const draggedElement = document.getElementById(id);
    const targetBank = ev.target.closest('#zone-banque');

    if (!targetBank || !draggedElement.classList.contains('dropped-tile')) return;
    
    const tileId = draggedElement.id;
    const stepIndex = parseInt(draggedElement.dataset.stepIndex);
    const category = draggedElement.dataset.category;
    
    removeTile(tileId, category, stepIndex);
    
    const originalId = `c-${tileId.split('-')[1]}`; 
    const originalTile = document.getElementById(originalId);

    if (originalTile) {
        originalTile.classList.remove('hidden');
        filterBank(currentTab); 
    }
    
    draggedElement.remove();
    targetBank.classList.remove('drop-target');
}

// =============================================================================
// GESTION DES TUILES
// =============================================================================
function createDroppedTile(originalTile, category, stepIndex) {
    const step = stairs[category].steps[stepIndex];
    const originalNumId = originalTile.id.split('-')[1]; 
    const tileId = `tile-${originalNumId}`; 
    
    const tile = document.createElement('div');
    tile.className = `dropped-tile ${category}`;
    tile.id = tileId; 
    tile.textContent = originalTile.dataset.text;
    tile.setAttribute('draggable', 'true');
    tile.setAttribute('ondragstart', 'drag(event)');
    tile.dataset.tileId = tileId;
    tile.dataset.stepIndex = stepIndex;
    tile.dataset.category = category;
    tile.dataset.text = originalTile.dataset.text;
    
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

// =============================================================================
// NAVIGATION (ONGLETS)
// =============================================================================
function switchTab(tabName) {
    currentTab = tabName;
    
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-button.${tabName}`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    const bankElement = document.getElementById('zone-vignettes-wrapper');
    const tabsContainerElement = document.querySelector('.tabs-container');
    const printButton = document.getElementById('btn-print-tableau');
    
    if (tabName === 'synthese') {
        generateSummaryTable();
        bankElement.classList.add('hidden');
        tabsContainerElement.classList.add('full-width');
        printButton.classList.remove('hidden');
    } else {
        bankElement.classList.remove('hidden');
        tabsContainerElement.classList.remove('full-width');
        printButton.classList.add('hidden');
        createStairs(tabName);
    }
    filterBank(tabName);
}

function filterBank(category) {
    const cards = document.querySelectorAll('#zone-banque .carte-item');
    cards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (category === 'synthese') {
            card.classList.add('hidden');
        } else if (cardCategory === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// =============================================================================
// ACTIONS UTILISATEUR
// =============================================================================
function reset() {
    Object.values(droppedTiles).forEach(tile => tile.remove());
    Object.keys(droppedTiles).forEach(key => delete droppedTiles[key]);
    
    CATEGORIES.forEach(cat => {
        stairs[cat.id].steps.forEach(step => {
            step.tiles = [];
        });
    });
    
    generateCards();
    switchTab(currentTab); 
}

function printTable() {
    generateSummaryTable();
    
    const tableDom = document.getElementById('tableau-synthese');
    const printContainer = document.getElementById('tableau-impression');
    
    if (!tableDom || !printContainer) return;
    
    const tableContentHtml = `
        <h1 style="text-align:center; margin-bottom: 20px;">Matrice de Progressivité IA - Compétences Élèves</h1>
        ${tableDom.outerHTML}`;
    
    printContainer.innerHTML = tableContentHtml;
    window.print();
    
    setTimeout(() => { 
        printContainer.innerHTML = '';
    }, 100); 
}

// =============================================================================
// INITIALISATION
// =============================================================================
async function init() {
    await loadLevels();
    await loadCategories();
    await loadCards();

    LEVELS = JSON.parse(sessionStorage.getItem('niveaux'));
    CATEGORIES = JSON.parse(sessionStorage.getItem('categories'));
    CARDS = JSON.parse(sessionStorage.getItem('cartes'));

    TILE_COUNTS = Object.fromEntries(
        CATEGORIES.map((cat) => [cat.id, CARDS.filter((c) => c.category === cat.id).length])
    );

    stairs = Object.fromEntries(
        CATEGORIES.map((cat) => [cat.id, { container: document.getElementById(`stair-${cat.id}`), steps: [] }])
    );

    generateCards();
    setupDragAndDrop(); 
    switchTab('savoir');
}

// =============================================================================
// ÉVÉNEMENTS GLOBAUX
// =============================================================================
window.addEventListener('resize', () => createStairs(currentTab));

// Exposer les fonctions au scope global pour les attributs HTML
window.drag = drag;
window.allowDrop = allowDrop;
window.dropOnStep = dropOnStep;
window.dropOnBank = dropOnBank;
window.switchTab = switchTab;
window.reset = reset;
window.printTable = printTable;

// =============================================================================
// DÉMARRAGE
// =============================================================================
init();