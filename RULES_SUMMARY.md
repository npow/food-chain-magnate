# Food Chain Magnate -- Comprehensive Rules Summary

**Designer:** Jeroen Doumen & Joris Wiersinga
**Publisher:** Splotter Spellen (2015)
**Players:** 2-5 (best at 3-4)
**Duration:** 120-240 minutes

---

## 1. GAME OVERVIEW

Food Chain Magnate is a heavy strategy game about building a fast food chain. Players compete on a variable city map by hiring and training staff (represented by cards), building restaurants, marketing food and drinks, and fulfilling demand from houses. The game uses a card-driven human resource management system. The game ends when the bank runs out of money twice. The player with the most cash wins.

---

## 2. GAME SETUP

### Map Construction
- The map is assembled from randomly selected and randomly rotated square tiles.
- Each tile is a 5x5 grid of squares containing roads, houses (numbered), drink supply symbols (bottling plants), and empty spaces.
- **Tile count by player count:**
  - 2 players: 3x3 grid (9 tiles)
  - 3 players: 4x4 grid (16 tiles)
  - 4 players: 4x5 grid (20 tiles)
  - 5 players: 5x4 grid (20 tiles)

### Employee and Milestone Cards
- Lay out all employee cards and milestone cards in the display according to the rulebook diagram, showing upgrade paths.
- For cards marked as unique (1x / top positions): keep 1 card in 2-3 player games, 2 cards in 4-player games, 3 cards in 5-player games.
- Employee cards are a shared, limited supply. They do not scale by player count.

### Bank
- Place **$50 x number of players** into the bank. The rest of the money goes back in the box.
- Players start with **no money**.

### Player Starting Components
Each player chooses a restaurant chain and receives:
- 1 CEO card
- 3 restaurant tiles (2x2 squares each, with one corner marked as the entrance)
- 3 bank reserve cards (denominations: $100, $200, $300; each also shows 2, 3, or 4 CEO slots)

### Initial Restaurant Placement
1. Determine random starting player order.
2. In reverse order (last player first), each player may place one restaurant or pass.
3. If it comes back around, any player who passed **must** place.
4. Restaurant placement rules:
   - The restaurant occupies a 2x2 area of empty squares.
   - The entrance corner must be adjacent to a road.
   - During initial placement only: no two restaurant entrances may be on the same tile.

### Reserve Card Selection
- After restaurants are placed, each player secretly selects one of their three reserve cards and places it face down.
- The selected cards are revealed simultaneously, and their monetary values are summed. This total becomes the bank's reserve fund.
- The remaining (unchosen) reserve cards are discarded.
- **Strategic note:** Higher-value cards mean a longer game; lower values mean a shorter game.

---

## 3. TURN STRUCTURE (7 Phases)

Each game round consists of seven phases. Some phases are simultaneous; others use turn order.

### Phase 1: Restructuring (Simultaneous)

Players simultaneously decide which employee cards to put to work this turn. Cards are placed **face down**, then revealed simultaneously and arranged into the **company structure** (organizational chart / pyramid):

- The **CEO** is always at the top and always works. The CEO starts with 3 subordinate slots (may change when reserve cards are opened).
- **Managers (black cards)** report directly to the CEO. Each manager has a number of subordinate slots (see manager details below). Managers can only hold normal (non-manager) employees as subordinates.
- **Normal employees** (non-black cards) can report directly to the CEO or to a manager.
- Only managers and normal staff may report to the CEO. Only normal staff may report to managers. Managers cannot report to other managers.
- You cannot have two managers with the same job title in your structure at the same time.

Cards not placed into the structure go to **"the beach"** (inactive). Beach cards still require salary if they have a salary symbol, but do not perform any actions.

**Overflow rule:** If a player accidentally places more cards than can fit, ALL cards except the CEO go to the beach, and the player plays with only the CEO that turn.

### Phase 2: Order of Business (Turn Order Determination)

- Count the number of **open (empty) slots** in each player's company structure (unused CEO slots and unused manager subordinate slots).
- The player with the **most open slots** chooses their turn order position first, then the next, etc.
- If players tie in open slots, the player who was earlier in the previous turn's order chooses first.
- The "First airplane campaign" milestone grants +2 phantom open slots for this determination (these cannot hold employees).
- On the very first turn, turn order is the reverse of restaurant placement order.

