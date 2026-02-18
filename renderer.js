// ===== BOARD RENDERER =====

class BoardRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 40;
        this.offsetX = 0;
        this.offsetY = 0;
        this.hoveredCell = null;
        this.highlights = [];
        this.selectedCell = null;
    }

    resize(map) {
        const w = map.cols * this.cellSize;
        const h = map.rows * this.cellSize;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    render(state) {
        if (!state || !state.map) return;

        const map = state.map;
        const ctx = this.ctx;
        const cs = this.cellSize;

        this.resize(map);

        // Clear
        ctx.fillStyle = '#1a2332';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw tile borders
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let tr = 0; tr <= map.tileRows; tr++) {
            ctx.beginPath();
            ctx.moveTo(0, tr * TILE_SIZE * cs);
            ctx.lineTo(map.cols * cs, tr * TILE_SIZE * cs);
            ctx.stroke();
        }
        for (let tc = 0; tc <= map.tileCols; tc++) {
            ctx.beginPath();
            ctx.moveTo(tc * TILE_SIZE * cs, 0);
            ctx.lineTo(tc * TILE_SIZE * cs, map.rows * cs);
            ctx.stroke();
        }

        // Draw cells
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                this.drawCell(ctx, map, state, r, c);
            }
        }

        // Draw restaurants
        for (const rest of map.restaurants) {
            this.drawRestaurant(ctx, rest, state);
        }

        // Draw campaigns
        for (const camp of map.campaigns) {
            this.drawCampaign(ctx, camp, state);
        }

        // Draw highlights
        for (const hl of this.highlights) {
            ctx.strokeStyle = hl.color || 'rgba(233, 69, 96, 0.8)';
            ctx.lineWidth = 2;
            ctx.strokeRect(hl.col * cs + 1, hl.row * cs + 1, cs - 2, cs - 2);
        }

        // Draw hovered cell
        if (this.hoveredCell) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.hoveredCell.col * cs + 1, this.hoveredCell.row * cs + 1, cs - 2, cs - 2);
        }

        // Draw selected cell
        if (this.selectedCell) {
            ctx.strokeStyle = '#f4a261';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.selectedCell.col * cs, this.selectedCell.row * cs, cs, cs);
        }
    }

    drawCell(ctx, map, state, r, c) {
        const cs = this.cellSize;
        const x = c * cs;
        const y = r * cs;
        const cell = map.grid[r][c];

        switch (cell) {
            case CELL.EMPTY:
                // Grass
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(x, y, cs, cs);
                // Subtle grass texture
                ctx.fillStyle = '#326128';
                if ((r + c) % 3 === 0) ctx.fillRect(x + 8, y + 8, 4, 4);
                if ((r + c) % 5 === 1) ctx.fillRect(x + 24, y + 20, 3, 3);
                break;

            case CELL.ROAD:
                ctx.fillStyle = '#4a4a5a';
                ctx.fillRect(x, y, cs, cs);
                // Road markings
                ctx.fillStyle = '#5a5a6a';
                ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
                // Center line
                ctx.fillStyle = '#6a6a7a';
                if (this.hasAdjacentRoad(map, r, c, 0, 1) || this.hasAdjacentRoad(map, r, c, 0, -1)) {
                    ctx.fillRect(x + cs/2 - 1, y + 2, 2, cs - 4);
                }
                if (this.hasAdjacentRoad(map, r, c, 1, 0) || this.hasAdjacentRoad(map, r, c, -1, 0)) {
                    ctx.fillRect(x + 2, y + cs/2 - 1, cs - 4, 2);
                }
                break;

            case CELL.HOUSE: {
                // Grass background
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(x, y, cs, cs);

                const house = map.houses.find(h => h.row === r && h.col === c);
                if (house) {
                    this.drawHouse(ctx, x, y, cs, house);
                }
                break;
            }

            case CELL.DRINK_BEER:
            case CELL.DRINK_LEMON:
            case CELL.DRINK_SODA: {
                // Grass background
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(x, y, cs, cs);
                this.drawDrinkSource(ctx, x, y, cs, cell);
                break;
            }

            default:
                // Restaurant cells (100+)
                if (cell >= 100) {
                    const playerIdx = cell - 100;
                    ctx.fillStyle = PLAYER_COLORS[playerIdx];
                    ctx.globalAlpha = 0.3;
                    ctx.fillRect(x, y, cs, cs);
                    ctx.globalAlpha = 1;
                }
                break;
        }

        // Grid line
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cs, cs);
    }

    hasAdjacentRoad(map, r, c, dr, dc) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= map.rows || nc < 0 || nc >= map.cols) return false;
        return map.grid[nr][nc] === CELL.ROAD;
    }

    drawHouse(ctx, x, y, cs, house) {
        // House body
        const hw = cs * 0.7;
        const hh = cs * 0.55;
        const hx = x + (cs - hw) / 2;
        const hy = y + cs - hh - 2;

        // Wall
        ctx.fillStyle = '#e8d4b8';
        ctx.fillRect(hx, hy, hw, hh);

        // Roof
        ctx.fillStyle = '#c44536';
        ctx.beginPath();
        ctx.moveTo(hx - 2, hy);
        ctx.lineTo(hx + hw / 2, hy - 10);
        ctx.lineTo(hx + hw + 2, hy);
        ctx.closePath();
        ctx.fill();

        // Door
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(hx + hw/2 - 3, hy + hh - 10, 6, 10);

        // Window
        ctx.fillStyle = '#a8dadc';
        ctx.fillRect(hx + 4, hy + 4, 6, 6);
        ctx.fillRect(hx + hw - 10, hy + 4, 6, 6);

        // House number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(house.number, x + cs/2, y + 10);

        // Garden indicator
        if (house.garden) {
            ctx.fillStyle = '#43a047';
            ctx.fillRect(x + 2, y + cs - 5, cs - 4, 3);
        }

        // Demand tokens
        if (house.demand.length > 0) {
            const tokenSize = 7;
            const startX = x + 2;
            const startY = y + 2;
            house.demand.forEach((d, i) => {
                const tx = startX + (i % 3) * (tokenSize + 1);
                const ty = startY + Math.floor(i / 3) * (tokenSize + 1);
                ctx.fillStyle = this.getDemandColor(d);
                ctx.beginPath();
                ctx.arc(tx + tokenSize/2, ty + tokenSize/2, tokenSize/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });
        }
    }

    getDemandColor(type) {
        const colors = {
            burger: '#e76f51',
            pizza: '#f4a261',
            beer: '#e9c46a',
            lemonade: '#a8dadc',
            soda: '#264653'
        };
        return colors[type] || '#888';
    }

    drawDrinkSource(ctx, x, y, cs, cellType) {
        const colors = {
            [CELL.DRINK_BEER]: { fill: '#e9c46a', icon: '🍺', label: 'B' },
            [CELL.DRINK_LEMON]: { fill: '#a8dadc', icon: '🍋', label: 'L' },
            [CELL.DRINK_SODA]: { fill: '#457b9d', icon: '🥤', label: 'S' }
        };
        const info = colors[cellType];

        // Circle background
        ctx.fillStyle = info.fill;
        ctx.beginPath();
        ctx.arc(x + cs/2, y + cs/2, cs/2 - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.label, x + cs/2, y + cs/2);
    }

    drawRestaurant(ctx, rest, state) {
        const cs = this.cellSize;
        const x = rest.col * cs;
        const y = rest.row * cs;
        const w = 2 * cs;
        const h = 2 * cs;
        const color = PLAYER_COLORS[rest.owner];

        // Building
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

        // Name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.players[rest.owner].name.split(' ')[0], x + w/2, y + h/2 - 6);

        // Status
        ctx.font = '8px sans-serif';
        ctx.fillText(rest.open ? 'WELCOME' : 'COMING SOON', x + w/2, y + h/2 + 6);

        // Entrance marker
        const ex = rest.entrance.col * cs;
        const ey = rest.entrance.row * cs;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + cs/2, ey + cs/2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(ex + cs/2, ey + cs/2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCampaign(ctx, camp, state) {
        const cs = this.cellSize;
        const x = camp.col * cs;
        const y = camp.row * cs;

        // Campaign marker
        const typeColors = {
            billboard: '#e9c46a',
            mailbox: '#2a9d8f',
            airplane: '#457b9d',
            radio: '#9b5de5'
        };

        ctx.fillStyle = typeColors[camp.type] || '#888';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x + 4, y + 4, cs - 8, cs - 8);
        ctx.globalAlpha = 1;

        // Icon
        const icons = { billboard: 'BB', mailbox: 'MX', airplane: 'AP', radio: 'RD' };
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icons[camp.type], x + cs/2, y + cs/2 - 4);

        // Duration
        ctx.fillText(`${camp.duration}`, x + cs/2, y + cs/2 + 6);

        // Product indicator
        ctx.fillStyle = this.getDemandColor(camp.product);
        ctx.beginPath();
        ctx.arc(x + cs - 6, y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    setHighlights(highlights) {
        this.highlights = highlights;
    }

    clearHighlights() {
        this.highlights = [];
        this.selectedCell = null;
    }

    getCellFromMouse(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return { row, col };
    }
}
