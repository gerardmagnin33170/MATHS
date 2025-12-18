import yaml from 'js-yaml';

// =============================================================================
// CONSTANTES
// =============================================================================
const TILE_HEIGHT_ESTIMATE = 50;
const ALERT_TIMEOUT = 5000;  // Durée d'affichage de l'alerte en millisecondes (5000 ms = 5 sec)

// =============================================================================
// VARIABLES GLOBALES
// =============================================================================
let LEVELS, CATEGORIES, CARDS, TILE_COUNTS, stairs;
let currentTab = 'savoir';
let editMode = true;  // Mode édition des cartes
const droppedTiles = {};

// =============================================================================
// CLASSES DE DONNÉES
// =============================================================================
function Card(category, text, minLevel = null) {
    Card.nextId = Card.nextId || 0;
    this.id = Card.nextId++;
    this.category = category;
    this.text = text;
    this.minLevel = minLevel;  // null = sans restriction, 0 = 6ème+, 1 = 5ème+, 2 = 4ème+, etc.
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
        const cards = data.map(item => new Card(item.categorie || '', item.texte || '', item.minLevel || null));
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
        card.dataset.minLevel = c.minLevel !== null ? c.minLevel : '';
        
        // Contenu texte
        const textSpan = document.createElement('span');
        textSpan.className = 'carte-text';
        textSpan.textContent = c.text;
        
        // Conteneur des actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'carte-actions';
        if (!editMode) {
            actionsDiv.classList.add('hidden');
        }
        
        // Bouton éditer
        const editBtn = document.createElement('button');
        editBtn.className = 'carte-action-btn carte-edit-btn';
        editBtn.textContent = '✏️';
        editBtn.title = 'Éditer';
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editMode) {
                makeCardEditable(c.id);
            }
        });
        
        // Bouton supprimer
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'carte-action-btn carte-delete-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Supprimer';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (editMode) {
                deleteCard(c.id);
            }
        });
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        card.appendChild(textSpan);
        card.appendChild(actionsDiv);
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
        // const top = containerHeight - minStepHeight + paddingValue;
        const top = containerHeight - minStepHeight - 50;
        
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
                
                // Vérifier l'alerte pour cette carte
                checkTileAlert(category, tileStepIndex, tile.id);
            }
        });
    }
    
    // Mettre à jour l'affichage global des alertes
    updateStairAlerts(category);
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
    tile.dataset.minLevel = originalTile.dataset.minLevel || '';
    
    step.element.appendChild(tile);
    tile.style.position = 'static'; 
    
    step.tiles.push({ id: tileId, element: tile });
    droppedTiles[tileId] = tile;
    
    // Vérifier si une alerte doit être affichée
    checkTileAlert(category, stepIndex, tileId);
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
    
    // Vérifier les alertes
    checkTileAlert(category, newStepIndex, tileId);
}

function removeTile(tileId, category, stepIndex) {
    const step = stairs[category].steps[stepIndex];
    const tile = droppedTiles[tileId];
    
    if (tile) {
        delete droppedTiles[tileId];
        step.tiles = step.tiles.filter(t => t.id !== tileId);
    }
    
    // Mettre à jour l'alerte si nécessaire
    updateStairAlerts(category);
}

function checkTileAlert(category, stepIndex, tileId) {
    // Vérifie si une carte est placée sur un niveau inférieur à minLevel
    const tile = droppedTiles[tileId];
    if (!tile) return;
    
    const minLevelStr = tile.dataset.minLevel;
    if (minLevelStr === '' || minLevelStr === undefined || minLevelStr === null) {
        // Pas de restriction
        tile.classList.remove('tile-alert');
    } else {
        const minLevel = parseInt(minLevelStr);
        if (stepIndex < minLevel) {
            // Alerte : la carte est trop haute dans l'escalier
            tile.classList.add('tile-alert');
        } else {
            tile.classList.remove('tile-alert');
        }
    }
    
    updateStairAlerts(category);
}