### Phase 3: Working 9:00 to 5:00 (Sequential, in turn order)

Players take turns, each activating all employees in their structure. Each employee performs one action. Actions must be performed in a specific order:

**Action order within a turn:**
1. **New Business Developer** (place house or garden)
2. **Pricing/Discount/Luxuries Managers** (mandatory -- their effects apply automatically)
3. **CFO** (mandatory -- bonus applies at end of Phase 4)
4. **Recruiters** (CEO recruits 1; Recruiting Girl recruits 1; Recruiting Manager recruits 2; HR Director recruits 4)
5. **Trainers** (Trainer: 1 training step; Coach: 2 steps; Guru: 3 steps)
6. **Marketing** (place campaigns based on marketeer type)
7. **Kitchen Staff** (produce food)
8. **Buyers** (acquire drinks)
9. **Local/Regional Manager** (place/move restaurants)
10. **Waitress** (mandatory -- income at end of Phase 4)

**Important recruitment rules:**
- You may only hire **entry-level employees** (marked with a triangle symbol). Entry-level employees do not require salary.
- Hired employees go to the beach. They can be trained immediately if you have training capacity remaining.

**Important training rules:**
- You may only train employees that are **on the beach** (not currently in the structure and not busy marketeers).
- Each training action advances one employee one step along their career path.
- A Coach can use both training actions on the same employee (2 steps up).
- A Guru can use all three training actions on the same employee (3 steps up).
- Normally, you cannot combine training actions from different trainers on the same employee in one turn. **Exception:** The "First to pay $20 in salaries" milestone allows combining training from multiple employees on the same person.
- When training through an intermediate position, if the intermediate card pile is empty, you may skip over it.

### Phase 4: Dinnertime (Sequential, in house number order)

This is the core sales phase. Houses are processed in ascending numerical order.

**For each house:**

1. **Check demand:** If the house has no demand tokens, skip it.

2. **Check supply:** Determine which restaurant chains can fulfill the **complete** demand of the house. A chain must:
   - Have all the food and drinks matching every demand token on the house.
   - Have a restaurant connected to the house by road.
   - Partial fulfillment is **not allowed** -- you must satisfy the entire order or nothing.

3. **If exactly one chain qualifies:** That chain makes the sale.

4. **If multiple chains qualify -- Competition:**
   a. Each chain calculates its **unit price**:
      - Base price: **$10**
      - Pricing Manager: **-$1** each
      - Discount Manager: **-$3** each
      - Luxuries Manager: **+$10**
      - "First to lower prices" milestone: **-$1** (permanent)

   b. Each chain measures **distance**: Count the number of tile borders crossed along roads from the house to the nearest restaurant entrance of that chain.

   c. Calculate: **Unit Price + Distance = Total**

   d. The house buys from the chain with the **lowest total**.

   e. **Tiebreaker 1:** Most waitresses in the structure.

   f. **Tiebreaker 2:** Earlier position in turn order.

5. **Payment:**
   - The selling chain receives: **(Unit Price x Number of Items Sold)**
   - If the house has a **garden**: The chain receives **(2 x Unit Price x Number of Items) + Bonuses** (unit price is doubled, but bonuses are not).
   - **Milestone bonuses** (e.g., "First burger marketed" = +$5 per burger sold) are added on top but are NOT doubled by gardens and do NOT affect the unit price for competition purposes.
   - Remove the fulfilled demand tokens from the house.

6. **After all houses are processed:**
   - **Waitress income:** Each chain receives $3 per waitress in its structure ($5 per waitress if the chain has the "First waitress played" milestone).
   - **CFO bonus:** If a chain has a CFO in its structure (or the "First to have $100" milestone), it receives a **50% bonus** on all earnings this turn (including waitress tips), rounded up.

7. **Breaking the Bank (1st time):** If the bank cannot pay a chain's earnings:
   - Open all players' selected reserve cards.
   - Sum their monetary values and add this to the bank.
   - The number shown on reserve cards (2, 3, or 4) determines new CEO slot count: whichever number appears most often among all revealed cards becomes the new CEO slot count for ALL players. If tied, the higher number wins.
   - Pay remaining earnings from the replenished bank.

