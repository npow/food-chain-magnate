// ===== MAIN ENTRY POINT =====

(function() {
    let engine, renderer, ui;
    let playerCount = 3;

    // ===== MENU SETUP =====
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playerCount = parseInt(btn.dataset.count);
        });
    });

    document.getElementById('start-game').addEventListener('click', () => {
        startGame(false);
    });

    document.getElementById('start-intro').addEventListener('click', () => {
        startGame(true);
    });

    function startGame(introMode) {
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        engine = new GameEngine();
        window.gameEngine = engine;
        engine.newGame(playerCount, introMode);

        const canvas = document.getElementById('game-board');
        renderer = new BoardRenderer(canvas);

        ui = new UIController(engine, renderer);
        window.ui = ui;

        setupCanvasEvents(canvas, engine, renderer, ui);

        document.getElementById('log-toggle').addEventListener('click', () => {
            const log = document.getElementById('game-log');
            log.classList.toggle('collapsed');
            log.classList.toggle('expanded');
        });

        ui.updateAll();
    }

    function setupCanvasEvents(canvas, engine, renderer, ui) {
        canvas.addEventListener('mousemove', (e) => {
            const cell = renderer.getCellFromMouse(e);
            renderer.hoveredCell = cell;
            renderer.render(engine.getState());
        });

        canvas.addEventListener('mouseleave', () => {
            renderer.hoveredCell = null;
            renderer.render(engine.getState());
        });

        canvas.addEventListener('click', (e) => {
            const cell = renderer.getCellFromMouse(e);
            handleBoardClick(cell, engine, renderer, ui);
        });
    }

    function handleBoardClick(cell, engine, renderer, ui) {
        const state = engine.getState();
        if (!state) return;

        switch (state.phase) {
            case PHASES.SETUP_PLACE_RESTAURANT: {
                const positions = MapGenerator.getValidRestaurantPositions(state.map, state.map.restaurants, true);

                for (const pos of positions) {
                    if (cell.row >= pos.row && cell.row < pos.row + 2 &&
                        cell.col >= pos.col && cell.col < pos.col + 2) {

                        // Find an entrance that doesn't conflict with existing restaurant tiles
                        for (const entrance of pos.entrances) {
                            const tile = MapGenerator.getTileIndex(entrance.row, entrance.col);
                            const conflicts = state.map.restaurants.some(r => {
                                const rt = MapGenerator.getTileIndex(r.entrance.row, r.entrance.col);
                                return rt.tileRow === tile.tileRow && rt.tileCol === tile.tileCol;
                            });

                            if (!conflicts) {
                                const dr = entrance.row - pos.row;
                                const dc = entrance.col - pos.col;
                                const result = engine.placeRestaurant(state.currentPlayerIndex, pos.row, pos.col, {dr, dc});
                                if (result) {
                                    ui.updateAll();
                                    return;
                                }
                            }
                        }
                    }
                }
                break;
            }

            case PHASES.WORKING: {
                const action = engine.getCurrentWorkAction();
                if (action && action.type === 'place_restaurant') {
                    // Try to place restaurant at click
                    const positions = MapGenerator.getValidRestaurantPositions(state.map, state.map.restaurants, false);
                    for (const pos of positions) {
                        if (cell.row >= pos.row && cell.row < pos.row + 2 &&
                            cell.col >= pos.col && cell.col < pos.col + 2) {
                            if (pos.entrances.length > 0) {
                                const entrance = pos.entrances[0];
                                const player = state.players[state.currentPlayerIndex];
                                const rest = {
                                    owner: state.currentPlayerIndex,
                                    row: pos.row, col: pos.col,
                                    entrance: { row: entrance.row, col: entrance.col },
                                    roadAccess: { row: entrance.roadRow, col: entrance.roadCol },
                                    open: action.empDef?.immediateOpen || false,
                                    driveIn: false
                                };
                                state.map.restaurants.push(rest);
                                player.restaurants.push(rest);

                                for (let dr = 0; dr < 2; dr++) {
                                    for (let dc = 0; dc < 2; dc++) {
                                        state.map.grid[pos.row + dr][pos.col + dc] = 100 + state.currentPlayerIndex;
                                    }
                                }

                                engine.log(`${player.name} placed a restaurant at (${pos.row},${pos.col})`);
                                engine.executeWorkAction({placed: true});
                                ui.updateAll();
                                return;
                            }
                        }
                    }
                }
                break;
            }
        }
    }
})();
