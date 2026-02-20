// ===== UI CONTROLLER =====

class UIController {
    constructor(engine, renderer) {
        this.engine = engine;
        this.renderer = renderer;
        this.selectedReserve = null;
        this._campaignProduct = null;
        this._campaignDuration = 1;
        this._recruitsRemaining = 0;
        this._lastPhase = null;
    }

    updateAll() {
        const state = this.engine.getState();
        if (!state) return;

        this.showPhaseTransition(state);
        this.updateTopBar(state);
        this.updateCurrentPlayerBanner(state);
        this.updatePlayerPanel(state);
        this.updateActionPanel(state);
        this.updateOrgChart(state);
        this.updateMilestones(state);
        this.updateBottomBar(state);
        this.updateEmployeeMarket(state);
        this.renderer.render(state);
        this.updateLog(state);
    }

    // ===== PHASE TRANSITION OVERLAY =====
    showPhaseTransition(state) {
        if (this._lastPhase === null) {
            this._lastPhase = state.phase;
            return;
        }
        if (state.phase === this._lastPhase) return;

        this._lastPhase = state.phase;
        const overlay = document.getElementById('phase-overlay');
        const phaseName = PHASE_NAMES[state.phase] || state.phase;
        const phaseDesc = PHASE_DESCRIPTIONS[state.phase] || '';

        overlay.innerHTML = `
            <div class="phase-overlay-title">${phaseName}</div>
            <div class="phase-overlay-desc">${phaseDesc}</div>
        `;
        overlay.classList.add('show');

        setTimeout(() => {
            overlay.classList.remove('show');
        }, 1500);
    }

    // ===== CURRENT PLAYER BANNER =====
    updateCurrentPlayerBanner(state) {
        const banner = document.getElementById('current-player-banner');
        const icon = document.getElementById('cpb-icon');
        const name = document.getElementById('cpb-name');
        const action = document.getElementById('cpb-phase-action');

        // Hide during auto-processing phases and game over
        const autoPhases = [PHASES.DINNERTIME, PHASES.PAYDAY, PHASES.MARKETING_CAMPAIGNS, PHASES.CLEANUP, PHASES.ORDER_OF_BUSINESS, PHASES.GAME_OVER];
        if (autoPhases.includes(state.phase)) {
            banner.classList.add('hidden');
            return;
        }

        const player = state.players[state.currentPlayerIndex];
        if (!player) {
            banner.classList.add('hidden');
            return;
        }

        banner.classList.remove('hidden');
        banner.style.borderLeftColor = player.color;
        icon.textContent = '\u25B6';
        name.textContent = player.name;
        name.style.color = player.color;

        // Phase-specific action text
        const actionTexts = {
            [PHASES.SETUP_PLACE_RESTAURANT]: 'is placing a restaurant...',
            [PHASES.SETUP_RESERVE_CARD]: 'is choosing a reserve card...',
            [PHASES.RESTRUCTURING]: 'is building their org chart...',
            [PHASES.WORKING]: 'is working...',
        };
        action.textContent = actionTexts[state.phase] || '';
    }

    // ===== TOP BAR =====
    updateTopBar(state) {
        document.getElementById('round-num').textContent = `Round ${state.round || 0}`;
        document.getElementById('phase-name').textContent = PHASE_NAMES[state.phase] || state.phase;
        document.getElementById('phase-description').textContent = PHASE_DESCRIPTIONS[state.phase] || '';
        document.getElementById('bank-amount').textContent = `$${state.bank}`;

        const tod = document.getElementById('turn-order-display');
        tod.innerHTML = '';
        for (const idx of state.turnOrder) {
            const p = state.players[idx];
            const marker = document.createElement('div');
            marker.className = 'turn-marker' + (idx === state.currentPlayerIndex ? ' current' : '');
            marker.style.background = p.color;
            marker.textContent = idx + 1;
            marker.title = p.name;
            tod.appendChild(marker);
        }
    }

    // ===== PLAYER PANEL =====
    updatePlayerPanel(state) {
        const panel = document.getElementById('player-info-panel');
        panel.innerHTML = '';

        for (const player of state.players) {
            const card = document.createElement('div');
            card.className = 'player-card' + (player.id === state.currentPlayerIndex ? ' active-player' : '');
            card.style.borderLeftColor = player.color;

            const foodCount = Object.values(player.food).reduce((a, b) => a + b, 0);
            const drinkCount = Object.values(player.drinks).reduce((a, b) => a + b, 0);
            const totalSalary = player.ownedCards.reduce((sum, c) => sum + (EMPLOYEES[c.empId]?.salary || 0), 0);

            card.innerHTML = `
                <div class="player-name" style="color:${player.color}">${player.name}</div>
                <div class="player-cash">$${player.cash}</div>
                <div class="player-stats">
                    Employees: ${player.ownedCards.length - 1} | Rests: ${player.restaurants.length}/3
                    ${totalSalary > 0 ? ` | Salary: $${totalSalary}` : ''}
                    ${foodCount + drinkCount > 0 ? `<br>Stock: ${this.formatInventory(player)}` : ''}
                    ${player.milestones.length > 0 ? `<br>Milestones: ${player.milestones.length}` : ''}
                </div>
            `;
            card.onclick = () => {
                this.showPlayerDetail(state, player);
            };
            panel.appendChild(card);
        }
    }

    formatInventory(player) {
        const items = [];
        if (player.food.burger > 0) items.push(`${FOOD_ICONS.burger}${player.food.burger}`);
        if (player.food.pizza > 0) items.push(`${FOOD_ICONS.pizza}${player.food.pizza}`);
        if (player.drinks.beer > 0) items.push(`${FOOD_ICONS.beer}${player.drinks.beer}`);
        if (player.drinks.lemonade > 0) items.push(`${FOOD_ICONS.lemonade}${player.drinks.lemonade}`);
        if (player.drinks.soda > 0) items.push(`${FOOD_ICONS.soda}${player.drinks.soda}`);
        return items.join(' ') || 'none';
    }