8. **Breaking the Bank (2nd time):** The game ends immediately after Phase 4. If the bank cannot fully pay, track remaining earnings on paper. The player with the most cash wins. Tiebreaker: earlier turn order.

### Phase 5: Payday (Simultaneous)

1. **Optional firing:** You may fire any employees you wish (return them to the supply). You may NOT fire busy marketeers (those with active campaigns) unless under specific circumstances.

2. **Pay salaries:** Each employee card you own (whether in structure or on the beach) that has the salary symbol costs **$5**.
   - **Salary discounts:** Each unused recruitment action on a Recruiting Manager or HR Director provides a **-$5 discount** on total salary (minimum $0).
   - **"First to train" milestone:** Provides a **-$15 discount** on total salary for the rest of the game.

3. **Forced quitting:** If you cannot pay an employee's salary, that employee quits (returned to supply).

4. Salary payments go to the bank.

### Phase 6: Marketing Campaigns (Run campaigns in numbered order)

Active marketing campaigns run in the order of their numbered campaign markers. Each campaign:

1. Places demand tokens on houses within its reach (see campaign types below).
2. Each house can hold a maximum of **3 demand tokens** (or **5** if the house has a garden).
3. Remove one advertising token from the campaign. If the last token is removed, the campaign ends: remove the campaign tile and free the associated marketeer.

**Campaign Types and Reach:**

| Type | Reach | Notes |
|------|-------|-------|
| **Billboard** | All houses orthogonally adjacent to the billboard tile (not diagonal) | Must be placed with one edge touching a road the marketeer traveled |
| **Mailbox** | All houses in the same "block" (enclosed area bounded by roads and/or board edges) | Freely passes through other map elements; only stopped by roads |
| **Airplane** | All houses in a flyover zone of 1, 3, or 5 rows/columns | Placed on the edge of the board; not affected by range; different sizes available |
| **Radio** | All houses on the tile where the radio is placed AND all 8 surrounding tiles | "First radio campaign" milestone: places 2 demand tokens per house instead of 1 |

**"First billboard" milestone:** All campaigns placed by that player become **permanent** (they never lose tokens and never end). The marketeer card remains busy for the rest of the game.

### Phase 7: Cleanup (Simultaneous)

1. **Discard food and drinks:** All players who do NOT have the "First to throw away food/drink" milestone must discard all food and drink tokens they still own.
   - Players WITH the milestone can store up to **10 tokens** on their milestone card as a "freezer."

2. **Return cards:** All cards from the company structure and beach are taken back into the player's hand.

3. **Flip restaurants:** All restaurants showing "COMING SOON" are flipped to "WELCOME" (now operational).

4. **Lock milestones:** If any milestones were awarded this turn, all remaining copies of that milestone type are flipped face down and become **permanently unavailable**.

5. Demand tokens on the board remain.

---

## 4. ALL EMPLOYEE CARDS AND ABILITIES

### Entry-Level Employees (Hireable, No Salary)

| Card | Action | Notes |
|------|--------|-------|
| **Kitchen Trainee** | Produce 1 burger OR 1 pizza | Choose which |
| **Errand Boy** | Take 1 drink (beer, lemonade, or soda) of your choice | From general supply |
| **Marketing Trainee** | Place a **billboard** campaign; range 2; max duration 2 turns | |
| **Management Trainee** | Black card (manager); **2 subordinate slots** | Gateway to many career paths |
| **Recruiting Girl** | Recruit **1** entry-level employee | |
| **Trainer** | **1** training action (advance 1 employee 1 step) | |
| **Waitress** | Earns $3 at end of dinnertime ($5 with milestone); serves as tiebreaker | Mandatory action |

### Kitchen Staff (trained from Kitchen Trainee)

| Card | Action | Salary | Notes |
|------|--------|--------|-------|
| **Burger Cook** | Produce **3** burgers | $5 | |
| **Pizza Cook** | Produce **3** pizzas | $5 | |
| **Burger Chef** | Produce **8** burgers | $5 | Top position (1 per player) |
| **Pizza Chef** | Produce **8** pizzas | $5 | Top position (1 per player) |

