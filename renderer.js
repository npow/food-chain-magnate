// ===== BOARD RENDERER =====

class BoardRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 48;
        this.offsetX = 0;
        this.offsetY = 0;
        this.hoveredCell = null;
        this.highlights = [];
        this.selectedCell = null;
        this.lastState = null;
        this.brandMarks = PLAYER_BRAND_ASSETS.map(src => {
            const image = new Image();
            image.onload = () => {
                if (this.lastState) this.render(this.lastState);
            };
            image.src = src;
            return image;
        });
        this.componentImages = {};
        for (const [name, src] of Object.entries({
            houseTile: 'assets/house-tile.png',
            soda: 'assets/drink-soda.png',
            beer: 'assets/drink-beer.png',
            lemonade: 'assets/drink-lemonade.png'
        })) {
            const image = new Image();
            image.onload = () => {
                if (this.lastState) this.render(this.lastState);
            };
            image.src = src;
            this.componentImages[name] = image;
        }
    }

    resize(map) {
        const w = map.cols * this.cellSize;
        const h = map.rows * this.cellSize;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    render(state) {
        if (!state || !state.map) return;
        this.lastState = state;

        const map = state.map;
        const ctx = this.ctx;
        const cs = this.cellSize;

        this.resize(map);

        // Clear — warm parchment
        ctx.fillStyle = '#e0d4b8';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw tile borders — warm brown dashed
        ctx.strokeStyle = 'rgba(139, 119, 90, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
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
        ctx.setLineDash([]);

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
            ctx.strokeStyle = hl.color || 'rgba(196, 30, 58, 0.8)';
            ctx.lineWidth = 2;
            ctx.strokeRect(hl.col * cs + 1, hl.row * cs + 1, cs - 2, cs - 2);
        }

        // Draw hovered cell
        if (this.hoveredCell) {
            ctx.strokeStyle = 'rgba(44, 24, 16, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.hoveredCell.col * cs + 1, this.hoveredCell.row * cs + 1, cs - 2, cs - 2);
        }

        // Draw selected cell
        if (this.selectedCell) {
            ctx.strokeStyle = '#d4940a';
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
                // Bright warm grass
                ctx.fillStyle = '#8cb860';
                ctx.fillRect(x, y, cs, cs);
                // Varied grass texture dots
                const grassColors = ['#7aa850', '#96c468', '#82b058'];
                for (let i = 0; i < 5; i++) {
                    const gx = x + ((r * 7 + c * 13 + i * 17) % (cs - 4)) + 2;
                    const gy = y + ((r * 11 + c * 3 + i * 23) % (cs - 4)) + 2;
                    ctx.fillStyle = grassColors[(r + c + i) % 3];
                    ctx.fillRect(gx, gy, 2, 2);
                }
                break;

            case CELL.ROAD:
                // Warm asphalt
                ctx.fillStyle = '#a0978a';
                ctx.fillRect(x, y, cs, cs);
                ctx.fillStyle = '#b0a89a';
                ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);

                // Yellow center dashes (classic US lane markings)
                ctx.strokeStyle = '#d4c040';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 4]);
                if (this.hasAdjacentRoad(map, r, c, 0, 1) || this.hasAdjacentRoad(map, r, c, 0, -1)) {
                    ctx.beginPath();
                    ctx.moveTo(x + cs / 2, y + 3);
                    ctx.lineTo(x + cs / 2, y + cs - 3);
                    ctx.stroke();
                }
                if (this.hasAdjacentRoad(map, r, c, 1, 0) || this.hasAdjacentRoad(map, r, c, -1, 0)) {
                    ctx.beginPath();
                    ctx.moveTo(x + 3, y + cs / 2);
                    ctx.lineTo(x + cs - 3, y + cs / 2);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
                break;

            case CELL.HOUSE: {
                // Grass background
                ctx.fillStyle = '#8cb860';
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
                ctx.fillStyle = '#8cb860';
                ctx.fillRect(x, y, cs, cs);
                this.drawDrinkSource(ctx, x, y, cs, cell);
                break;
            }

            default:
                // Restaurant cells (100+)
                if (cell >= 100) {
                    const playerIdx = cell - 100;
                    ctx.fillStyle = PLAYER_COLORS[playerIdx];
                    ctx.globalAlpha = 0.2;
                    ctx.fillRect(x, y, cs, cs);
                    ctx.globalAlpha = 1;
                }
                break;
        }

        // Grid line
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
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
        // Render the actual numbered house piece at its original portrait ratio.
        const tileImage = this.componentImages.houseTile;
        const tileHeight = cs - 2;
        const tileWidth = tileImage?.naturalWidth && tileImage?.naturalHeight
            ? tileHeight * tileImage.naturalWidth / tileImage.naturalHeight
            : tileHeight * 0.64;
        const tileX = x + (cs - tileWidth) / 2;
        const tileY = y + 1;
        if (tileImage?.complete && tileImage.naturalWidth > 0) {
            ctx.drawImage(tileImage, tileX, tileY, tileWidth, tileHeight);
        } else {
            ctx.fillStyle = '#79264a';
            ctx.fillRect(tileX, tileY, tileWidth, tileHeight);
        }

        // Houses without a garden keep the printed yard area but omit the gate.
        if (!house.garden) {
            ctx.fillStyle = '#95b75e';
            ctx.fillRect(tileX + 1, tileY + tileHeight * 0.68, tileWidth - 2, tileHeight * 0.3);
        }

        // Replace the sample tile's printed "1" with this house's number.
        const numberX = tileX + tileWidth * 0.82;
        const numberY = tileY + 7;
        ctx.fillStyle = '#79264a';
        ctx.fillRect(tileX + tileWidth * 0.68, tileY + 1, tileWidth * 0.28, 11);
        ctx.fillStyle = '#fff4d8';
        ctx.font = 'bold 8px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(house.number, numberX, numberY);

        // Small demand markers sit over the artwork like tokens on the tile.
        if (house.demand?.length > 0) {
            const tokenSize = 8;
            const startX = x + 4;
            const startY = y + cs - 15;
            house.demand.forEach((d, i) => {
                const tx = startX + (i % 3) * (tokenSize + 2);
                const ty = startY - Math.floor(i / 3) * (tokenSize + 2);
                ctx.fillStyle = this.getDemandColor(d);
                ctx.beginPath();
                ctx.arc(tx + tokenSize / 2, ty + tokenSize / 2, tokenSize / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff4d8';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = d === 'soda' ? '#fff' : '#2c1810';
                ctx.font = 'bold 5px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const initials = { burger: 'B', pizza: 'P', beer: 'B', lemonade: 'L', soda: 'S' };
                ctx.fillText(initials[d] || '?', tx + tokenSize / 2, ty + tokenSize / 2);
            });
        }
    }

    getDemandColor(type) {
        const colors = {
            burger: '#d45a3a',
            pizza: '#e8a030',
            beer: '#c4a840',
            lemonade: '#6ab8a0',
            soda: '#3a6070'
        };
        return colors[type] || '#888';
    }

    drawDrinkSource(ctx, x, y, cs, cellType) {
        const info = {
            [CELL.DRINK_BEER]: { key: 'beer', fill: '#174d3d', label: 'BEER' },
            [CELL.DRINK_LEMON]: { key: 'lemonade', fill: '#e6ad16', label: 'LEM' },
            [CELL.DRINK_SODA]: { key: 'soda', fill: '#ae2028', label: 'SODA' }
        }[cellType];

        // Drink locations use the game's original wooden token silhouettes.
        const radius = cs / 2 - 3;
        ctx.fillStyle = '#fff5dc';
        ctx.beginPath();
        ctx.arc(x + cs / 2, y + cs / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = info.fill;
        ctx.lineWidth = 2;
        ctx.stroke();

        const token = this.componentImages[info.key];
        if (token?.complete && token.naturalWidth > 0) {
            const maxW = 18;
            const maxH = 25;
            const scale = Math.min(maxW / token.naturalWidth, maxH / token.naturalHeight);
            const drawW = token.naturalWidth * scale;
            const drawH = token.naturalHeight * scale;
            ctx.drawImage(token, x + (cs - drawW) / 2, y + 2, drawW, drawH);
        }

        ctx.fillStyle = '#38271c';
        ctx.font = 'bold 6px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.label, x + cs / 2, y + cs - 6);
    }

    drawRestaurant(ctx, rest, state) {
        const cs = this.cellSize;
        const x = rest.col * cs;
        const y = rest.row * cs;
        const w = 2 * cs;
        const h = 2 * cs;
        const color = PLAYER_COLORS[rest.owner];

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 4, y + 4, w - 4, h - 4);

        // Cream building body
        ctx.fillStyle = '#f5ece0';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

        // Striped awning at top
        const awningH = 12;
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = i % 2 === 0 ? color : '#fff';
            ctx.fillRect(x + 2 + i * ((w - 4) / 8), y + 2, (w - 4) / 8, awningH);
        }

        // Player-colored border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

        // Name plate
        const signY = y + awningH + 7;
        const signW = w - 24;
        const signH = 54;
        const signLeft = x + (w - signW) / 2;
        ctx.fillStyle = '#fff8ec';
        ctx.fillRect(signLeft, signY, signW, signH);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(signLeft, signY, signW, signH);
        const brand = this.brandMarks[rest.owner];
        if (brand?.complete && brand.naturalWidth > 0) {
            const scale = Math.min((signW - 6) / brand.naturalWidth, (signH - 6) / brand.naturalHeight);
            const imageW = brand.naturalWidth * scale;
            const imageH = brand.naturalHeight * scale;
            ctx.drawImage(brand, x + (w - imageW) / 2, signY + (signH - imageH) / 2, imageW, imageH);
        }

        // Status text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (rest.open) {
            ctx.fillStyle = '#2a7a5a';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillText('OPEN', x + w / 2, y + h - 9);
        } else {
            ctx.fillStyle = '#c41e3a';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.fillText('COMING SOON', x + w / 2, y + h - 9);
        }

        // Entrance marker — colored circle with "E"
        const ex = rest.entrance.col * cs;
        const ey = rest.entrance.row * cs;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(ex + cs / 2, ey + cs / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', ex + cs / 2, ey + cs / 2);
    }

    drawCampaign(ctx, camp, state) {
        const cs = this.cellSize;
        const x = camp.col * cs;
        const y = camp.row * cs;
        const color = PLAYER_COLORS[camp.owner];

        // Billboard post
        ctx.fillStyle = '#6d5a40';
        ctx.fillRect(x + cs / 2 - 2, y + cs - 8, 4, 8);

        // Billboard rectangle
        ctx.fillStyle = '#f5ece0';
        ctx.fillRect(x + 4, y + 4, cs - 8, cs - 14);
        ctx.strokeStyle = color || '#888';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 4, y + 4, cs - 8, cs - 14);

        // Type abbreviation
        const abbrevs = { billboard: 'BB', mailbox: 'MX', airplane: 'AP', radio: 'RD' };
        ctx.fillStyle = '#2c1810';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(abbrevs[camp.type] || '??', x + cs / 2, y + cs / 2 - 5);

        // Duration dots
        const dotY = y + cs / 2 + 4;
        for (let i = 0; i < camp.duration; i++) {
            ctx.fillStyle = color || '#888';
            ctx.beginPath();
            ctx.arc(x + cs / 2 - (camp.duration - 1) * 4 + i * 8, dotY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Product indicator
        ctx.fillStyle = this.getDemandColor(camp.product);
        ctx.beginPath();
        ctx.arc(x + cs - 7, y + 7, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
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