    showPlayerDetail(state, player) {
        const cards = player.ownedCards.filter(c => c.empId !== 'ceo');
        const cardList = cards.map(c => {
            const emp = EMPLOYEES[c.empId];
            return `<span class="emp-card ${emp?.type}" style="display:inline-block;padding:2px 6px;margin:2px;font-size:0.7rem;border-radius:3px;height:auto;width:auto;min-width:auto">${emp?.name || c.empId}</span>`;
        }).join('');

        this.showModal(
            `${player.name} Details`,
            `<p><strong>Cash:</strong> <span class="text-gold">$${player.cash}</span></p>
            <p><strong>Restaurants:</strong> ${player.restaurants.length}/3</p>
            <p><strong>Inventory:</strong> ${this.formatInventory(player)}</p>
            <p><strong>Milestones:</strong> ${player.milestones.length > 0 ? player.milestones.map(m => {
                const ms = state.milestones.find(mi => mi.id === m);
                return ms?.name || m;
            }).join(', ') : 'None'}</p>
            <p><strong>Employees:</strong></p>
            <div>${cardList || 'None yet'}</div>`,
            [{text: 'Close', action: () => this.hideModal()}]
        );
    }

    // ===== ACTION PANEL =====
    updateActionPanel(state) {
        const content = document.getElementById('action-content');
        content.innerHTML = '';

        switch (state.phase) {
            case PHASES.SETUP_PLACE_RESTAURANT:
                this.showRestaurantPlacement(content, state);
                break;
            case PHASES.SETUP_RESERVE_CARD:
                this.showReserveCardSelection(content, state);
                break;
            case PHASES.RESTRUCTURING:
                this.showRestructuring(content, state);
                break;
            case PHASES.WORKING:
                this.showWorkingActions(content, state);
                break;
            case PHASES.DINNERTIME:
                this.showAutoPhase(content, state, 'Dinnertime', 'Serving houses in order. Cheapest price wins each house.');
                break;
            case PHASES.PAYDAY:
                this.showAutoPhase(content, state, 'Payday', 'Paying salaries to all trained employees.');
                break;
            case PHASES.MARKETING_CAMPAIGNS:
                this.showAutoPhase(content, state, 'Marketing', 'Active campaigns are placing demand tokens on nearby houses.');
                break;
            case PHASES.CLEANUP:
                this.showAutoPhase(content, state, 'Cleanup', 'Discarding unsold food, ticking campaign timers, checking bank reserve.');
                break;
            case PHASES.GAME_OVER:
                this.showGameOver(content, state);
                break;
        }
    }

    showAutoPhase(content, state, title, description) {
        content.innerHTML = `
            <div class="action-header" style="border-left-color: var(--gold);">
                <div class="action-header-title">${title}</div>
                <div class="action-header-desc">${description}</div>
            </div>
            <p class="text-dim" style="font-size:0.8rem; margin-top:8px;">Processing automatically...</p>
        `;
    }

    showRestaurantPlacement(content, state) {
        const player = state.players[state.currentPlayerIndex];
        content.innerHTML = `
            <div class="action-header" style="border-left-color: ${player.color};">
                <div class="action-header-title">${player.name}'s Turn</div>
                <div class="action-header-desc">Click a highlighted area on the board to place your first restaurant (2x2). The entrance must be adjacent to a road.</div>
            </div>
            <p class="text-dim" style="font-size:0.75rem; margin-top: 6px;">
                Restaurants placed: ${state.map.restaurants.length}/${state.playerCount}
            </p>
        `;

        // Highlight valid positions
        const positions = MapGenerator.getValidRestaurantPositions(state.map, state.map.restaurants, true);
        const highlights = [];
        for (const pos of positions) {
            const validEntrances = pos.entrances.filter(ent => {
                const tile = MapGenerator.getTileIndex(ent.row, ent.col);
                return !state.map.restaurants.some(r => {
                    const rt = MapGenerator.getTileIndex(r.entrance.row, r.entrance.col);
                    return rt.tileRow === tile.tileRow && rt.tileCol === tile.tileCol;
                });
            });
            if (validEntrances.length === 0) continue;

            for (let dr = 0; dr < 2; dr++) {
                for (let dc = 0; dc < 2; dc++) {
                    highlights.push({
                        row: pos.row + dr,
                        col: pos.col + dc,
                        color: 'rgba(42, 140, 130, 0.6)'
                    });
                }
            }
        }
        this.renderer.setHighlights(highlights);
    }