**Training path:** Kitchen Trainee -> Burger Cook OR Pizza Cook -> Burger Chef OR Pizza Chef

### Buyers / Beverage Staff (trained from Errand Boy)

| Card | Range | Drinks per Symbol | Salary | Notes |
|------|-------|-------------------|--------|-------|
| **Errand Boy** | N/A | 1 (of choice) | Free | Entry-level |
| **Cart Operator** | 2 (by road) | 2 per drink symbol passed | $5 | |
| **Truck Driver** | 3 (by road) | 3 per drink symbol passed | $5 | |
| **Zeppelin Pilot** | 4 (ignores roads) | 2 per drink symbol passed | $5 | Top position (1 per player) |

- Range is counted from a restaurant entrance (crossing tile borders).
- Cart Operator/Truck Driver follow roads; Zeppelin Pilot flies (ignores roads).
- Drinks collected include those on the restaurant's own tile.
- A route cannot collect from the same drink symbol twice even if passing through a roundabout multiple times.

**Training path:** Errand Boy -> Cart Operator -> Truck Driver -> Zeppelin Pilot

### Marketing Staff (trained from Marketing Trainee)

| Card | Campaign Types | Range | Max Duration | Salary |
|------|---------------|-------|-------------|--------|
| **Marketing Trainee** | Billboard only | 2 | 2 turns | Free |
| **Campaign Manager** | Billboard, Mailbox | 3 | 3 turns | $5 |
| **Brand Manager** | Billboard, Mailbox, Airplane | Unlimited | 4 turns | $5 |
| **Brand Director** | Billboard, Mailbox, Airplane, Radio | Unlimited | 4 turns | $5; Top position |

- When placing a campaign, choose duration (1 to max). Place that many food/drink tokens on the campaign to indicate what is advertised and for how long.
- The marketeer becomes "busy" with a numbered chip and cannot be trained or fired while busy.

**Training path:** Marketing Trainee -> Campaign Manager -> Brand Manager -> Brand Director

### Recruitment Staff (trained from Recruiting Girl)

| Card | Recruits Per Turn | Salary | Notes |
|------|------------------|--------|-------|
| **Recruiting Girl** | 1 | Free | Entry-level |
| **Recruiting Manager** | 2 | $5 | Unused actions give -$5 salary discount each |
| **HR Director** | 4 | $5 | Unused actions give -$5 salary discount each; Top position |

**Training path:** Recruiting Girl -> Recruiting Manager -> HR Director

### Training Staff (trained from Trainer)

| Card | Training Actions | Salary | Notes |
|------|-----------------|--------|-------|
| **Trainer** | 1 | Free | Entry-level |
| **Coach** | 2 (or 2 steps on 1 person) | $5 | |
| **Guru** | 3 (or 3 steps on 1 person) | $5 | Top position (1 per player) |

**Training path:** Trainer -> Coach -> Guru

### Management / Vice Presidents (trained from Management Trainee)

| Card | Subordinate Slots | Salary | Notes |
|------|-------------------|--------|-------|
| **Management Trainee** | 2 | Free | Entry-level; black card (manager) |
| **Junior Vice President** | 3 | $5 | Black card (manager) |
| **Senior Vice President** | 5 | $5 | Black card (manager) |
| **Executive Vice President** | 10 | $5 | Black card (manager); Top position |

**Training path:** Management Trainee -> Junior Vice President -> Senior Vice President -> Executive Vice President

**Note:** The Coach and Guru can also be reached from Junior Vice President (JVP -> Coach -> Guru).

### Pricing / Special Managers (trained from Management Trainee)

| Card | Ability | Salary | Notes |
|------|---------|--------|-------|
| **Pricing Manager** | Reduces unit price by **$1** | $5 | Mandatory; dead-end career |
| **Discount Manager** | Reduces unit price by **$3** | $5 | Mandatory; dead-end career |
| **Luxuries Manager** | Increases unit price by **$10** | $5 | Mandatory; dead-end career |
| **CFO** | Grants **+50%** bonus on all earnings (rounded up) | $5 | Top position; mandatory |

