// ===== MAP GENERATION =====
// Generates the game board from tiles, each tile is a 5x5 grid

const MapGenerator = {
    // Pre-designed tile templates (inspired by the actual game tiles)
    // 0=empty, 1=road, 2=house(+number), 3=beer, 4=lemonade, 5=soda
    tileTemplates: [
        // Tile 0: Cross roads with houses
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 2],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 2, 1, 0, 0]
            ],
            houses: [{r:1,c:4},{r:4,c:1}]
        },
        // Tile 1: T-junction with drink
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 3, 0, 0, 2]
            ],
            houses: [{r:4,c:4}]
        },
        // Tile 2: L-bend with houses
        {
            grid: [
                [0, 0, 1, 0, 0],
                [2, 0, 1, 0, 0],
                [0, 0, 1, 1, 1],
                [0, 0, 0, 0, 1],
                [0, 0, 0, 2, 1]
            ],
            houses: [{r:1,c:0},{r:4,c:3}]
        },
        // Tile 3: Straight road with houses on both sides
        {
            grid: [
                [2, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 4],
                [0, 0, 1, 0, 0],
                [0, 2, 1, 0, 0]
            ],
            houses: [{r:0,c:0},{r:4,c:1}]
        },
        // Tile 4: Cross with drinks
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 5, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 3, 0],
                [0, 0, 1, 0, 0]
            ],
            houses: []
        },
        // Tile 5: Dense housing
        {
            grid: [
                [2, 0, 1, 0, 2],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [2, 0, 1, 0, 0]
            ],
            houses: [{r:0,c:0},{r:0,c:4},{r:4,c:0}]
        },
        // Tile 6: Corner with lemonade
        {
            grid: [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 1],
                [0, 4, 0, 2, 1]
            ],
            houses: [{r:4,c:3}]
        },
        // Tile 7: T with houses
        {
            grid: [
                [0, 2, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 2, 0]
            ],
            houses: [{r:0,c:1},{r:4,c:3}]
        },
        // Tile 8: Ring road
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 2, 0, 0, 1],
                [0, 0, 0, 0, 1]
            ],
            houses: [{r:3,c:1}]
        },
        // Tile 9: Soda factory
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 5, 0],
                [0, 0, 1, 1, 1],
                [0, 0, 0, 0, 1],
                [2, 0, 0, 0, 1]
            ],
            houses: [{r:4,c:0}]
        },
        // Tile 10: Wide cross with beer
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 3, 1, 0, 2],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0]
            ],
            houses: [{r:1,c:4}]
        },
        // Tile 11: Residential
        {
            grid: [
                [2, 0, 1, 0, 2],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 2]
            ],
            houses: [{r:0,c:0},{r:0,c:4},{r:4,c:4}]
        },
        // Tile 12: Industrial
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 4, 1, 3, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0]
            ],
            houses: []
        },
        // Tile 13: Corner housing
        {
            grid: [
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0],
                [1, 0, 2, 0, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 5, 0]
            ],
            houses: [{r:2,c:2}]
        },
        // Tile 14: H-pattern
        {
            grid: [
                [0, 0, 1, 0, 0],
                [2, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 2],
                [0, 0, 1, 0, 0]
            ],
            houses: [{r:1,c:0},{r:3,c:4}]
        },
        // Tile 15: Junction
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0],
                [1, 2, 0, 4, 0]
            ],
            houses: [{r:4,c:1}]
        },
        // Tile 16: Beer district
        {
            grid: [
                [0, 0, 1, 0, 2],
                [0, 3, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0]
            ],
            houses: [{r:0,c:4}]
        },
        // Tile 17: Open cross
        {
            grid: [
                [0, 2, 1, 2, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0]
            ],
            houses: [{r:0,c:1},{r:0,c:3}]
        },
        // Tile 18: Suburban
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 1, 1],
                [0, 0, 0, 0, 1],
                [0, 0, 2, 0, 1]
            ],
            houses: [{r:4,c:2}]
        },
        // Tile 19: Drink row
        {
            grid: [
                [0, 0, 1, 0, 0],
                [0, 5, 1, 4, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 2, 0, 2, 0]
            ],
            houses: [{r:4,c:1},{r:4,c:3}]
        }
    ],

    rotateTile(tile, times) {
        let grid = tile.grid.map(r => [...r]);
        let houses = tile.houses.map(h => ({...h}));
        for (let t = 0; t < times; t++) {
            const n = grid.length;
            const newGrid = Array.from({length: n}, () => Array(n).fill(0));
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    newGrid[c][n - 1 - r] = grid[r][c];
                }
            }
            grid = newGrid;
            houses = houses.map(h => ({r: h.c, c: n - 1 - h.r}));
        }
        return { grid, houses };
    },

    generateMap(playerCount) {
        const config = GRID_CONFIGS[playerCount];
        const totalTiles = config.rows * config.cols;

        // Shuffle and pick tiles
        const shuffled = [...this.tileTemplates].sort(() => Math.random() - 0.5);
        const selected = [];
        for (let i = 0; i < totalTiles; i++) {
            selected.push(shuffled[i % shuffled.length]);
        }

        // Build the full grid
        const totalRows = config.rows * TILE_SIZE;
        const totalCols = config.cols * TILE_SIZE;
        const grid = Array.from({length: totalRows}, () => Array(totalCols).fill(CELL.EMPTY));
        const houses = [];
        let houseNum = 1;

        for (let tr = 0; tr < config.rows; tr++) {
            for (let tc = 0; tc < config.cols; tc++) {
                const rotation = Math.floor(Math.random() * 4);
                const tile = this.rotateTile(selected[tr * config.cols + tc], rotation);

                const startR = tr * TILE_SIZE;
                const startC = tc * TILE_SIZE;

                for (let r = 0; r < TILE_SIZE; r++) {
                    for (let c = 0; c < TILE_SIZE; c++) {
                        grid[startR + r][startC + c] = tile.grid[r][c];
                    }
                }

                for (const h of tile.houses) {
                    houses.push({
                        row: startR + h.r,
                        col: startC + h.c,
                        number: houseNum++,
                        demand: [],
                        garden: false
                    });
                    grid[startR + h.r][startC + h.c] = CELL.HOUSE;
                }
            }
        }

        // Ensure connectivity - add roads connecting tile borders
        this.ensureRoadConnectivity(grid, config);

        return {
            grid,
            houses,
            rows: totalRows,
            cols: totalCols,
            tileRows: config.rows,
            tileCols: config.cols,
            restaurants: [], // Will be populated during setup
            campaigns: []
        };
    },

    ensureRoadConnectivity(grid, config) {
        // Make sure roads connect between adjacent tiles at borders
        for (let tr = 0; tr < config.rows; tr++) {
            for (let tc = 0; tc < config.cols; tc++) {
                // Check right border
                if (tc < config.cols - 1) {
                    const borderCol = (tc + 1) * TILE_SIZE - 1;
                    const nextCol = borderCol + 1;
                    for (let r = tr * TILE_SIZE; r < (tr + 1) * TILE_SIZE; r++) {
                        if (grid[r][borderCol] === CELL.ROAD && grid[r][nextCol] !== CELL.ROAD) {
                            // Check if there's a nearby road on the next tile to connect to
                            // Just ensure the center row connects
                        }
                    }
                }
                // Check bottom border
                if (tr < config.rows - 1) {
                    const borderRow = (tr + 1) * TILE_SIZE - 1;
                    const nextRow = borderRow + 1;
                    for (let c = tc * TILE_SIZE; c < (tc + 1) * TILE_SIZE; c++) {
                        if (grid[borderRow][c] === CELL.ROAD && grid[nextRow][c] !== CELL.ROAD) {
                            // Ensure connectivity
                        }
                    }
                }
            }
        }

        // Ensure at least one road connection between every pair of adjacent tiles
        for (let tr = 0; tr < config.rows; tr++) {
            for (let tc = 0; tc < config.cols; tc++) {
                // Right connection
                if (tc < config.cols - 1) {
                    const rightEdge = (tc + 1) * TILE_SIZE - 1;
                    const leftEdge = rightEdge + 1;
                    let connected = false;
                    for (let r = tr * TILE_SIZE; r < (tr + 1) * TILE_SIZE; r++) {
                        if (grid[r][rightEdge] === CELL.ROAD && grid[r][leftEdge] === CELL.ROAD) {
                            connected = true;
                            break;
                        }
                    }
                    if (!connected) {
                        // Connect at the middle row
                        const midR = tr * TILE_SIZE + 2;
                        grid[midR][rightEdge] = CELL.ROAD;
                        grid[midR][leftEdge] = CELL.ROAD;
                    }
                }
                // Bottom connection
                if (tr < config.rows - 1) {
                    const bottomEdge = (tr + 1) * TILE_SIZE - 1;
                    const topEdge = bottomEdge + 1;
                    let connected = false;
                    for (let c = tc * TILE_SIZE; c < (tc + 1) * TILE_SIZE; c++) {
                        if (grid[bottomEdge][c] === CELL.ROAD && grid[topEdge][c] === CELL.ROAD) {
                            connected = true;
                            break;
                        }
                    }
                    if (!connected) {
                        const midC = tc * TILE_SIZE + 2;
                        grid[bottomEdge][midC] = CELL.ROAD;
                        grid[topEdge][midC] = CELL.ROAD;
                    }
                }
            }
        }
    },

    // Find valid positions for restaurant placement (2x2 empty area adjacent to road)
    getValidRestaurantPositions(map, existingRestaurants, isInitial) {
        const positions = [];
        for (let r = 0; r < map.rows - 1; r++) {
            for (let c = 0; c < map.cols - 1; c++) {
                if (this.canPlaceRestaurant(map, r, c, existingRestaurants, isInitial)) {
                    // Check each corner for entrance (must be adjacent to road)
                    const entrances = this.getValidEntrances(map, r, c);
                    if (entrances.length > 0) {
                        positions.push({ row: r, col: c, entrances });
                    }
                }
            }
        }
        return positions;
    },

    canPlaceRestaurant(map, r, c, existingRestaurants, isInitial) {
        // Check 2x2 area is all empty
        for (let dr = 0; dr < 2; dr++) {
            for (let dc = 0; dc < 2; dc++) {
                const cell = map.grid[r + dr]?.[c + dc];
                if (cell === undefined || cell !== CELL.EMPTY) return false;
            }
        }

        // Check not overlapping existing restaurants
        for (const rest of existingRestaurants) {
            if (r < rest.row + 2 && r + 2 > rest.row &&
                c < rest.col + 2 && c + 2 > rest.col) {
                return false;
            }
        }

        return true;
    },

    getValidEntrances(map, r, c) {
        const entrances = [];
        // Check each corner of the 2x2 for road adjacency
        const corners = [
            {dr: 0, dc: 0, adj: [{dr:-1,dc:0},{dr:0,dc:-1}]},
            {dr: 0, dc: 1, adj: [{dr:-1,dc:1},{dr:0,dc:2}]},
            {dr: 1, dc: 0, adj: [{dr:2,dc:0},{dr:1,dc:-1}]},
            {dr: 1, dc: 1, adj: [{dr:2,dc:1},{dr:1,dc:2}]}
        ];

        for (const corner of corners) {
            for (const adj of corner.adj) {
                const ar = r + adj.dr;
                const ac = c + adj.dc;
                if (ar >= 0 && ar < map.rows && ac >= 0 && ac < map.cols) {
                    if (map.grid[ar][ac] === CELL.ROAD) {
                        entrances.push({
                            row: r + corner.dr,
                            col: c + corner.dc,
                            roadRow: ar,
                            roadCol: ac
                        });
                        break;
                    }
                }
            }
        }
        return entrances;
    },

    // BFS to find road distance between two cells
    roadDistance(map, fromRow, fromCol, toRow, toCol) {
        if (fromRow === toRow && fromCol === toCol) return 0;

        const visited = new Set();
        const queue = [{r: fromRow, c: fromCol, dist: 0}];
        visited.add(`${fromRow},${fromCol}`);

        while (queue.length > 0) {
            const {r, c, dist} = queue.shift();

            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                const key = `${nr},${nc}`;

                if (nr < 0 || nr >= map.rows || nc < 0 || nc >= map.cols) continue;
                if (visited.has(key)) continue;

                if (nr === toRow && nc === toCol) return dist + 1;

                if (map.grid[nr][nc] === CELL.ROAD) {
                    visited.add(key);
                    queue.push({r: nr, c: nc, dist: dist + 1});
                }
            }
        }

        return Infinity;
    },

    // Get tile index for a given cell
    getTileIndex(row, col) {
        return {
            tileRow: Math.floor(row / TILE_SIZE),
            tileCol: Math.floor(col / TILE_SIZE)
        };
    },

    // Get distance in tile borders crossed
    tileDistance(map, fromRow, fromCol, toRow, toCol) {
        // Road distance counting tile borders crossed
        const visited = new Set();
        const queue = [{r: fromRow, c: fromCol, tileBorders: 0}];
        visited.add(`${fromRow},${fromCol}`);

        while (queue.length > 0) {
            const {r, c, tileBorders} = queue.shift();

            if (r === toRow && c === toCol) return tileBorders;

            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                const key = `${nr},${nc}`;

                if (nr < 0 || nr >= map.rows || nc < 0 || nc >= map.cols) continue;
                if (visited.has(key)) continue;

                const cell = map.grid[nr][nc];
                if (cell !== CELL.ROAD && nr !== toRow && nc !== toCol) continue;

                // Check if crossing tile border
                const fromTile = this.getTileIndex(r, c);
                const toTile = this.getTileIndex(nr, nc);
                const crossesBorder = (fromTile.tileRow !== toTile.tileRow || fromTile.tileCol !== toTile.tileCol) ? 1 : 0;

                visited.add(key);
                queue.push({r: nr, c: nc, tileBorders: tileBorders + crossesBorder});
            }
        }

        return Infinity;
    },

    // Find houses reachable from a position within given road range
    findHousesInRange(map, fromRow, fromCol, range) {
        const houses = [];
        const visited = new Set();
        const queue = [{r: fromRow, c: fromCol, dist: 0}];
        visited.add(`${fromRow},${fromCol}`);

        while (queue.length > 0) {
            const {r, c, dist} = queue.shift();

            // Check if this cell is a house
            const house = map.houses.find(h => h.row === r && h.col === c);
            if (house) houses.push({house, distance: dist});

            if (dist >= range) continue;

            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                const key = `${nr},${nc}`;

                if (nr < 0 || nr >= map.rows || nc < 0 || nc >= map.cols) continue;
                if (visited.has(key)) continue;

                if (map.grid[nr][nc] === CELL.ROAD || map.grid[nr][nc] === CELL.HOUSE) {
                    visited.add(key);
                    queue.push({r: nr, c: nc, dist: dist + 1});
                }
            }
        }

        return houses;
    },

    // Find drink sources reachable from a restaurant entrance
    findDrinkSources(map, fromRow, fromCol, range, routeType) {
        const sources = [];
        const visited = new Set();
        const queue = [{r: fromRow, c: fromCol, dist: 0}];
        visited.add(`${fromRow},${fromCol}`);

        while (queue.length > 0) {
            const {r, c, dist} = queue.shift();

            const cell = map.grid[r][c];
            if (cell === CELL.DRINK_BEER || cell === CELL.DRINK_LEMON || cell === CELL.DRINK_SODA) {
                const drinkType = cell === CELL.DRINK_BEER ? 'beer' :
                                  cell === CELL.DRINK_LEMON ? 'lemonade' : 'soda';
                sources.push({row: r, col: c, type: drinkType});
            }

            if (dist >= range) continue;

            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                const key = `${nr},${nc}`;

                if (nr < 0 || nr >= map.rows || nc < 0 || nc >= map.cols) continue;
                if (visited.has(key)) continue;

                if (routeType === 'fly') {
                    // Zeppelin ignores roads, just count tile borders
                    visited.add(key);
                    const fromTile = this.getTileIndex(r, c);
                    const toTile = this.getTileIndex(nr, nc);
                    const crossesBorder = (fromTile.tileRow !== toTile.tileRow || fromTile.tileCol !== toTile.tileCol) ? 1 : 0;
                    queue.push({r: nr, c: nc, dist: dist + crossesBorder});
                } else {
                    // Follow roads
                    if (map.grid[nr][nc] === CELL.ROAD || map.grid[nr][nc] >= CELL.DRINK_BEER) {
                        visited.add(key);
                        queue.push({r: nr, c: nc, dist: dist + 1});
                    }
                }
            }
        }

        return sources;
    }
};
