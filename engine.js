// ===== GAME ENGINE =====

class GameEngine {
    constructor() {
        this.state = null;
    }

    newGame(playerCount, introMode = false) {
        const map = MapGenerator.generateMap(playerCount);

        this.state = {
            playerCount,
            introMode,
            round: 0,
            phase: PHASES.SETUP_PLACE_RESTAURANT,
            currentPlayerIndex: playerCount - 1, // reverse order for setup
            setupPlayersPlaced: new Set(),
            setupPassedPlayers: new Set(),
            setupRound: 1,
            turnOrder: Array.from({length: playerCount}, (_, i) => i),
            turnOrderIndex: 0,
            bank: introMode ? 75 * playerCount : 50 * playerCount,
            bankBroken: 0,
            reserveOpened: false,
            ceoSlots: 3,
            campaignCounter: 0,
            map,
            players: [],
            milestones: MILESTONES.map(m => ({
                ...m,
                owner: null,
                available: !introMode
            })),
            employeeSupply: {},
            log: [],
            gameOver: false,
            winner: null,

            // Working phase sub-state
            workingStep: 0,
            workingActions: [],

            // Dinnertime sub-state
            currentHouseIndex: 0,

            // UI interaction state
            pendingAction: null,
            selectedCards: [],
            hireCount: 0
        };

        // Initialize employee supply
        for (const [id, emp] of Object.entries(EMPLOYEES)) {
            this.state.employeeSupply[id] = emp.supply;
        }

        // Initialize players
        for (let i = 0; i < playerCount; i++) {
            this.state.players.push({
                id: i,
                name: PLAYER_NAMES[i],
                color: PLAYER_COLORS[i],
                cash: 0,
                hand: ['ceo'], // Cards in hand (by employee ID reference)
                beach: [],
                structure: { ceo: { card: 'ceo', subordinates: [] } },
                restaurants: [],
                maxRestaurants: 3,
                reserveCard: null,
                reserveRevealed: false,
                food: { burger: 0, pizza: 0 },
                drinks: { beer: 0, lemonade: 0, soda: 0 },
                freezer: [],
                milestones: [],
                busyMarketeers: [],
                recruitedThisTurn: 0,
                unusedRecruitActions: 0,
                earningsThisTurn: 0,

                // Owned employee card instances (unique IDs)
                ownedCards: [{uid: `p${i}_ceo`, empId: 'ceo', type: 'ceo-card'}]
            });
        }

        // Set up initial placement order (reverse)
        const order = Array.from({length: playerCount}, (_, i) => i);
        this.state.turnOrder = order;
        this.state.currentPlayerIndex = playerCount - 1;

        this.log(`Game started with ${playerCount} players. Bank: $${this.state.bank}`);
        this.log(`Place restaurants in reverse order.`);

        return this.state;
    }

    get currentPlayer() {
        return this.state.players[this.state.currentPlayerIndex];
    }

    log(msg) {
        this.state.log.push({
            round: this.state.round,
            phase: this.state.phase,
            message: msg,
            timestamp: Date.now()
        });
    }

    // ===== SETUP PHASES =====

    placeRestaurant(playerIndex, row, col, entranceCorner) {
        const player = this.state.players[playerIndex];
        const map = this.state.map;

        // Validate placement
        const positions = MapGenerator.getValidRestaurantPositions(map, map.restaurants, true);
        const valid = positions.find(p => p.row === row && p.col === col);
        if (!valid) return false;

        // Check entrance is valid
        const entrance = valid.entrances.find(e =>
            e.row === row + entranceCorner.dr && e.col === col + entranceCorner.dc
        );
        if (!entrance) return false;

        // During initial placement, no two entrances on same tile
        const entranceTile = MapGenerator.getTileIndex(entrance.row, entrance.col);
        for (const rest of map.restaurants) {
            const restTile = MapGenerator.getTileIndex(rest.entrance.row, rest.entrance.col);
            if (restTile.tileRow === entranceTile.tileRow && restTile.tileCol === entranceTile.tileCol) {
                return false;
            }
        }

        const restaurant = {
            owner: playerIndex,
            row, col,
            entrance: { row: entrance.row, col: entrance.col },
            roadAccess: { row: entrance.roadRow, col: entrance.roadCol },
            open: true, // WELCOME
            driveIn: false
        };

        map.restaurants.push(restaurant);
        player.restaurants.push(restaurant);

        // Mark grid cells as occupied
        for (let dr = 0; dr < 2; dr++) {
            for (let dc = 0; dc < 2; dc++) {
                map.grid[row + dr][col + dc] = 100 + playerIndex; // Player restaurant marker
            }
        }

        this.state.setupPlayersPlaced.add(playerIndex);
        this.log(`${player.name} placed a restaurant at (${row},${col})`);

        this.advanceSetup();
        return true;
    }

    advanceSetup() {
        if (this.state.phase === PHASES.SETUP_PLACE_RESTAURANT) {
            // Move to next player (reverse order)
            if (this.state.setupPlayersPlaced.size >= this.state.playerCount) {
                // All placed, move to reserve card selection
                if (this.state.introMode) {
                    this.startRound();
                } else {
                    this.state.phase = PHASES.SETUP_RESERVE_CARD;
                    this.state.currentPlayerIndex = 0;
                    this.log('All restaurants placed. Choose reserve cards.');
                }
                return;
            }

            // Find next player who hasn't placed yet (reverse order)
            let nextIdx = this.state.currentPlayerIndex - 1;
            if (nextIdx < 0) nextIdx = this.state.playerCount - 1;

            while (this.state.setupPlayersPlaced.has(nextIdx)) {
                nextIdx--;
                if (nextIdx < 0) nextIdx = this.state.playerCount - 1;
            }
            this.state.currentPlayerIndex = nextIdx;
        }
    }