**Training paths from Management Trainee:**
- Management Trainee -> Pricing Manager (dead end)
- Management Trainee -> Discount Manager (dead end)
- Management Trainee -> Luxuries Manager (dead end)
- Management Trainee -> CFO (dead end; top position)

### Business Development (trained from Management Trainee)

| Card | Ability | Salary | Notes |
|------|---------|--------|-------|
| **New Business Developer** | Place a new house OR add a garden to an existing house | $5 | Dead-end career |

**Training path:** Management Trainee -> New Business Developer

### Restaurant Management (trained from Management Trainee)

| Card | Ability | Range | Salary | Notes |
|------|---------|-------|--------|-------|
| **Local Manager** | Place a new restaurant within range; grants **drive-in** to all restaurants | 3 (by road from existing restaurant) | $5 | New restaurant opens as "COMING SOON" |
| **Regional Manager** | Place a restaurant **anywhere** (entrance must touch road); grants **drive-in** | Unlimited | $5 | Restaurant opens immediately; Top position |

- **Drive-in:** While a Local or Regional Manager is in the structure, ALL of that player's restaurants are considered to have entrances at every corner (not just the marked entrance). This affects distance calculations for sales and marketing range.

**Training path:** Management Trainee -> Local Manager -> Regional Manager

### The CEO

| Card | Ability | Salary |
|------|---------|--------|
| **CEO** | Recruit **1** entry-level employee per turn; always active | Free |

- Starts with **3 subordinate slots** (may change to 2 or 4 when reserve cards are opened).
- The "First to have $100" milestone gives the CEO the CFO ability (+50% earnings bonus).

---

## 5. ORGANIZATIONAL CHART / COMPANY STRUCTURE

The company structure is a pyramid:

```
         [CEO]          (3 slots by default; 2-4 after reserve cards open)
        /  |  \
  [Slot] [Slot] [Slot]   (Each slot holds 1 manager OR 1 normal employee)
```

If a slot holds a **manager** (black card), that manager has its own subordinate slots:

```
         [CEO]
        /  |  \
   [Mgr]  [X]  [X]
   / | \
 [s][s][s]               (Manager subordinates -- normal employees only)
```

**Key rules:**
- Only the CEO can manage managers. Managers cannot manage other managers.
- Normal employees can report to the CEO directly or to a manager.
- You cannot have two managers with the same title in the structure simultaneously.
- Cards not in the structure go to the beach (still cost salary if applicable).
- All cards return to hand at the end of each round (Phase 7).

---

## 6. RESTAURANT PLACEMENT AND HOUSES

### Restaurants
- Each restaurant is a **2x2 square** tile. One corner is the entrance (marked with doors).
- Must be placed on empty squares with the entrance adjacent to a road.
- Initial placement restriction: No two entrances on the same tile (this restriction is removed after setup).
- Each player has **3 restaurants** total.
- New restaurants placed by a **Local Manager** open as "COMING SOON" and flip to "WELCOME" at the end of the round (Phase 7). "COMING SOON" restaurants cannot serve customers.
- New restaurants placed by a **Regional Manager** open immediately as "WELCOME."
- **Drive-in:** When a Local or Regional Manager is active in the structure, all restaurants have entrances at every corner.

### Houses
- Houses are either **pre-printed** on map tiles or placed by a **New Business Developer**.
- Each house is numbered (determines processing order during Dinnertime).
- Pre-printed houses occupy space on the map and may have roads connecting them.
- **New houses** placed by a New Business Developer:
  - May be placed in any empty area, provided they connect to at least one road.
  - No range limitation.
  - Automatically come with a garden (and cannot get another one).
- **Gardens** added by a New Business Developer:
  - Must connect to an existing pre-printed house over 2 squares, forming a 2x3 rectangle.
  - Can only be placed on empty squares.
  - Each house may have at most one garden.

### Garden Effects
- Houses with gardens can hold up to **5 demand tokens** (instead of 3).
- When selling to a house with a garden, the **unit price is doubled** (but bonuses are not).

---

## 7. FOOD PRODUCTION

### Food Types
- **Burgers** (produced by Kitchen Trainee, Burger Cook, Burger Chef)
- **Pizza** (produced by Kitchen Trainee, Pizza Cook, Pizza Chef)