function updateStairAlerts(category) {
    const container = stairs[category].container;
    if (!container) return;
    
    // Supprimer les anciennes alertes
    const oldAlerts = container.querySelectorAll('.stair-alert');
    oldAlerts.forEach(alert => {
        // Annuler le timeout s'il existe
        if (alert.alertTimeout) {
            clearTimeout(alert.alertTimeout);
        }
        alert.remove();
    });
    
    // Vérifier s'il y a des cartes en alerte
    const alertTiles = container.querySelectorAll('.dropped-tile.tile-alert');
    if (alertTiles.length > 0) {
        // Ajouter une alerte sur le côté droit du conteneur
        const alert = document.createElement('div');
        alert.className = 'stair-alert';
        alert.innerHTML = `<div class="alert-icon">⚠️</div><div class="alert-text">${alertTiles.length} carte(s) mal placée(s)</div>`;
        container.appendChild(alert);
        
        // Définir un timeout pour supprimer l'alerte après ALERT_TIMEOUT millisecondes
        alert.alertTimeout = setTimeout(() => {
            alert.remove();
        }, ALERT_TIMEOUT);
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
    updateNewCardButtonColor(tabName);
}

function updateNewCardButtonColor(category) {
    const newCardBtn = document.getElementById('btn-new-card');
    if (!newCardBtn) return;
    
    // Mapping des couleurs selon la catégorie
    const colorMap = {
        'savoir': 'hsl(from var(--coul-savoir) h s calc(l - 2))',
        'enjeux': 'hsl(from var(--coul-enjeux) h s calc(l - 5))',
        'apprendre': 'hsl(from var(--coul-apprendre) h s calc(l - 5))'
    };
    
    // Appliquer les styles CSS avec les variables
    if (category === 'savoir') {
        newCardBtn.style.backgroundColor = 'hsl(47.9, 85.5%, 48.9%)';
    } else if (category === 'enjeux') {
        newCardBtn.style.backgroundColor = 'hsl(204, 70%, 53%)';
    } else if (category === 'apprendre') {
        newCardBtn.style.backgroundColor = 'hsl(141, 71%, 48%)';
    }
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
// GESTION DU MODE ÉDITION
// =============================================================================
function toggleEditMode() {
    editMode = true;
    
    // Afficher les boutons d'action
    document.querySelectorAll('.carte-actions').forEach(actions => {
        actions.classList.remove('hidden');
    });
    
    // Mettre à jour l'interface des boutons
    document.getElementById('btn-edit-mode').classList.add('hidden');
    document.getElementById('btn-lock-mode').classList.remove('hidden');
    
    // Afficher le bouton de création de carte (s'il existe)
    const newCardBtn = document.getElementById('btn-new-card');
    if (newCardBtn) {
        newCardBtn.style.display = 'block';
    }
}

function lockEditMode() {
    editMode = false;
    
    // Masquer les boutons d'action
    document.querySelectorAll('.carte-actions').forEach(actions => {
        actions.classList.add('hidden');
    });
    
    // Annuler toute édition en cours
    document.querySelectorAll('.card-edit-container').forEach(container => {
        container.remove();
    });
    document.querySelectorAll('.carte-item').forEach(card => {
        card.style.display = '';
    });
    
    // Mettre à jour l'interface des boutons
    document.getElementById('btn-lock-mode').classList.add('hidden');
    document.getElementById('btn-edit-mode').classList.remove('hidden');
    
    // Masquer le bouton de création de carte (s'il existe)
    const newCardBtn = document.getElementById('btn-new-card');
    if (newCardBtn) {
        newCardBtn.style.display = 'none';
    }
}

// =============================================================================
// CRÉATION DE CARTE VIERGE
// =============================================================================
function createEmptyCard() {
    // Déterminer la prochaine id disponible
    const maxId = Math.max(...CARDS.map(c => c.id), 0);
    const newId = maxId + 1;
    
    // Créer une nouvelle carte
    const newCard = new Card(currentTab, `Nouvelle carte ${newId}`);
    newCard.id = newId;
    CARDS.push(newCard);
    
    // Ajouter au sessionStorage
    sessionStorage.setItem('cartes', JSON.stringify(CARDS));
    
    // Générer les cartes et focus sur la nouvelle
    generateCards();
    filterBank(currentTab);
    makeCardEditable(newId);
}

function deleteCard(cardId) {
    // Confirmation de suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
        return;
    }
    
    // Trouver et supprimer la carte
    const idx = CARDS.findIndex(c => c.id === cardId);
    if (idx > -1) {
        CARDS.splice(idx, 1);
        sessionStorage.setItem('cartes', JSON.stringify(CARDS));
    }
    
    // Recalculer les compteurs et régénérer
    TILE_COUNTS = Object.fromEntries(
        CATEGORIES.map((cat) => [cat.id, CARDS.filter((c) => c.category === cat.id).length])
    );
    
    generateCards();
    filterBank(currentTab);
    createStairs(currentTab);
}

function makeCardEditable(cardId) {
    const cardElement = document.getElementById(`c-${cardId}`);
    if (!cardElement) return;
    
    const cardData = CARDS.find(c => c.id === cardId);
    if (!cardData) return;
    
    const originalText = cardData.text;
    const originalMinLevel = cardData.minLevel !== null ? cardData.minLevel : '';
    const isNewCard = originalText.startsWith('Nouvelle carte ');
    
    // Masquer les éléments existants
    cardElement.style.display = 'none';
    
    // Créer un conteneur d'édition
    const editContainer = document.createElement('div');
    editContainer.id = `edit-${cardId}`;
    editContainer.className = `card-edit-container carte-item ${cardData.category}`;
    editContainer.style.width = cardElement.offsetWidth + 'px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'card-edit-input';
    input.maxLength = 200;
    
    // Conteneur pour le champ minLevel
    const minLevelContainer = document.createElement('div');
    minLevelContainer.className = 'card-edit-minlevel';
    
    const minLevelLabel = document.createElement('label');
    minLevelLabel.htmlFor = `minlevel-${cardId}`;
    minLevelLabel.textContent = 'Niveau minimum:';
    
    const minLevelSelect = document.createElement('select');
    minLevelSelect.id = `minlevel-${cardId}`;
    minLevelSelect.className = 'card-edit-minlevel-select';
    
    // Options pour chaque niveau
    const levelNames = new Map([
        ['6ème', 0],
        ['4ème', 2],
    ]);

    // // Option pour pas de limite
    // const optionNone = document.createElement('option');
    // optionNone.value = '';
    // optionNone.textContent = '— Aucune limite';
    // minLevelSelect.appendChild(optionNone);

    levelNames.forEach((level, name) => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = 'à partir de la ' + name;
        console.log(name);
        minLevelSelect.appendChild(option);
    });
    // for (const name in levelNames) {
    //     const option = document.createElement('option');
    //     option.value = Object.values(name);
    //     option.textContent = 'à partir de la ' + name;
    //     console.log(levelNames[name]);
    //     minLevelSelect.appendChild(option);
    // };
    
    minLevelSelect.value = originalMinLevel;
    
    minLevelContainer.appendChild(minLevelLabel);
    minLevelContainer.appendChild(minLevelSelect);
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '✓';
    saveBtn.className = 'card-edit-btn-save';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    cancelBtn.className = 'card-edit-btn-cancel';
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'card-edit-buttons';
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    
    editContainer.appendChild(input);
    editContainer.appendChild(minLevelContainer);
    editContainer.appendChild(btnContainer);
    
    // Insérer à la place de la carte
    cardElement.parentNode.insertBefore(editContainer, cardElement);
    
    input.focus();
    input.select();
    
    function saveEdit() {
        const newText = input.value.trim();
        if (newText.length > 0) {
            cardData.text = newText;
            cardData.minLevel = minLevelSelect.value === '' ? null : parseInt(minLevelSelect.value);
            sessionStorage.setItem('cartes', JSON.stringify(CARDS));
        }
        editContainer.remove();
        cardElement.style.display = '';
        generateCards();
        filterBank(currentTab);
        // Mettre à jour les alertes pour l'escalier actif
        updateStairAlerts(currentTab);
    }
    
    function cancelEdit() {
        editContainer.remove();
        cardElement.style.display = '';
        
        // Si c'est une nouvelle carte, la supprimer de CARDS
        if (isNewCard) {
            const idx = CARDS.findIndex(c => c.id === cardId);
            if (idx > -1) {
                CARDS.splice(idx, 1);
                sessionStorage.setItem('cartes', JSON.stringify(CARDS));
                
                // Recalculer les compteurs
                TILE_COUNTS = Object.fromEntries(
                    CATEGORIES.map((cat) => [cat.id, CARDS.filter((c) => c.category === cat.id).length])
                );
                
                generateCards();
                filterBank(currentTab);
            }
        }
    }
    
    saveBtn.addEventListener('click', saveEdit);
    cancelBtn.addEventListener('click', cancelEdit);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') cancelEdit();
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
    
    // Ajouter les event listeners pour les boutons de mode édition
    document.getElementById('btn-edit-mode').addEventListener('click', toggleEditMode);
    document.getElementById('btn-lock-mode').addEventListener('click', lockEditMode);
    
    // Ajouter l'event listener pour le bouton de création de carte
    document.getElementById('btn-new-card').addEventListener('click', createEmptyCard);
    
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
window.toggleEditMode = toggleEditMode;
window.lockEditMode = lockEditMode;

// =============================================================================
// DÉMARRAGE
// =============================================================================
init();