    selectReserveCard(playerIndex, amount) {
        const player = this.state.players[playerIndex];
        const validAmounts = [100, 200, 300];
        if (!validAmounts.includes(amount)) return false;

        const slotsMap = {100: 2, 200: 3, 300: 4};
        player.reserveCard = { amount, slots: slotsMap[amount] };
        this.log(`${player.name} selected a reserve card.`);

        // Check if all players have selected
        const allSelected = this.state.players.every(p => p.reserveCard !== null);
        if (allSelected) {
            this.startRound();
        } else {
            // Move to next player
            this.state.currentPlayerIndex = (playerIndex + 1) % this.state.playerCount;
        }
        return true;
    }

    // ===== ROUND MANAGEMENT =====

    startRound() {
        this.state.round++;
        this.state.phase = PHASES.RESTRUCTURING;

        // Reset per-turn state
        for (const player of this.state.players) {
            player.recruitedThisTurn = 0;
            player.unusedRecruitActions = 0;
            player.earningsThisTurn = 0;
        }

        this.log(`=== Round ${this.state.round} ===`);
        this.log('Phase 1: Restructuring - Arrange your employees.');
    }

    // ===== PHASE 1: RESTRUCTURING =====

    submitStructure(playerIndex, structure) {
        // structure = { ceo: { subordinates: [cardUid, ...] }, managers: { cardUid: [cardUid, ...] } }
        const player = this.state.players[playerIndex];

        // Build the org structure
        const newStructure = { ceo: { card: 'ceo', subordinates: [] } };
        const inStructure = new Set();
        const beachCards = [];

        // Place cards in structure
        if (structure && structure.ceoSubs) {
            for (const uid of structure.ceoSubs) {
                const card = player.ownedCards.find(c => c.uid === uid);
                if (card) {
                    newStructure.ceo.subordinates.push(card);
                    inStructure.add(uid);

                    // If it's a manager, create manager entry
                    const empDef = EMPLOYEES[card.empId];
                    if (empDef && empDef.isManager) {
                        newStructure[uid] = {
                            card: card,
                            subordinates: []
                        };

                        // Add manager's subordinates
                        if (structure.managerSubs && structure.managerSubs[uid]) {
                            for (const subUid of structure.managerSubs[uid]) {
                                const subCard = player.ownedCards.find(c => c.uid === subUid);
                                if (subCard) {
                                    newStructure[uid].subordinates.push(subCard);
                                    inStructure.add(subUid);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Validate structure size
        const ceoSlots = this.state.ceoSlots;
        if (newStructure.ceo.subordinates.length > ceoSlots) {
            // Overflow - everyone goes to beach
            this.log(`${player.name}: Overflow! All employees sent to beach.`);
            player.structure = { ceo: { card: 'ceo', subordinates: [] } };
            player.beach = player.ownedCards.filter(c => c.empId !== 'ceo').map(c => c.uid);
            return true;
        }

        // Remaining cards go to beach
        for (const card of player.ownedCards) {
            if (card.empId === 'ceo') continue;
            if (!inStructure.has(card.uid)) {
                beachCards.push(card.uid);
            }
        }

        player.structure = newStructure;
        player.beach = beachCards;

        return true;
    }

    // Check if all players have submitted structures
    allStructuresSubmitted() {
        return true; // In hot-seat, we advance manually
    }

    finishRestructuring() {
        // Check for milestones triggered by playing cards
        for (const player of this.state.players) {
            const structCards = this.getStructureCards(player);

            // Check first_waitress
            if (structCards.some(c => c.empId === 'waitress')) {
                this.checkMilestone('play_waitress', player.id);
            }
            // Check first_errand_boy
            if (structCards.some(c => c.empId === 'errand_boy')) {
                this.checkMilestone('play_errand_boy', player.id);
            }
            // Check first_cart_operator
            if (structCards.some(c => c.empId === 'cart_operator')) {
                this.checkMilestone('play_cart_operator', player.id);
            }
            // Check first_lower_prices
            if (structCards.some(c => c.empId === 'pricing_manager' || c.empId === 'discount_manager')) {
                this.checkMilestone('play_pricing', player.id);
            }
        }

        this.state.phase = PHASES.ORDER_OF_BUSINESS;
        this.determineOrderOfBusiness();
    }

    getStructureCards(player) {
        const cards = [];
        for (const sub of player.structure.ceo.subordinates) {
            cards.push(sub);
            // If manager, add their subordinates
            if (player.structure[sub.uid]) {
                cards.push(...player.structure[sub.uid].subordinates);
            }
        }
        return cards;
    }

    // ===== PHASE 2: ORDER OF BUSINESS =====

    determineOrderOfBusiness() {
        const openSlots = this.state.players.map((player, idx) => {
            let slots = this.state.ceoSlots - player.structure.ceo.subordinates.length;

            // Count manager open slots
            for (const sub of player.structure.ceo.subordinates) {
                const empDef = EMPLOYEES[sub.empId];
                if (empDef && empDef.isManager && player.structure[sub.uid]) {
                    const maxSlots = empDef.slots;
                    const filled = player.structure[sub.uid].subordinates.length;
                    slots += (maxSlots - filled);
                }
            }

            // First airplane milestone adds +2
            if (player.milestones.includes('first_airplane')) {
                slots += 2;
            }

            return { playerIdx: idx, openSlots: slots };
        });

        // Sort by most open slots (descending), then previous turn order
        openSlots.sort((a, b) => {
            if (b.openSlots !== a.openSlots) return b.openSlots - a.openSlots;
            return this.state.turnOrder.indexOf(a.playerIdx) - this.state.turnOrder.indexOf(b.playerIdx);
        });

        this.state.turnOrder = openSlots.map(s => s.playerIdx);
        this.log(`Turn order: ${this.state.turnOrder.map(i => this.state.players[i].name).join(', ')}`);

        // Move to working phase
        this.state.phase = PHASES.WORKING;
        this.state.turnOrderIndex = 0;
        this.state.currentPlayerIndex = this.state.turnOrder[0];
        this.log('Phase 3: Working 9-5');

        this.prepareWorkingPhase();
    }

    // ===== PHASE 3: WORKING 9-5 =====

    prepareWorkingPhase() {
        const player = this.currentPlayer;
        const cards = this.getStructureCards(player);

        // CEO always recruits 1
        this.state.workingActions = [{type: 'ceo_recruit', card: {uid: `p${player.id}_ceo`, empId: 'ceo'}, empDef: null}];

        // Sort cards by action order
        const actionOrder = [
            'place_house', 'pricing', 'cfo', 'recruit', 'train',
            'campaign', 'produce', 'buy_drink', 'place_restaurant', 'waitress'
        ];

        const sorted = [...cards].sort((a, b) => {
            const aEmp = EMPLOYEES[a.empId];
            const bEmp = EMPLOYEES[b.empId];
            const aOrder = actionOrder.indexOf(aEmp?.action || '');
            const bOrder = actionOrder.indexOf(bEmp?.action || '');
            return aOrder - bOrder;
        });

        for (const card of sorted) {
            const emp = EMPLOYEES[card.empId];
            if (!emp || !emp.action) continue;

            // Skip busy marketeers
            if (player.busyMarketeers.includes(card.uid)) continue;

            // Skip managers without specific actions (they just hold slots)
            if (emp.isManager && !['pricing', 'cfo', 'place_house', 'place_restaurant'].includes(emp.action || '')) continue;

            this.state.workingActions.push({
                type: emp.action,
                card: card,
                empDef: emp
            });
        }

        this.state.workingStep = 0;
        this.log(`${player.name}'s turn to work.`);
    }

    getCurrentWorkAction() {
        if (this.state.workingStep >= this.state.workingActions.length) return null;
        return this.state.workingActions[this.state.workingStep];
    }

    // Execute an auto-action or advance to next action
    executeWorkAction(actionData) {
        const player = this.currentPlayer;
        const action = this.getCurrentWorkAction();
        if (!action) { this.finishPlayerWork(); return; }

        const emp = action.empDef || EMPLOYEES[action.card?.empId];

        switch (action.type) {
            case 'ceo_recruit': {
                // CEO recruits 1 entry-level employee
                if (actionData?.hired) {
                    const empDef = EMPLOYEES[actionData.hired];
                    if (empDef && empDef.entryLevel && this.state.employeeSupply[actionData.hired] > 0) {
                        this.state.employeeSupply[actionData.hired]--;
                        const uid = `p${player.id}_${actionData.hired}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
                        player.ownedCards.push({uid, empId: actionData.hired, type: empDef.type});
                        player.beach.push(uid);
                        player.recruitedThisTurn++;
                        this.log(`${player.name}: CEO hired ${empDef.name}`);

                        if (player.recruitedThisTurn >= 3) {
                            this.checkMilestone('hire_3_in_turn', player.id);
                        }
                    }
                    this.state.workingStep++;
                } else if (actionData?.skip) {
                    this.state.workingStep++;
                }
                break;
            }

            case 'produce': {
                if (emp.produces.choice) {
                    // Kitchen trainee - needs player choice (handled by UI)
                    if (actionData?.foodType) {
                        player.food[actionData.foodType] += 1;
                        this.log(`${player.name}: Kitchen Trainee produced 1 ${actionData.foodType}`);
                        this.checkMilestone(actionData.foodType === 'burger' ? 'produce_burger' : 'produce_pizza', player.id);
                        this.state.workingStep++;
                    }
                } else {
                    // Auto-produce
                    for (const [type, amount] of Object.entries(emp.produces)) {
                        player.food[type] = (player.food[type] || 0) + amount;
                        this.log(`${player.name}: ${emp.name} produced ${amount} ${type}(s)`);
                        this.checkMilestone(type === 'burger' ? 'produce_burger' : 'produce_pizza', player.id);
                    }
                    this.state.workingStep++;
                }
                break;
            }

            case 'buy_drink': {
                if (emp.anyDrink) {
                    // Errand boy - player chooses drink type
                    if (actionData?.drinkType) {
                        let amount = emp.drinksPerSymbol;
                        if (player.milestones.includes('first_errand_boy')) amount += 1;
                        player.drinks[actionData.drinkType] = (player.drinks[actionData.drinkType] || 0) + amount;
                        this.log(`${player.name}: Errand Boy acquired ${amount} ${actionData.drinkType}`);
                        this.state.workingStep++;
                    }
                } else {
                    // Route-based buying - auto-find best route
                    this.autoBuyDrinks(player, emp, action.card);
                    this.state.workingStep++;
                }
                break;
            }

            case 'recruit': {
                // Handled by UI
                if (actionData?.hired) {
                    const empDef = EMPLOYEES[actionData.hired];
                    if (empDef && empDef.entryLevel && this.state.employeeSupply[actionData.hired] > 0) {
                        this.state.employeeSupply[actionData.hired]--;
                        const uid = `p${player.id}_${actionData.hired}_${Date.now()}`;
                        player.ownedCards.push({uid, empId: actionData.hired, type: empDef.type});
                        player.beach.push(uid);
                        player.recruitedThisTurn++;
                        this.log(`${player.name} hired ${empDef.name}`);

                        // Check hire 3 milestone
                        if (player.recruitedThisTurn >= 3) {
                            this.checkMilestone('hire_3_in_turn', player.id);
                        }
                    }
                } else if (actionData?.skip) {
                    if (emp?.salaryDiscount) {
                        player.unusedRecruitActions++;
                    }
                    this.state.workingStep++;
                }
                break;
            }

            case 'train': {
                // Handled by UI
                if (actionData?.trainTarget && actionData?.trainTo) {
                    const targetCard = player.ownedCards.find(c => c.uid === actionData.trainTarget);
                    if (targetCard && player.beach.includes(targetCard.uid)) {
                        const fromEmp = EMPLOYEES[targetCard.empId];
                        const toEmp = EMPLOYEES[actionData.trainTo];
                        if (fromEmp && toEmp && (fromEmp.trainsTo?.includes(actionData.trainTo) || this.canTrainThrough(targetCard.empId, actionData.trainTo))) {
                            targetCard.empId = actionData.trainTo;
                            targetCard.type = toEmp.type;
                            this.log(`${player.name}: Trained ${fromEmp.name} to ${toEmp.name}`);
                            this.checkMilestone('train_employee', player.id);
                        }
                    }
                } else if (actionData?.skip) {
                    this.state.workingStep++;
                }
                break;
            }

            case 'campaign': {
                // Handled by UI
                if (actionData?.placed) {
                    this.state.workingStep++;
                } else if (actionData?.skip) {
                    this.state.workingStep++;
                }
                break;
            }

            case 'pricing': {
                // Auto-applied during dinnertime
                this.state.workingStep++;
                break;
            }

            case 'cfo': {
                // Auto-applied during dinnertime
                this.state.workingStep++;
                break;
            }

            case 'waitress': {
                // Auto-applied during dinnertime
                this.state.workingStep++;
                break;
            }

            case 'place_house':
            case 'place_restaurant': {
                // Handled by UI
                if (actionData?.placed || actionData?.skip) {
                    this.state.workingStep++;
                }
                break;
            }

            default:
                this.state.workingStep++;
        }

        // Check if this player's work is done
        if (this.state.workingStep >= this.state.workingActions.length) {
            this.finishPlayerWork();
        }
    }

    skipWorkAction() {
        const action = this.getCurrentWorkAction();
        if (action) {
            const emp = action.empDef;
            if (emp?.salaryDiscount) {
                this.currentPlayer.unusedRecruitActions++;
            }
        }
        this.state.workingStep++;
        if (this.state.workingStep >= this.state.workingActions.length) {
            this.finishPlayerWork();
        }
    }

    canTrainThrough(fromId, toId) {
        // Check if there's a training path from fromId to toId
        const visited = new Set();
        const queue = [fromId];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === toId) return true;
            if (visited.has(current)) continue;
            visited.add(current);
            const emp = EMPLOYEES[current];
            if (emp?.trainsTo) {
                queue.push(...emp.trainsTo);
            }
        }
        return false;
    }

    autoBuyDrinks(player, emp, card) {
        // Find best route for advanced buyers
        let range = emp.range;
        if (player.milestones.includes('first_cart_operator')) range += 1;

        let bestDrinks = {};
        for (const rest of player.restaurants) {
            if (!rest.open) continue;

            const entrances = this.getRestaurantEntrances(player, rest);
            for (const entrance of entrances) {
                const sources = MapGenerator.findDrinkSources(
                    this.state.map, entrance.roadRow, entrance.roadCol,
                    range, emp.routeType
                );

                let perSymbol = emp.drinksPerSymbol;
                if (player.milestones.includes('first_errand_boy')) perSymbol += 1;

                const drinks = {};
                for (const src of sources) {
                    drinks[src.type] = (drinks[src.type] || 0) + perSymbol;
                }

                // Use this route if it gives more total drinks
                const total = Object.values(drinks).reduce((a, b) => a + b, 0);
                const bestTotal = Object.values(bestDrinks).reduce((a, b) => a + b, 0);
                if (total > bestTotal) bestDrinks = drinks;
            }
        }

        for (const [type, amount] of Object.entries(bestDrinks)) {
            player.drinks[type] = (player.drinks[type] || 0) + amount;
        }

        const total = Object.values(bestDrinks).reduce((a, b) => a + b, 0);
        if (total > 0) {
            this.log(`${player.name}: ${emp.name} acquired ${total} drinks`);
        }
    }

    getRestaurantEntrances(player, rest) {
        // Check if player has drive-in capability
        const structCards = this.getStructureCards(player);
        const hasDriveIn = structCards.some(c =>
            c.empId === 'local_manager' || c.empId === 'regional_manager'
        );

        if (hasDriveIn) {
            // All corners are entrances
            const entrances = [];
            const corners = [{dr:0,dc:0},{dr:0,dc:1},{dr:1,dc:0},{dr:1,dc:1}];
            for (const corner of corners) {
                const cr = rest.row + corner.dr;
                const cc = rest.col + corner.dc;
                // Find adjacent road
                const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                for (const [dr, dc] of dirs) {
                    const rr = cr + dr;
                    const rc = cc + dc;
                    if (rr >= 0 && rr < this.state.map.rows && rc >= 0 && rc < this.state.map.cols) {
                        if (this.state.map.grid[rr][rc] === CELL.ROAD) {
                            entrances.push({row: cr, col: cc, roadRow: rr, roadCol: rc});
                            break;
                        }
                    }
                }
            }
            return entrances;
        }

        return [{
            row: rest.entrance.row,
            col: rest.entrance.col,
            roadRow: rest.roadAccess.row,
            roadCol: rest.roadAccess.col
        }];
    }

    finishPlayerWork() {
        this.state.turnOrderIndex++;
        if (this.state.turnOrderIndex >= this.state.playerCount) {
            this.startDinnertime();
        } else {
            this.state.currentPlayerIndex = this.state.turnOrder[this.state.turnOrderIndex];
            this.prepareWorkingPhase();
        }
    }

    // ===== PHASE 4: DINNERTIME =====

    startDinnertime() {
        this.state.phase = PHASES.DINNERTIME;
        this.state.currentHouseIndex = 0;
        this.log('Phase 4: Dinnertime!');
        this.processDinnertime();
    }

    processDinnertime() {
        const map = this.state.map;
        const houses = [...map.houses].sort((a, b) => a.number - b.number);

        for (const house of houses) {
            if (house.demand.length === 0) continue;

            // Find chains that can fulfill complete demand
            const candidates = [];
            for (const player of this.state.players) {
                if (this.canFulfillDemand(player, house)) {
                    const price = this.getUnitPrice(player);
                    const distance = this.getMinDistance(player, house);
                    const waitresses = this.countWaitresses(player);
                    const turnPos = this.state.turnOrder.indexOf(player.id);

                    candidates.push({
                        player,
                        unitPrice: price,
                        distance,
                        total: price + distance,
                        waitresses,
                        turnPos
                    });
                }
            }

            if (candidates.length === 0) continue;

            // Sort by total (asc), then waitresses (desc), then turn order (asc)
            candidates.sort((a, b) => {
                if (a.total !== b.total) return a.total - b.total;
                if (a.waitresses !== b.waitresses) return b.waitresses - a.waitresses;
                return a.turnPos - b.turnPos;
            });

            const winner = candidates[0];
            this.sellToHouse(winner.player, house, winner.unitPrice);
        }

        // Calculate waitress tips and CFO bonuses
        for (const player of this.state.players) {
            const waitresses = this.countWaitresses(player);
            if (waitresses > 0) {
                const tipAmount = player.milestones.includes('first_waitress') ? 5 : 3;
                const tips = waitresses * tipAmount;
                player.earningsThisTurn += tips;
                this.log(`${player.name}: $${tips} in waitress tips`);
            }

            // CFO bonus
            const hasCFO = this.getStructureCards(player).some(c => c.empId === 'cfo') ||
                           player.milestones.includes('first_100_cash');
            if (hasCFO && player.earningsThisTurn > 0) {
                const bonus = Math.ceil(player.earningsThisTurn * 0.5);
                player.earningsThisTurn += bonus;
                this.log(`${player.name}: CFO bonus +$${bonus}`);
            }

            // Pay earnings from bank
            if (player.earningsThisTurn > 0) {
                this.payFromBank(player, player.earningsThisTurn);
            }
        }

        // Check $20 and $100 milestones
        for (const player of this.state.players) {
            if (player.cash >= 20) this.checkMilestone('have_20', player.id);
            if (player.cash >= 100) this.checkMilestone('have_100', player.id);
        }

        // Check for bank break
        if (this.state.bank <= 0 && this.state.bankBroken < 2) {
            this.handleBankBreak();
        }

        if (this.state.gameOver) {
            this.endGame();
            return;
        }

        this.startPayday();
    }

    canFulfillDemand(player, house) {
        if (!player.restaurants.some(r => r.open)) return false;

        // Check if player can reach the house
        const distance = this.getMinDistance(player, house);
        if (distance === Infinity) return false;

        // Count demand
        const needed = {};
        for (const d of house.demand) {
            needed[d] = (needed[d] || 0) + 1;
        }

        // Check supply
        for (const [type, amount] of Object.entries(needed)) {
            const available = type === 'burger' || type === 'pizza'
                ? (player.food[type] || 0)
                : (player.drinks[type] || 0);
            if (available < amount) return false;
        }

        return true;
    }

    getUnitPrice(player) {
        let price = 10;

        const structCards = this.getStructureCards(player);
        for (const card of structCards) {
            const emp = EMPLOYEES[card.empId];
            if (emp?.priceModifier) price += emp.priceModifier;
        }

        if (player.milestones.includes('first_lower_prices')) price -= 1;

        return Math.max(1, price);
    }

    getMinDistance(player, house) {
        let minDist = Infinity;
        for (const rest of player.restaurants) {
            if (!rest.open) continue;
            const entrances = this.getRestaurantEntrances(player, rest);
            for (const entrance of entrances) {
                const dist = MapGenerator.roadDistance(
                    this.state.map, house.row, house.col, entrance.roadRow, entrance.roadCol
                );
                minDist = Math.min(minDist, dist);
            }
        }
        return minDist;
    }

    countWaitresses(player) {
        return this.getStructureCards(player).filter(c => c.empId === 'waitress').length;
    }

    sellToHouse(player, house, unitPrice) {
        const items = house.demand.length;
        const hasGarden = house.garden;
        const effectivePrice = hasGarden ? unitPrice * 2 : unitPrice;
        let revenue = effectivePrice * items;

        // Milestone bonuses
        const burgers = house.demand.filter(d => d === 'burger').length;
        const pizzas = house.demand.filter(d => d === 'pizza').length;
        const drinks = house.demand.filter(d => d === 'beer' || d === 'lemonade' || d === 'soda').length;

        if (player.milestones.includes('first_burger_marketed')) revenue += burgers * 5;
        if (player.milestones.includes('first_pizza_marketed')) revenue += pizzas * 5;
        if (player.milestones.includes('first_drink_marketed')) revenue += drinks * 5;

        player.earningsThisTurn += revenue;

        // Remove items from inventory
        for (const d of house.demand) {
            if (d === 'burger' || d === 'pizza') {
                player.food[d]--;
            } else {
                player.drinks[d]--;
            }
        }

        this.log(`${player.name} sold to house #${house.number}: $${revenue} (${items} items @ $${effectivePrice})`);
        house.demand = [];
    }

    payFromBank(player, amount) {
        const paid = Math.min(amount, this.state.bank);
        player.cash += paid;
        this.state.bank -= paid;

        if (paid < amount && this.state.bankBroken < 2) {
            this.handleBankBreak();
            // Try to pay remainder
            const remainder = amount - paid;
            const extraPaid = Math.min(remainder, this.state.bank);
            player.cash += extraPaid;
            this.state.bank -= extraPaid;
        }
    }

    handleBankBreak() {
        this.state.bankBroken++;
        this.log(`*** BANK BROKEN (${this.state.bankBroken}${this.state.bankBroken === 1 ? 'st' : 'nd'} time) ***`);

        if (this.state.bankBroken === 1 && !this.state.introMode) {
            // Open reserve cards
            let totalReserve = 0;
            const slotVotes = {};

            for (const player of this.state.players) {
                if (player.reserveCard) {
                    totalReserve += player.reserveCard.amount;
                    const slots = player.reserveCard.slots;
                    slotVotes[slots] = (slotVotes[slots] || 0) + 1;
                    player.reserveRevealed = true;
                }
            }

            this.state.bank += totalReserve;
            this.log(`Reserve adds $${totalReserve} to bank. Bank now: $${this.state.bank}`);

            // Determine CEO slots
            let maxVotes = 0;
            let winningSlots = 3;
            for (const [slots, votes] of Object.entries(slotVotes)) {
                if (votes > maxVotes || (votes === maxVotes && parseInt(slots) > winningSlots)) {
                    maxVotes = votes;
                    winningSlots = parseInt(slots);
                }
            }
            this.state.ceoSlots = winningSlots;
            this.state.reserveOpened = true;
            this.log(`CEO slots set to ${winningSlots}`);
        } else if (this.state.bankBroken >= 2) {
            this.state.gameOver = true;
        }
    }

    // ===== PHASE 5: PAYDAY =====

    startPayday() {
        this.state.phase = PHASES.PAYDAY;
        this.log('Phase 5: Payday');

        for (const player of this.state.players) {
            this.processPayday(player);
        }

        this.startMarketingPhase();
    }

    processPayday(player) {
        // Calculate total salary
        let totalSalary = 0;
        for (const card of player.ownedCards) {
            const emp = EMPLOYEES[card.empId];
            if (emp && emp.salary > 0) totalSalary += emp.salary;
        }

        // Apply discounts
        let discount = player.unusedRecruitActions * 5;
        if (player.milestones.includes('first_train')) discount += 15;
        totalSalary = Math.max(0, totalSalary - discount);

        if (totalSalary > 0) {
            if (player.cash >= totalSalary) {
                player.cash -= totalSalary;
                this.state.bank += totalSalary;
                this.log(`${player.name} paid $${totalSalary} in salaries`);

                // Check salary milestone
                if (totalSalary >= 20) {
                    this.checkMilestone('pay_20_salary', player.id);
                }
            } else {
                // Can't pay all - fire employees until affordable
                this.log(`${player.name} can't afford $${totalSalary} salary!`);
                // Auto-fire most expensive first
                const fireable = player.ownedCards
                    .filter(c => {
                        const emp = EMPLOYEES[c.empId];
                        return emp && emp.salary > 0 && !player.busyMarketeers.includes(c.uid);
                    })
                    .sort((a, b) => (EMPLOYEES[b.empId]?.salary || 0) - (EMPLOYEES[a.empId]?.salary || 0));

                while (player.cash < totalSalary && fireable.length > 0) {
                    const fired = fireable.pop();
                    const emp = EMPLOYEES[fired.empId];
                    totalSalary -= emp.salary;
                    this.fireEmployee(player, fired.uid);
                    this.log(`${player.name}: ${emp.name} quit (can't pay salary)`);
                }

                if (totalSalary > 0 && player.cash >= totalSalary) {
                    player.cash -= totalSalary;
                    this.state.bank += totalSalary;
                }
            }
        }
    }

    fireEmployee(player, cardUid) {
        const card = player.ownedCards.find(c => c.uid === cardUid);
        if (!card) return;

        // Return to supply
        const emp = EMPLOYEES[card.empId];
        if (emp) this.state.employeeSupply[card.empId]++;

        // Remove from owned cards
        player.ownedCards = player.ownedCards.filter(c => c.uid !== cardUid);
        player.beach = player.beach.filter(uid => uid !== cardUid);
    }

    // ===== PHASE 6: MARKETING CAMPAIGNS =====

    startMarketingPhase() {
        this.state.phase = PHASES.MARKETING_CAMPAIGNS;
        this.log('Phase 6: Marketing Campaigns');
        this.processMarketingCampaigns();
    }

    processMarketingCampaigns() {
        const map = this.state.map;
        const campaigns = [...map.campaigns].sort((a, b) => a.number - b.number);

        for (const campaign of campaigns) {
            const player = this.state.players[campaign.owner];
            const isPermanent = player.milestones.includes('first_billboard');

            // Place demand on houses in reach
            const housesInReach = this.getHousesInCampaignReach(campaign);

            for (const house of housesInReach) {
                const maxDemand = house.garden ? 5 : 3;
                if (house.demand.length < maxDemand) {
                    const tokensToPlace = campaign.type === 'radio' &&
                        player.milestones.includes('first_radio') ? 2 : 1;

                    for (let i = 0; i < tokensToPlace && house.demand.length < maxDemand; i++) {
                        house.demand.push(campaign.product);
                    }
                }
            }

            // Remove a token (unless permanent)
            if (!isPermanent) {
                campaign.duration--;
                if (campaign.duration <= 0) {
                    // Campaign ends
                    map.campaigns = map.campaigns.filter(c => c !== campaign);
                    // Free the marketeer
                    const ownerPlayer = this.state.players[campaign.owner];
                    ownerPlayer.busyMarketeers = ownerPlayer.busyMarketeers.filter(uid => uid !== campaign.marketeerUid);
                    this.log(`Campaign #${campaign.number} ended.`);
                }
            }
        }

        this.startCleanup();
    }

    getHousesInCampaignReach(campaign) {
        const map = this.state.map;
        const houses = [];

        switch (campaign.type) {
            case 'billboard': {
                // All houses orthogonally adjacent to billboard
                const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                for (const [dr, dc] of dirs) {
                    const r = campaign.row + dr;
                    const c = campaign.col + dc;
                    const house = map.houses.find(h => h.row === r && h.col === c);
                    if (house) houses.push(house);
                }
                break;
            }
            case 'mailbox': {
                // All houses in same block (enclosed area)
                const block = this.findBlock(campaign.row, campaign.col);
                for (const house of map.houses) {
                    if (block.has(`${house.row},${house.col}`)) houses.push(house);
                }
                break;
            }
            case 'airplane': {
                // All houses in the flyover zone (row or column strip)
                for (const house of map.houses) {
                    if (campaign.direction === 'row') {
                        if (Math.abs(house.row - campaign.row) <= Math.floor(campaign.size / 2)) {
                            houses.push(house);
                        }
                    } else {
                        if (Math.abs(house.col - campaign.col) <= Math.floor(campaign.size / 2)) {
                            houses.push(house);
                        }
                    }
                }
                break;
            }
            case 'radio': {
                // All houses on same tile and 8 surrounding tiles
                const tile = MapGenerator.getTileIndex(campaign.row, campaign.col);
                for (const house of map.houses) {
                    const houseTile = MapGenerator.getTileIndex(house.row, house.col);
                    if (Math.abs(houseTile.tileRow - tile.tileRow) <= 1 &&
                        Math.abs(houseTile.tileCol - tile.tileCol) <= 1) {
                        houses.push(house);
                    }
                }
                break;
            }
        }

        return houses;
    }

    findBlock(row, col) {
        // Flood fill to find enclosed area (bounded by roads and board edges)
        const map = this.state.map;
        const block = new Set();
        const visited = new Set();
        const queue = [{r: row, c: col}];

        while (queue.length > 0) {
            const {r, c} = queue.shift();
            const key = `${r},${c}`;
            if (visited.has(key)) continue;
            if (r < 0 || r >= map.rows || c < 0 || c >= map.cols) continue;
            if (map.grid[r][c] === CELL.ROAD) continue;

            visited.add(key);
            block.add(key);

            queue.push({r: r-1, c}, {r: r+1, c}, {r, c: c-1}, {r, c: c+1});
        }

        return block;
    }

    // ===== PHASE 7: CLEANUP =====

    startCleanup() {
        this.state.phase = PHASES.CLEANUP;
        this.log('Phase 7: Cleanup');

        for (const player of this.state.players) {
            // Discard food and drinks
            const hasFreezer = player.milestones.includes('first_throw_food') ||
                               player.milestones.includes('first_throw_drink');

            const totalFood = Object.values(player.food).reduce((a, b) => a + b, 0);
            const totalDrinks = Object.values(player.drinks).reduce((a, b) => a + b, 0);

            // Check throw away milestones
            if (totalFood > 0) this.checkMilestone('throw_food', player.id);
            if (totalDrinks > 0) this.checkMilestone('throw_drink', player.id);

            if (hasFreezer) {
                // Can store up to 10 items total
                let stored = 0;
                const maxStore = 10;
                player.freezer = [];

                for (const type of ['burger', 'pizza', 'beer', 'lemonade', 'soda']) {
                    const available = type === 'burger' || type === 'pizza'
                        ? player.food[type] : player.drinks[type];
                    const toStore = Math.min(available, maxStore - stored);
                    for (let i = 0; i < toStore; i++) {
                        player.freezer.push(type);
                        stored++;
                    }
                }
            }

            // Clear food and drinks
            player.food = { burger: 0, pizza: 0 };
            player.drinks = { beer: 0, lemonade: 0, soda: 0 };

            // Restore freezer items
            if (hasFreezer) {
                for (const item of player.freezer) {
                    if (item === 'burger' || item === 'pizza') {
                        player.food[item]++;
                    } else {
                        player.drinks[item]++;
                    }
                }
            }

            // Return all cards to hand
            player.beach = [];
            player.structure = { ceo: { card: 'ceo', subordinates: [] } };

            // Flip COMING SOON restaurants to WELCOME
            for (const rest of player.restaurants) {
                if (!rest.open) rest.open = true;
            }
        }

        // Start new round
        this.startRound();
    }

    // ===== MILESTONES =====

    checkMilestone(trigger, playerIdx) {
        if (this.state.introMode) return;

        const milestone = this.state.milestones.find(m => m.trigger === trigger && m.available && m.owner === null);
        if (!milestone) return;

        const player = this.state.players[playerIdx];
        milestone.owner = playerIdx;
        player.milestones.push(milestone.id);

        this.log(`*** ${player.name} earned milestone: ${milestone.name}! ***`);

        // Apply immediate effects
        switch (milestone.id) {
            case 'first_hire_3':
                // Give 2 free management trainees
                for (let i = 0; i < 2; i++) {
                    if (this.state.employeeSupply.management_trainee > 0) {
                        this.state.employeeSupply.management_trainee--;
                        const uid = `p${playerIdx}_mgmt_bonus_${i}_${Date.now()}`;
                        player.ownedCards.push({uid, empId: 'management_trainee', type: 'management'});
                        player.beach.push(uid);
                    }
                }
                break;
            case 'first_burger_produced':
                if (this.state.employeeSupply.burger_cook > 0) {
                    this.state.employeeSupply.burger_cook--;
                    const uid = `p${playerIdx}_burger_cook_bonus_${Date.now()}`;
                    player.ownedCards.push({uid, empId: 'burger_cook', type: 'kitchen'});
                    player.beach.push(uid);
                }
                break;
            case 'first_pizza_produced':
                if (this.state.employeeSupply.pizza_cook > 0) {
                    this.state.employeeSupply.pizza_cook--;
                    const uid = `p${playerIdx}_pizza_cook_bonus_${Date.now()}`;
                    player.ownedCards.push({uid, empId: 'pizza_cook', type: 'kitchen'});
                    player.beach.push(uid);
                }
                break;
            case 'first_100_cash':
                // CEO gains CFO ability - fire existing CFO if any
                const cfo = player.ownedCards.find(c => c.empId === 'cfo');
                if (cfo) {
                    this.fireEmployee(player, cfo.uid);
                    this.log(`${player.name} must fire their CFO.`);
                }
                break;
        }

        // Lock remaining copies of this milestone
        for (const m of this.state.milestones) {
            if (m.trigger === trigger && m.owner === null) {
                m.available = false;
            }
        }
    }

    // ===== END GAME =====

    endGame() {
        this.state.phase = PHASES.GAME_OVER;
        this.state.gameOver = true;

        // Determine winner
        let maxCash = -1;
        let winner = null;
        for (const player of this.state.players) {
            if (player.cash > maxCash) {
                maxCash = player.cash;
                winner = player;
            } else if (player.cash === maxCash) {
                // Tiebreaker: earlier turn order
                if (this.state.turnOrder.indexOf(player.id) < this.state.turnOrder.indexOf(winner.id)) {
                    winner = player;
                }
            }
        }

        this.state.winner = winner;
        this.log(`Game Over! ${winner.name} wins with $${winner.cash}!`);
    }

    // ===== UTILITY =====

    getState() {
        return this.state;
    }

    // Expose for testing
    renderGameToText() {
        if (!this.state) return '{}';
        return JSON.stringify({
            round: this.state.round,
            phase: this.state.phase,
            bank: this.state.bank,
            players: this.state.players.map(p => ({
                name: p.name,
                cash: p.cash,
                cards: p.ownedCards.length,
                restaurants: p.restaurants.length
            })),
            gameOver: this.state.gameOver,
            winner: this.state.winner?.name
        });
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.render_game_to_text = () => window.gameEngine?.renderGameToText() || '{}';
}