### Production Amounts
| Employee | Burgers | Pizzas |
|----------|---------|--------|
| Kitchen Trainee | 1 | 1 (choose one) |
| Burger Cook | 3 | -- |
| Pizza Cook | -- | 3 |
| Burger Chef | 8 | -- |
| Pizza Chef | -- | 8 |

- Produced food is represented by wooden tokens.
- Food not sold during Dinnertime is **discarded** at end of round (Phase 7) unless the player has the "First to throw away food" milestone (can store up to 10 tokens).
- Food is shared across all of a player's restaurants -- it does not need to be assigned to a specific restaurant.

---

## 8. DRINK ACQUISITION

### Drink Types
- **Beer**
- **Lemonade**
- **Soda (Soft Drink)**

### Drink Sources
- Drink symbols (bottling plants) are printed on map tiles.
- The **Errand Boy** simply takes 1 drink of any type from the general supply (no route needed).
- **Cart Operator, Truck Driver, Zeppelin Pilot** trace a route from a restaurant entrance:
  - They collect drinks for each drink symbol they pass along their route.
  - The type of drink matches the symbol on the map.

### Collection Details

| Employee | Range | Drinks per Symbol | Route Type |
|----------|-------|-------------------|------------|
| Errand Boy | N/A | 1 (any type, from supply) | None |
| Cart Operator | 2 | 2 | By road |
| Truck Driver | 3 | 3 | By road |
| Zeppelin Pilot | 4 | 2 | Ignores roads (flies) |

- Range = number of tile borders crossed. The starting tile counts as part of the route.
- A drink symbol can only be collected once per route, even if the route loops.
- Drinks, like food, are discarded at end of round unless stored with the freezer milestone.

---

## 9. MARKETING AND DEMAND GENERATION