    showReserveCardSelection(content, state) {
        const player = state.players[state.currentPlayerIndex];
        content.innerHTML = `
            <div class="action-header" style="border-left-color: ${player.color};">
                <div class="action-header-title">${player.name}</div>
                <div class="action-header-desc">Choose a reserve card. Higher values mean a longer game but more CEO slots for your org chart.</div>
            </div>
            <div id="reserve-cards-display" style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>
        `;

        const container = document.getElementById('reserve-cards-display');
        const options = [
            {amount: 100, slots: 2, desc: 'Short game, fewer slots'},
            {amount: 200, slots: 3, desc: 'Medium game, standard slots'},
            {amount: 300, slots: 4, desc: 'Long game, most slots'}
        ];

        for (const opt of options) {
            const card = document.createElement('button');
            card.className = 'action-btn';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="text-gold fw-bold">$${opt.amount}</span>
                    <span>${opt.slots} CEO slots</span>
                </div>
                <div style="font-size:0.7rem;color:var(--text-dim)">${opt.desc}</div>
            `;
            card.onclick = () => {
                this.engine.selectReserveCard(state.currentPlayerIndex, opt.amount);
                this.updateAll();
            };
            container.appendChild(card);
        }
    }

    showRestructuring(content, state) {
        const player = state.players[state.currentPlayerIndex];
        const nonCeo = player.ownedCards.filter(c => c.empId !== 'ceo');

        // Calculate available slots
        const selected = state.selectedCards || [];
        const selectedManagers = selected.filter(uid => {
            const card = player.ownedCards.find(c => c.uid === uid);
            return card && EMPLOYEES[card.empId]?.isManager;
        });
        let totalSlots = state.ceoSlots;
        for (const uid of selectedManagers) {
            const card = player.ownedCards.find(c => c.uid === uid);
            if (card) {
                const emp = EMPLOYEES[card.empId];
                if (emp?.isManager) totalSlots += emp.slots;
            }
        }

        // Instruction box
        content.innerHTML = `
            <div class="action-header" style="border-left-color: ${player.color};">
                <div class="action-header-title">${player.name}: Build Org Chart</div>
            </div>
            <div class="restructure-instruction">
                Select employees to work this turn. Your CEO has <strong>${state.ceoSlots}</strong> direct slot(s).
                Managers create extra slots. Unselected cards go to the beach.
            </div>
        `;

        // Selection counter
        const counterDiv = document.createElement('div');
        counterDiv.className = 'restructure-counter';
        counterDiv.textContent = `Selected: ${selected.length} / ${totalSlots} slots available`;
        content.appendChild(counterDiv);

        if (nonCeo.length === 0) {
            content.innerHTML += `<p class="text-dim" style="font-size:0.8rem;margin:8px 0">No employees yet \u2014 just the CEO.</p>`;
        } else {
            const cardsDiv = document.createElement('div');
            cardsDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin:8px 0;max-height:200px;overflow-y:auto';

            for (const card of nonCeo) {
                const emp = EMPLOYEES[card.empId];
                if (!emp) continue;

                const el = document.createElement('div');
                el.className = `emp-card ${emp.type}`;
                el.style.cssText = 'width:72px;height:52px;cursor:pointer';

                const isSelected = selected.includes(card.uid);
                if (isSelected) {
                    el.classList.add('restructure-selected');
                } else {
                    el.classList.add('restructure-dimmed');
                }

                el.innerHTML = `
                    <div class="card-title" style="font-size:0.65rem">${emp.name}</div>
                    <div class="card-info" style="font-size:0.55rem">${emp.isManager ? `Mgr (${emp.slots})` : (emp.action || '')}</div>
                    ${emp.salary > 0 ? `<div class="card-salary">$${emp.salary}</div>` : ''}
                `;

                el.onclick = () => {
                    if (!state.selectedCards) state.selectedCards = [];
                    const idx = state.selectedCards.indexOf(card.uid);
                    if (idx >= 0) {
                        state.selectedCards.splice(idx, 1);
                    } else {
                        state.selectedCards.push(card.uid);
                    }
                    this.updateAll();
                };

                cardsDiv.appendChild(el);
            }
            content.appendChild(cardsDiv);
        }

        // Action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:8px';

        if (nonCeo.length > 0) {
            const autoBtn = document.createElement('button');
            autoBtn.className = 'action-btn';
            autoBtn.textContent = 'Select All';
            autoBtn.onclick = () => {
                state.selectedCards = nonCeo.map(c => c.uid);
                this.updateAll();
            };
            actionsDiv.appendChild(autoBtn);

            const clearBtn = document.createElement('button');
            clearBtn.className = 'action-btn';
            clearBtn.textContent = 'Clear Selection';
            clearBtn.onclick = () => {
                state.selectedCards = [];
                this.updateAll();
            };
            actionsDiv.appendChild(clearBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action-btn';
        const hasSelection = selected.length > 0 || nonCeo.length === 0;
        if (hasSelection) {
            confirmBtn.classList.add('confirm-btn-ready');
        }
        confirmBtn.textContent = 'Confirm Structure';
        confirmBtn.onclick = () => {
            if (selected.length === 0 && nonCeo.length > 0) {
                // Empty selection warning
                this.showModal(
                    'No Employees Selected',
                    '<p>You have not selected any employees. All employees will go to the beach this turn. Are you sure?</p>',
                    [
                        {text: 'Go Back', action: () => this.hideModal()},
                        {text: 'Confirm Empty', action: () => {
                            this.hideModal();
                            this.confirmStructure(state);
                        }}
                    ]
                );
            } else {
                this.confirmStructure(state);
            }
        };
        actionsDiv.appendChild(confirmBtn);

        content.appendChild(actionsDiv);

        this.renderer.clearHighlights();
    }

    confirmStructure(state) {
        const player = state.players[state.currentPlayerIndex];
        const selected = state.selectedCards || [];

        const ceoSubs = [];
        const managerSubs = {};
        const managers = [];
        const regulars = [];

        for (const uid of selected) {
            const card = player.ownedCards.find(c => c.uid === uid);
            if (!card) continue;
            if (EMPLOYEES[card.empId]?.isManager) {
                managers.push(uid);
            } else {
                regulars.push(uid);
            }
        }

        // Place managers first
        for (const uid of managers) {
            if (ceoSubs.length < state.ceoSlots) {
                ceoSubs.push(uid);
                managerSubs[uid] = [];
            }
        }

        // Fill manager subordinate slots with regular employees
        let regularIdx = 0;
        for (const mgrUid of ceoSubs) {
            const mgrCard = player.ownedCards.find(c => c.uid === mgrUid);
            const mgrDef = EMPLOYEES[mgrCard.empId];
            if (!mgrDef?.isManager) continue;
            for (let i = 0; i < mgrDef.slots && regularIdx < regulars.length; i++) {
                managerSubs[mgrUid].push(regulars[regularIdx]);
                regularIdx++;
            }
        }

        // Fill remaining CEO slots
        while (regularIdx < regulars.length && ceoSubs.length < state.ceoSlots) {
            ceoSubs.push(regulars[regularIdx]);
            regularIdx++;
        }

        this.engine.submitStructure(state.currentPlayerIndex, { ceoSubs, managerSubs });

        // Track who has submitted
        if (!state._structuresDone) state._structuresDone = new Set();
        state._structuresDone.add(state.currentPlayerIndex);

        if (state._structuresDone.size >= state.playerCount) {
            state.selectedCards = [];
            state._structuresDone = null;
            this.engine.finishRestructuring();
        } else {
            const nextPlayer = (state.currentPlayerIndex + 1) % state.playerCount;
            state.currentPlayerIndex = nextPlayer;
            state.selectedCards = [];
        }

        this.updateAll();
    }

    // ===== WORKING PHASE =====
    showWorkingActions(content, state) {
        const player = state.players[state.currentPlayerIndex];
        const action = this.engine.getCurrentWorkAction();

        // Header with player name
        const headerDiv = document.createElement('div');
        headerDiv.className = 'action-header';
        headerDiv.style.borderLeftColor = player.color;
        headerDiv.innerHTML = `
            <div class="action-header-title" style="color:${player.color}">${player.name}: Working</div>
        `;
        content.appendChild(headerDiv);

        // Progress bar
        const total = state.workingActions.length;
        const current = state.workingStep + 1;
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        const progressDiv = document.createElement('div');
        progressDiv.className = 'working-progress';
        progressDiv.innerHTML = `
            <span>Step ${current}/${total}</span>
            <div class="working-progress-bar">
                <div class="working-progress-fill" style="width:${pct}%"></div>
            </div>
        `;
        content.appendChild(progressDiv);

        if (!action) {
            content.innerHTML += `<p class="text-dim" style="margin-top:8px">All actions complete. Advancing...</p>`;
            setTimeout(() => {
                this.engine.finishPlayerWork();
                this.updateAll();
            }, 300);
            return;
        }

        const emp = action.empDef || EMPLOYEES[action.card?.empId];
        const actionDiv = document.createElement('div');
        actionDiv.style.marginTop = '4px';

        switch (action.type) {
            case 'ceo_recruit':
                this.renderCeoRecruit(actionDiv, state, player);
                break;
            case 'recruit':
                this.renderRecruit(actionDiv, state, player, emp);
                break;
            case 'produce':
                this.renderProduce(actionDiv, state, player, emp);
                break;
            case 'buy_drink':
                this.renderBuyDrink(actionDiv, state, player, emp);
                break;
            case 'train':
                this.renderTrain(actionDiv, state, player, emp);
                break;
            case 'campaign':
                this.renderCampaign(actionDiv, state, player, emp);
                break;
            case 'place_house':
                this.renderPlaceHouse(actionDiv, state, player);
                break;
            case 'place_restaurant':
                this.renderPlaceRestaurant(actionDiv, state, player, emp);
                break;
            case 'pricing':
            case 'cfo':
            case 'waitress':
                actionDiv.innerHTML = `
                    <div class="action-header" style="border-left-color: var(--gold);">
                        <div class="action-header-title">${emp?.name || action.type}</div>
                        <div class="action-header-desc">Auto-applied during Dinnertime.</div>
                    </div>
                `;
                setTimeout(() => {
                    this.engine.executeWorkAction({});
                    this.updateAll();
                }, 200);
                break;
            default:
                setTimeout(() => {
                    this.engine.skipWorkAction();
                    this.updateAll();
                }, 200);
                break;
        }

        content.appendChild(actionDiv);
    }

    renderCeoRecruit(container, state, player) {
        container.innerHTML = `
            <div class="action-header" style="border-left-color: var(--accent);">
                <div class="action-header-title">CEO Recruitment</div>
                <div class="action-header-desc">Your CEO can recruit 1 entry-level employee from the market for free.</div>
            </div>
        `;

        const options = document.createElement('div');
        options.style.cssText = 'display:flex;flex-direction:column;gap:3px';
        this.renderHireButtons(options, state);
        container.appendChild(options);

        const skipBtn = document.createElement('button');
        skipBtn.className = 'skip-btn';
        skipBtn.textContent = 'Skip Hiring';
        skipBtn.onclick = () => {
            this.engine.executeWorkAction({skip: true});
            this.updateAll();
        };
        container.appendChild(skipBtn);
    }

    renderRecruit(container, state, player, emp) {
        container.innerHTML = `
            <div class="action-header" style="border-left-color: #7b4daa;">
                <div class="action-header-title">${emp.name}</div>
                <div class="action-header-desc">Recruit up to ${emp.recruits} entry-level employee(s) from the market.</div>
            </div>
        `;

        const options = document.createElement('div');
        options.style.cssText = 'display:flex;flex-direction:column;gap:3px';
        this.renderHireButtons(options, state);
        container.appendChild(options);

        const doneBtn = document.createElement('button');
        doneBtn.className = 'skip-btn';
        doneBtn.textContent = 'Done Recruiting';
        doneBtn.onclick = () => {
            this.engine.executeWorkAction({skip: true});
            this.updateAll();
        };
        container.appendChild(doneBtn);
    }

    renderHireButtons(container, state) {
        const entryLevel = Object.values(EMPLOYEES).filter(e => e.entryLevel && state.employeeSupply[e.id] > 0);
        for (const emp of entryLevel) {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerHTML = `
                <span class="fw-bold">${emp.name}</span>
                <span class="text-dim" style="font-size:0.75rem"> (${state.employeeSupply[emp.id]} left)</span>
            `;
            btn.onclick = () => {
                this.engine.executeWorkAction({hired: emp.id});
                this.updateAll();
            };
            container.appendChild(btn);
        }
    }

    renderProduce(container, state, player, emp) {
        if (emp.produces.choice) {
            container.innerHTML = `
                <div class="action-header" style="border-left-color: #d45a3a;">
                    <div class="action-header-title">${emp.name}</div>
                    <div class="action-header-desc">Choose what to cook: 1 burger or 1 pizza. The food goes to your stock.</div>
                </div>
            `;
            const btns = document.createElement('div');
            btns.style.cssText = 'display:flex;gap:6px';

            for (const type of ['burger', 'pizza']) {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.style.flex = '1';
                btn.style.textAlign = 'center';
                btn.innerHTML = `${FOOD_ICONS[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                btn.onclick = () => {
                    this.engine.executeWorkAction({foodType: type});
                    this.updateAll();
                };
                btns.appendChild(btn);
            }
            container.appendChild(btns);
        } else {
            // Auto-produce
            this.engine.executeWorkAction({});
            this.updateAll();
        }
    }

    renderBuyDrink(container, state, player, emp) {
        if (emp.anyDrink) {
            container.innerHTML = `
                <div class="action-header" style="border-left-color: var(--teal);">
                    <div class="action-header-title">${emp.name}</div>
                    <div class="action-header-desc">Take 1 drink of your choice. It goes to your stock for selling at dinnertime.</div>
                </div>
            `;
            const btns = document.createElement('div');
            btns.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap';

            for (const type of ['beer', 'lemonade', 'soda']) {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.style.flex = '1';
                btn.style.textAlign = 'center';
                btn.innerHTML = `${FOOD_ICONS[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                btn.onclick = () => {
                    this.engine.executeWorkAction({drinkType: type});
                    this.updateAll();
                };
                btns.appendChild(btn);
            }
            container.appendChild(btns);
        } else {
            // Auto-buy by route
            this.engine.executeWorkAction({});
            this.updateAll();
        }
    }

    renderTrain(container, state, player, emp) {
        container.innerHTML = `
            <div class="action-header" style="border-left-color: #3a6e8c;">
                <div class="action-header-title">${emp.name}</div>
                <div class="action-header-desc">${emp.trainActions} training action(s). Upgrade an employee on the beach to a higher rank.</div>
            </div>
        `;

        const options = document.createElement('div');
        options.style.cssText = 'display:flex;flex-direction:column;gap:3px';
        container.appendChild(options);

        // Find trainable employees on beach
        const trainable = player.ownedCards.filter(c => {
            if (!player.beach.includes(c.uid)) return false;
            if (player.busyMarketeers.includes(c.uid)) return false;
            const e = EMPLOYEES[c.empId];
            return e && e.trainsTo && e.trainsTo.length > 0;
        });

        if (trainable.length === 0) {
            options.innerHTML = '<p class="text-dim" style="font-size:0.8rem">No trainable employees on beach.</p>';
        } else {
            for (const card of trainable) {
                const fromEmp = EMPLOYEES[card.empId];
                for (const targetId of fromEmp.trainsTo) {
                    const target = EMPLOYEES[targetId];
                    if (!target) continue;

                    const btn = document.createElement('button');
                    btn.className = 'action-btn';
                    btn.innerHTML = `
                        <span>${fromEmp.name}</span>
                        <span class="text-gold"> \u2192 ${target.name}</span>
                        ${target.salary > 0 ? `<span class="text-dim" style="font-size:0.7rem"> ($${target.salary}/rd)</span>` : ''}
                    `;
                    btn.onclick = () => {
                        this.engine.executeWorkAction({trainTarget: card.uid, trainTo: targetId});
                        this.updateAll();
                    };
                    options.appendChild(btn);
                }
            }
        }

        const skipBtn = document.createElement('button');
        skipBtn.className = 'skip-btn';
        skipBtn.textContent = 'Skip Training';
        skipBtn.onclick = () => {
            this.engine.executeWorkAction({skip: true});
            this.updateAll();
        };
        container.appendChild(skipBtn);
    }

    renderCampaign(container, state, player, emp) {
        container.innerHTML = `
            <div class="action-header" style="border-left-color: #d4940a;">
                <div class="action-header-title">${emp.name}</div>
                <div class="action-header-desc">Place a campaign to create demand. Types: ${emp.campaigns.join(', ')} | Range: ${emp.range === 99 ? 'unlimited' : emp.range} | Max duration: ${emp.maxDuration}</div>
            </div>
        `;

        // Quick campaign placement
        const productDiv = document.createElement('div');
        productDiv.innerHTML = '<div style="font-size:0.8rem;margin-bottom:4px;color:var(--text-mid)">Product to advertise:</div>';
        const prodBtns = document.createElement('div');
        prodBtns.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;margin-bottom:8px';

        for (const type of ['burger', 'pizza', 'beer', 'lemonade', 'soda']) {
            const btn = document.createElement('button');
            btn.className = 'action-btn' + (this._campaignProduct === type ? ' selected' : '');
            btn.style.cssText = 'flex:1;min-width:50px;text-align:center';
            btn.innerHTML = `${FOOD_ICONS[type]}`;
            btn.onclick = () => {
                this._campaignProduct = type;
                this.updateAll();
            };
            prodBtns.appendChild(btn);
        }
        productDiv.appendChild(prodBtns);
        container.appendChild(productDiv);

        // Campaign type
        const typeDiv = document.createElement('div');
        typeDiv.innerHTML = '<div style="font-size:0.8rem;margin-bottom:4px;color:var(--text-mid)">Campaign type:</div>';
        const typeBtns = document.createElement('div');
        typeBtns.style.cssText = 'display:flex;flex-direction:column;gap:3px;margin-bottom:8px';

        for (const type of emp.campaigns) {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.disabled = !this._campaignProduct;
            btn.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
            btn.onclick = () => {
                this.placeCampaignAuto(state, player, emp, type, this._campaignProduct);
            };
            typeBtns.appendChild(btn);
        }
        typeDiv.appendChild(typeBtns);
        container.appendChild(typeDiv);

        const skipBtn = document.createElement('button');
        skipBtn.className = 'skip-btn';
        skipBtn.textContent = 'Skip Campaign';
        skipBtn.onclick = () => {
            this._campaignProduct = null;
            this.engine.executeWorkAction({skip: true});
            this.updateAll();
        };
        container.appendChild(skipBtn);
    }

    placeCampaignAuto(state, player, empDef, campaignType, product) {
        const action = this.engine.getCurrentWorkAction();
        const map = state.map;

        // Find the best placement location - prioritize cells adjacent to houses
        let bestCell = null;
        let bestScore = -1;

        for (const rest of player.restaurants) {
            if (!rest.open) continue;
            const entrance = rest.roadAccess;

            const visited = new Set();
            const queue = [{r: entrance.row, c: entrance.col, dist: 0}];
            visited.add(`${entrance.row},${entrance.col}`);

            while (queue.length > 0) {
                const {r, c, dist} = queue.shift();
                if (dist > empDef.range) continue;

                const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                for (const [dr, dc] of dirs) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr < 0 || nr >= map.rows || nc < 0 || nc >= map.cols) continue;
                    if (map.grid[nr][nc] === CELL.EMPTY && !map.campaigns.some(cp => cp.row === nr && cp.col === nc)) {
                        let score = 0;
                        if (campaignType === 'billboard') {
                            for (const [hdr, hdc] of dirs) {
                                const hr = nr + hdr;
                                const hc = nc + hdc;
                                if (map.houses.some(h => h.row === hr && h.col === hc)) score += 10;
                            }
                        } else if (campaignType === 'radio') {
                            const tile = MapGenerator.getTileIndex(nr, nc);
                            score = map.houses.filter(h => {
                                const ht = MapGenerator.getTileIndex(h.row, h.col);
                                return Math.abs(ht.tileRow - tile.tileRow) <= 1 && Math.abs(ht.tileCol - tile.tileCol) <= 1;
                            }).length;
                        } else {
                            score = 1;
                        }

                        const onRoad = dirs.some(([d1, d2]) => {
                            const rr = nr + d1, rc = nc + d2;
                            return rr >= 0 && rr < map.rows && rc >= 0 && rc < map.cols && map.grid[rr][rc] === CELL.ROAD;
                        });
                        if (onRoad) score += 1;

                        if (score > bestScore) {
                            bestScore = score;
                            bestCell = {row: nr, col: nc};
                        }
                    }
                }

                // BFS on roads
                for (const [dr, dc] of dirs) {
                    const nr = r + dr;
                    const nc = c + dc;
                    const key = `${nr},${nc}`;
                    if (!visited.has(key) && nr >= 0 && nr < map.rows && nc >= 0 && nc < map.cols) {
                        if (map.grid[nr][nc] === CELL.ROAD) {
                            visited.add(key);
                            queue.push({r: nr, c: nc, dist: dist + 1});
                        }
                    }
                }
            }
        }

        if (bestCell) {
            const campaign = {
                type: campaignType,
                product,
                duration: empDef.maxDuration,
                row: bestCell.row,
                col: bestCell.col,
                owner: player.id,
                number: ++state.campaignCounter,
                marketeerUid: action?.card?.uid,
                direction: 'row',
                size: 1
            };
            map.campaigns.push(campaign);
            if (campaign.marketeerUid) {
                player.busyMarketeers.push(campaign.marketeerUid);
            }

            if (campaignType === 'billboard') this.engine.checkMilestone('place_billboard', player.id);
            if (campaignType === 'airplane') this.engine.checkMilestone('place_airplane', player.id);
            if (campaignType === 'radio') this.engine.checkMilestone('place_radio', player.id);
            if (product === 'burger') this.engine.checkMilestone('market_burger', player.id);
            if (product === 'pizza') this.engine.checkMilestone('market_pizza', player.id);
            if (['beer','lemonade','soda'].includes(product)) this.engine.checkMilestone('market_drink', player.id);

            this.engine.log(`${player.name}: Placed ${campaignType} (${product}) at (${bestCell.row},${bestCell.col})`);
            this._campaignProduct = null;
            this.engine.executeWorkAction({placed: true});
        } else {
            this.engine.log(`${player.name}: Could not find valid campaign placement`);
            this.engine.executeWorkAction({skip: true});
        }
        this.updateAll();
    }

    renderPlaceHouse(container, state, player) {
        container.innerHTML = `
            <div class="action-header" style="border-left-color: #d4940a;">
                <div class="action-header-title">New Business Developer</div>
                <div class="action-header-desc">Place a new house on the board adjacent to a road, or add a garden to an existing house.</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;">
                <button class="action-btn" onclick="window.ui.autoPlaceHouse()">Auto-Place House</button>
                <button class="action-btn" onclick="window.ui.autoPlaceGarden()">Auto-Add Garden</button>
                <button class="skip-btn" onclick="window.ui.skipWorkAction()">Skip</button>
            </div>
        `;
    }

    renderPlaceRestaurant(container, state, player, emp) {
        container.innerHTML = `
            <div class="action-header" style="border-left-color: #d4940a;">
                <div class="action-header-title">${emp.name}</div>
                <div class="action-header-desc">Place a new restaurant on the board. Click a valid 2x2 location.</div>
            </div>
        `;

        if (player.restaurants.length >= player.maxRestaurants) {
            container.innerHTML += '<p class="text-dim">All restaurants placed.</p>';
            const skipBtn = document.createElement('button');
            skipBtn.className = 'skip-btn';
            skipBtn.textContent = 'Skip';
            skipBtn.onclick = () => this.skipWorkAction();
            container.appendChild(skipBtn);
        } else {
            container.innerHTML += '<p class="text-dim" style="font-size:0.8rem">Click a valid location on the map.</p>';
            const skipBtn = document.createElement('button');
            skipBtn.className = 'skip-btn';
            skipBtn.textContent = 'Skip';
            skipBtn.onclick = () => this.skipWorkAction();
            container.appendChild(skipBtn);

            // Highlight valid positions
            const positions = MapGenerator.getValidRestaurantPositions(state.map, state.map.restaurants, false);
            const highlights = [];
            for (const pos of positions) {
                for (let dr = 0; dr < 2; dr++) {
                    for (let dc = 0; dc < 2; dc++) {
                        highlights.push({
                            row: pos.row + dr,
                            col: pos.col + dc,
                            color: 'rgba(42, 140, 130, 0.4)'
                        });
                    }
                }
            }
            this.renderer.setHighlights(highlights);
        }
    }

    showGameOver(content, state) {
        const sorted = [...state.players].sort((a, b) => b.cash - a.cash);
        content.innerHTML = `
            <div style="text-align:center;padding:20px 0">
                <h2 style="font-family:'Fredoka',sans-serif;color:var(--gold);font-size:1.4rem;margin-bottom:12px">GAME OVER</h2>
                <div style="font-size:1.2rem;font-weight:700;color:${state.winner?.color}">
                    ${state.winner?.name} Wins!
                </div>
                <div class="text-gold" style="font-size:2rem;font-weight:900;margin:8px 0">$${state.winner?.cash}</div>
                <div style="margin-top:16px;text-align:left">
                    ${sorted.map((p, i) => `
                        <div style="display:flex;justify-content:space-between;padding:6px 8px;
                            border-radius:6px;margin-bottom:2px;
                            ${i === 0 ? 'background:rgba(212,148,10,0.1);border:1px solid rgba(212,148,10,0.2);' : ''}">
                            <span style="color:${p.color};font-weight:${i === 0 ? '700' : '400'}">
                                ${i + 1}. ${p.name}
                            </span>
                            <span class="${i === 0 ? 'text-gold fw-bold' : ''}">$${p.cash}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" style="margin-top:20px" onclick="location.reload()">New Game</button>
            </div>
        `;

        this.renderer.clearHighlights();
    }

    // ===== ORG CHART =====
    updateOrgChart(state) {
        const container = document.getElementById('org-chart');
        const player = state.players[state.currentPlayerIndex];
        if (!player) return;

        let html = '';

        // CEO row
        html += `<div class="org-level"><div class="org-node ceo">CEO (${state.ceoSlots} slots)</div></div>`;

        // CEO subordinates
        html += '<div class="org-level">';
        const subs = player.structure.ceo.subordinates;
        for (const sub of subs) {
            const emp = EMPLOYEES[sub.empId];
            const cls = emp?.isManager ? 'manager' : 'employee';
            html += `<div class="org-node ${cls}" title="${emp?.name}\n${emp?.action || 'manager'}">${emp?.name || '?'}</div>`;
        }
        for (let i = subs.length; i < state.ceoSlots; i++) {
            html += '<div class="org-node empty-slot">\u2014</div>';
        }
        html += '</div>';

        // Manager subordinates
        for (const sub of subs) {
            const emp = EMPLOYEES[sub.empId];
            if (!emp?.isManager || !player.structure[sub.uid]) continue;

            const mgrSubs = player.structure[sub.uid].subordinates;
            html += `<div class="org-level" style="margin-left:8px;padding-left:8px;border-left:2px solid ${player.color}40">`;
            html += `<div style="font-size:0.55rem;color:var(--text-dim);width:100%;margin-bottom:2px">${emp.name} (${emp.slots} slots):</div>`;
            for (const msub of mgrSubs) {
                const mEmp = EMPLOYEES[msub.empId];
                html += `<div class="org-node employee">${mEmp?.name || '?'}</div>`;
            }
            for (let i = mgrSubs.length; i < emp.slots; i++) {
                html += '<div class="org-node empty-slot">\u2014</div>';
            }
            html += '</div>';
        }

        container.innerHTML = html;
    }

    // ===== MILESTONES =====
    updateMilestones(state) {
        const panel = document.getElementById('milestones-panel');
        const container = document.getElementById('milestones-list');
        container.innerHTML = '';

        if (state.introMode) {
            panel.style.display = 'none';
            return;
        }
        panel.style.display = '';

        for (const m of state.milestones) {
            const div = document.createElement('div');
            let cls = 'milestone-item';
            if (m.owner !== null) cls += ' claimed';
            else if (m.available) cls += ' available';
            else cls += ' unavailable';

            div.className = cls;
            div.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span>${m.name}</span>
                    ${m.owner !== null
                        ? `<span class="milestone-owner">${state.players[m.owner].name}</span>`
                        : ''}
                </div>
            `;
            div.title = m.effect;
            container.appendChild(div);
        }
    }

    // ===== BOTTOM BAR =====
    updateBottomBar(state) {
        const player = state.players[state.currentPlayerIndex];
        if (!player) return;

        const handCards = document.getElementById('hand-cards');
        const beachCards = document.getElementById('beach-cards');
        handCards.innerHTML = '';
        beachCards.innerHTML = '';

        // Separate cards into structure vs beach
        const structureUids = new Set();
        for (const sub of player.structure.ceo.subordinates) {
            structureUids.add(sub.uid);
            if (player.structure[sub.uid]) {
                for (const msub of player.structure[sub.uid].subordinates) {
                    structureUids.add(msub.uid);
                }
            }
        }

        for (const card of player.ownedCards) {
            const emp = EMPLOYEES[card.empId];
            const isCeo = card.empId === 'ceo';

            const el = document.createElement('div');
            el.className = `emp-card ${emp?.type || 'ceo-card'}`;

            const isBusy = player.busyMarketeers.includes(card.uid);
            const isBeach = player.beach.includes(card.uid);
            const isInStructure = structureUids.has(card.uid) || isCeo;

            el.innerHTML = `
                <div class="card-title">${emp?.name || 'CEO'}</div>
                <div class="card-info">
                    ${isCeo ? 'Recruit 1' : (emp?.action || (emp?.isManager ? `Mgr(${emp.slots})` : ''))}
                    ${isBusy ? '<br>BUSY' : ''}
                </div>
                ${emp?.salary > 0 ? `<div class="card-salary">$${emp.salary}</div>` : ''}
            `;

            if (isBeach && !isCeo) {
                el.style.opacity = '0.6';
                beachCards.appendChild(el);
            } else {
                handCards.appendChild(el);
            }
        }

        // Inventory display
        const inv = this.formatInventory(player);
        if (inv !== 'none') {
            const invEl = document.createElement('div');
            invEl.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:auto;padding-left:12px;border-left:2px solid var(--border);font-size:0.9rem;white-space:nowrap';
            invEl.innerHTML = inv;
            handCards.appendChild(invEl);
        }
    }

    // ===== EMPLOYEE MARKET =====
    updateEmployeeMarket(state) {
        const container = document.getElementById('employee-cards');
        container.innerHTML = '';

        const categories = [
            {name: 'Kitchen', ids: ['kitchen_trainee', 'burger_cook', 'pizza_cook', 'burger_chef', 'pizza_chef']},
            {name: 'Buyers', ids: ['errand_boy', 'cart_operator', 'truck_driver', 'zeppelin_pilot']},
            {name: 'Marketing', ids: ['marketing_trainee', 'campaign_manager', 'brand_manager', 'brand_director']},
            {name: 'Management', ids: ['management_trainee', 'junior_vp', 'senior_vp', 'executive_vp']},
            {name: 'Pricing/Special', ids: ['pricing_manager', 'discount_manager', 'luxuries_manager', 'cfo', 'new_business_dev', 'local_manager', 'regional_manager']},
            {name: 'Recruiting', ids: ['recruiting_girl', 'recruiting_manager', 'hr_director']},
            {name: 'Training', ids: ['trainer', 'coach', 'guru']},
            {name: 'Service', ids: ['waitress']}
        ];

        for (const cat of categories) {
            const catDiv = document.createElement('div');
            catDiv.style.marginBottom = '6px';

            const label = document.createElement('div');
            label.style.cssText = 'font-family:Fredoka,sans-serif;font-size:0.6rem;color:var(--text-dim);margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600';
            label.textContent = cat.name;
            catDiv.appendChild(label);

            const row = document.createElement('div');
            row.style.cssText = 'display:flex;flex-wrap:wrap;gap:2px';

            for (const id of cat.ids) {
                const emp = EMPLOYEES[id];
                if (!emp) continue;
                const supply = state.employeeSupply[id] || 0;

                const el = document.createElement('div');
                el.className = `market-card ${emp.type}`;
                el.style.position = 'relative';
                el.style.opacity = supply > 0 ? '1' : '0.3';
                el.innerHTML = `
                    <div style="font-size:0.5rem;font-weight:700;line-height:1.1;color:var(--text)">${emp.name}</div>
                    <div style="font-size:0.55rem;opacity:0.7;color:var(--text-mid)">${supply}x</div>
                `;
                el.title = `${emp.name} (${supply} available)\n${emp.salary > 0 ? `Salary: $${emp.salary}` : 'Free'}\n${emp.action || (emp.isManager ? 'Manager' : '')}`;
                row.appendChild(el);
            }

            catDiv.appendChild(row);
            container.appendChild(catDiv);
        }
    }

    // ===== GAME LOG =====
    updateLog(state) {
        const entries = document.getElementById('log-entries');
        entries.innerHTML = '';
        const recent = state.log.slice(-40);
        for (const entry of recent) {
            const div = document.createElement('div');
            div.className = 'log-entry';
            const highlight = entry.message.includes('***') ? 'color:var(--gold);font-weight:600' : '';
            div.innerHTML = `<span class="log-time">R${entry.round || 0}</span><span style="${highlight}">${entry.message}</span>`;
            entries.appendChild(div);
        }
        entries.scrollTop = entries.scrollHeight;
    }

    // ===== MODAL =====
    showModal(title, html, buttons) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        let btnHtml = '';
        buttons.forEach((b, i) => {
            btnHtml += `<button class="action-btn" id="modal-btn-${i}">${b.text}</button>`;
        });

        content.innerHTML = `
            <div class="modal-title">${title}</div>
            <div class="modal-text">${html}</div>
            <div class="modal-actions">${btnHtml}</div>
        `;

        overlay.classList.remove('hidden');

        buttons.forEach((b, i) => {
            document.getElementById(`modal-btn-${i}`).onclick = b.action;
        });
    }

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }

    // ===== PUBLIC ACTION HELPERS =====
    executeWork(data) {
        this.engine.executeWorkAction(data);
        this.updateAll();
    }

    skipWorkAction() {
        this.engine.skipWorkAction();
        this.updateAll();
    }

    autoPlaceHouse() {
        const state = this.engine.getState();
        const map = state.map;

        // Find empty cells adjacent to roads
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                if (map.grid[r][c] !== CELL.EMPTY) continue;
                const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                const adjRoad = dirs.some(([dr, dc]) => {
                    const nr = r + dr, nc = c + dc;
                    return nr >= 0 && nr < map.rows && nc >= 0 && nc < map.cols && map.grid[nr][nc] === CELL.ROAD;
                });
                if (adjRoad) {
                    const houseNum = map.houses.length + 1;
                    map.houses.push({
                        row: r, col: c, number: houseNum,
                        demand: [], garden: true
                    });
                    map.grid[r][c] = CELL.HOUSE;
                    this.engine.log(`${this.engine.currentPlayer.name}: Placed house #${houseNum} at (${r},${c}) with garden`);
                    this.engine.executeWorkAction({placed: true});
                    this.updateAll();
                    return;
                }
            }
        }
        this.engine.log('No valid location for house.');
        this.skipWorkAction();
    }

    autoPlaceGarden() {
        const state = this.engine.getState();
        const map = state.map;

        // Find a house without a garden
        for (const house of map.houses) {
            if (house.garden) continue;
            const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            for (const [dr, dc] of dirs) {
                const nr = house.row + dr;
                const nc = house.col + dc;
                if (nr >= 0 && nr < map.rows && nc >= 0 && nc < map.cols && map.grid[nr][nc] === CELL.EMPTY) {
                    house.garden = true;
                    this.engine.log(`${this.engine.currentPlayer.name}: Added garden to house #${house.number}`);
                    this.engine.executeWorkAction({placed: true});
                    this.updateAll();
                    return;
                }
            }
        }
        this.engine.log('No valid location for garden.');
        this.skipWorkAction();
    }
}