### Placing Campaigns
- During Phase 3, each active marketeer places one campaign.
- Choose the campaign type (based on marketeer level), the product to advertise, the location, and the duration (1 to the card's maximum).
- Place the campaign tile on the map. Place food/drink tokens equal to the chosen duration on the campaign tile to show what is advertised and for how long.
- The marketeer becomes "busy" and receives a numbered chip. Busy marketeers cannot be trained or fired.
- Range for placement is measured by road from one of your restaurant entrances (except airplanes, which go on the board edge).

### Campaign Execution (Phase 6)
- Campaigns run in the order of their numbered chips.
- Each campaign places **1 demand token** (matching the advertised product) on each house within its reach.
  - Exception: Radio with the milestone places **2** tokens per house.
- Maximum demand per house: **3 tokens** (or **5** with a garden).
- After placing demand, remove 1 advertising token from the campaign. When the last token is removed, the campaign ends.

### Campaign Reach Summary

| Type | Placement | Reach |
|------|-----------|-------|
| **Billboard** | On an empty square, one edge touching the road the marketeer traveled | All houses orthogonally adjacent (not diagonal) |
| **Mailbox** | Within range, on a square within a block | All houses in the same block (area enclosed by roads/board edges) |
| **Airplane** | On the edge of the board | All houses in 1, 3, or 5 row/column flyover zone |
| **Radio** | Within range | All houses on the same tile AND all 8 surrounding tiles |

---

## 10. SUPPLY, DEMAND, AND PRICING MECHANISM

### Demand
- Demand tokens are placed on houses by marketing campaigns (Phase 6).
- Each token represents demand for one specific food or drink item.
- Houses can accumulate demand over multiple rounds (max 3 tokens, or 5 with a garden).
- Demand tokens are removed when fulfilled (sold to) during Dinnertime.

### Supply
- Players produce food (Phase 3: kitchen staff) and acquire drinks (Phase 3: buyers).
- Food and drinks are pooled across all of a player's restaurants.
- A chain must be able to fulfill the **complete** demand of a house to make a sale.

### Pricing
- **Base unit price: $10 per item.**
- Modified by:
  - Pricing Manager: **-$1** each
  - Discount Manager: **-$3** each
  - Luxuries Manager: **+$10**
  - "First to lower prices" milestone: **-$1** (permanent, cannot be undone)
- The unit price is per item, not per order.

### Competition Resolution
When multiple chains can fulfill a house's complete demand:
1. Each chain calculates: **Unit Price + Distance = Total**
2. Lowest total wins.
3. Tie: Most waitresses wins.
4. Still tied: Earlier turn order wins.

**Important:** The comparison uses the single unit price, NOT (unit price x number of items). Distance is the road distance from the house to the nearest restaurant entrance.

### Revenue Calculation
- **Without garden:** Unit Price x Number of Items + Bonuses
- **With garden:** (2 x Unit Price) x Number of Items + Bonuses
- Bonuses (e.g., "First burger marketed" = +$5 per burger) are NOT doubled by gardens.
- The CFO's +50% applies to all earnings including bonuses and waitress tips.

---

## 11. MILESTONES AND THEIR EFFECTS

Milestones are awarded the instant a player meets the trigger condition. Once a milestone is awarded, ALL remaining copies of that milestone type are permanently removed from the game. Each milestone can only be earned by one player (or one per copy in games with more unique cards).

| # | Milestone | Trigger | Effect |
|---|-----------|---------|--------|
| 1 | **First billboard placed** | Place a billboard campaign | Your marketing campaigns are **permanent** (never lose tokens, never end). The associated marketeers remain busy for the rest of the game. |
| 2 | **First to train someone** | Train any employee one step | **-$15 salary discount** per round for the rest of the game. |
| 3 | **First to hire 3 people in one turn** | Hire 3+ employees in a single turn | Immediately receive **2 Management Trainee** cards on the beach. May train them immediately if training capacity is available. |
| 4 | **First burger marketed** | Place a marketing campaign advertising burgers | Receive **+$5 bonus per burger sold** for the rest of the game. (Does not affect pricing competition; can be boosted by CFO.) |
| 5 | **First pizza marketed** | Place a marketing campaign advertising pizza | Receive **+$5 bonus per pizza sold** for the rest of the game. |
| 6 | **First drink marketed** | Place a marketing campaign advertising any drink | Receive **+$5 bonus per drink sold** for the rest of the game. |
| 7 | **First errand boy played** | Play an Errand Boy in your structure | All your buyers get **+1 drink per source**. (Errand Boy: 2; Cart Operator/Zeppelin: 3; Truck Driver: 4.) |
| 8 | **First burger produced** | Produce a burger | Immediately receive a free **Burger Cook** card (goes to beach; requires salary going forward). |
| 9 | **First pizza produced** | Produce a pizza | Immediately receive a free **Pizza Cook** card (goes to beach; requires salary going forward). |
| 10 | **First to have $20** | Have $20+ cash at any point | You may look at all face-down reserve cards. You may comment (truthfully or not) but cannot show them to others. |
| 11 | **First waitress played** | Play a Waitress in your structure | Waitresses earn **$5** instead of $3 for the rest of the game. |
| 12 | **First to throw away food** | Discard at least 1 food token during Phase 7 cleanup | Milestone card functions as a **freezer**: store up to **10 food/drink tokens** between rounds. |
| 13 | **First to throw away drink** | Discard at least 1 drink token during Phase 7 cleanup | Same freezer effect as above (up to 10 tokens). |
| 14 | **First to lower prices** | Play a Pricing Manager or Discount Manager into your structure | Your unit prices are permanently **-$1** for the rest of the game (even without price managers active). Cannot be undone. |
| 15 | **First cart operator played** | Play a Cart Operator in your structure | All your Cart Operators, Truck Drivers, and Zeppelin Pilots get **+1 range** permanently. Takes effect immediately. |
| 16 | **First airplane campaign** | Place an airplane campaign | You count **+2 open slots** when determining turn order (Phase 2). These phantom slots cannot hold employees. |
| 17 | **First radio campaign** | Place a radio campaign | Your radio campaigns place **2 demand tokens** per house instead of 1. |
| 18 | **First to have $100** | Have $100+ cash at the end of Phase 4 | Your CEO gains the **CFO ability** (+50% earnings bonus). If you already have a CFO card, you must fire the CFO in Phase 5 of this turn. You may not train a new CFO after this. |
| 19 | **First to pay $20+ in salaries** | Pay $20+ in Phase 5 salary | You may combine training actions from **multiple trainers** to train the same employee in a single turn. |

---

## 12. BANK RESERVE AND SALARY MECHANICS

### The Bank
- Starting bank: **$50 x number of players**.
- All player income comes from the bank. All salary payments return to the bank.
- The bank is a **limited resource**. When it empties, the reserve is opened.

### Reserve Cards
- Each player has 3 reserve cards at game start: **$100 (2 CEO slots), $200 (3 CEO slots), $300 (4 CEO slots)**.
- During setup, each player secretly selects one card. The unchosen cards are discarded.
- **First bank break:** Selected reserve cards are revealed. Their monetary values are summed and added to the bank. The most common CEO slot number among revealed cards becomes the new CEO slot count for ALL players (ties go to the higher number).
- **Second bank break:** The game ends immediately after Phase 4.

### Salary
- Each employee with the salary symbol costs **$5 per round** (whether in the structure or on the beach).
- Entry-level employees (marked with the triangle) are **free**.
- **Salary discounts:**
  - Each unused Recruiting Manager action: **-$5**
  - Each unused HR Director action: **-$5**
  - "First to train" milestone: **-$15**
  - Minimum salary payment is **$0** (discounts cannot generate income).
- If you cannot pay salary, the unpaid employee **quits** (returned to supply).
- You may voluntarily **fire** employees before paying (except busy marketeers).

---

## 13. VICTORY CONDITIONS

- The game ends when the bank breaks for the **second time** (runs out of money during Phase 4: Dinnertime).
- The player with the **most cash** wins.
- **Tiebreaker:** The player who was earlier in turn order wins.

---

## 14. ADDITIONAL IMPORTANT RULES

### Distance and Range
- **Distance** (for customer travel) and **range** (for marketing, buyers, restaurant placement) are measured the same way: counting tile borders crossed along roads.
- Range/distance starts from a restaurant entrance. Exiting the restaurant onto its tile already counts as moving.
- The Zeppelin Pilot ignores roads (flies in a straight path, tile by tile).

### Food and Drink Tokens
- Food/drink tokens are **limited** to what is provided in the game box.
- Wooden pieces serve dual purpose: on houses they show demand; on campaigns they show what is advertised and remaining duration.

### Busy Marketeers
- A marketeer with an active campaign is "busy" -- they cannot be trained, fired, or reassigned.
- Exception: With the "First billboard" milestone, campaigns are permanent and marketeers remain permanently busy.

### Introductory Game Variant
For first-time players:
- Do **not** use milestones.
- Do **not** use reserve cards.
- Put **$75 per player** in the bank instead of $50.

### Map Tile Contents
Each 5x5 tile may contain:
- **Roads:** Connect locations; required for distance/range counting.
- **Houses:** Pre-printed, numbered; generate demand when marketed to.
- **Drink symbols:** Bottling plants (beer, lemonade, soda) that supply buyers.
- **Empty spaces:** Available for building restaurants, houses, gardens, or placing campaigns.

### The "Beach"
- Cards on the beach are owned but inactive.
- Beach cards still cost salary if they have the salary symbol.
- Beach cards can be trained (they are the only cards eligible for training).
- At end of round (Phase 7), all cards return to hand.

---

## SOURCES

This summary was compiled from multiple sources:
- Official Splotter Rules PDF: https://www.qugs.org/rules/r175914.pdf
- UltraBoardGames Rules: https://www.ultraboardgames.com/food-chain-magnate/game-rules.php
- UltraBoardGames Milestones: https://www.ultraboardgames.com/food-chain-magnate/milestones.php
- Food Chain Magnate Wikia: https://foodchainmagnate.fandom.com/wiki/Category:Employee
- Nights Around a Table: https://nightsaroundatable.com/2021/05/14/how-to-play-food-chain-magnate/
- BoardGameGeek: https://boardgamegeek.com/boardgame/175914/food-chain-magnate
- BoardGameGeek FAQ: https://boardgamegeek.com/wiki/page/Food_Chain_Magnate_FAQ
- BoardGameHelpers Map Generator: https://boardgamehelpers.com/FoodChainMagnate/
