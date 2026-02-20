// ===== GAME CONSTANTS =====

const PHASES = {
    SETUP_PLACE_RESTAURANT: 'setup_place_restaurant',
    SETUP_RESERVE_CARD: 'setup_reserve_card',
    RESTRUCTURING: 'restructuring',
    ORDER_OF_BUSINESS: 'order_of_business',
    WORKING: 'working',
    DINNERTIME: 'dinnertime',
    PAYDAY: 'payday',
    MARKETING_CAMPAIGNS: 'marketing_campaigns',
    CLEANUP: 'cleanup',
    GAME_OVER: 'game_over'
};

const PHASE_NAMES = {
    [PHASES.SETUP_PLACE_RESTAURANT]: 'Setup: Place Restaurant',
    [PHASES.SETUP_RESERVE_CARD]: 'Setup: Choose Reserve Card',
    [PHASES.RESTRUCTURING]: 'Phase 1: Restructuring',
    [PHASES.ORDER_OF_BUSINESS]: 'Phase 2: Order of Business',
    [PHASES.WORKING]: 'Phase 3: Working 9-5',
    [PHASES.DINNERTIME]: 'Phase 4: Dinnertime',
    [PHASES.PAYDAY]: 'Phase 5: Payday',
    [PHASES.MARKETING_CAMPAIGNS]: 'Phase 6: Marketing Campaigns',
    [PHASES.CLEANUP]: 'Phase 7: Cleanup',
    [PHASES.GAME_OVER]: 'Game Over'
};

const PHASE_DESCRIPTIONS = {
    [PHASES.SETUP_PLACE_RESTAURANT]: 'Place your first restaurant on the board. Choose wisely!',
    [PHASES.SETUP_RESERVE_CARD]: 'Pick a reserve card to set the game length and your CEO slots.',
    [PHASES.RESTRUCTURING]: 'Assign employees to your org chart. Unplayed cards go to the beach.',
    [PHASES.ORDER_OF_BUSINESS]: 'Turn order is set by who played the fewest cards.',
    [PHASES.WORKING]: 'Employees take actions: recruit, produce food, buy drinks, run campaigns.',
    [PHASES.DINNERTIME]: 'Houses are served in numerical order. Cheapest total price wins!',
    [PHASES.PAYDAY]: 'Pay salaries to all your trained employees.',
    [PHASES.MARKETING_CAMPAIGNS]: 'Active campaigns place demand tokens on nearby houses.',
    [PHASES.CLEANUP]: 'Discard unsold food, tick down campaign timers, check bank reserve.',
    [PHASES.GAME_OVER]: 'The bank has run out! Final scores are tallied.'
};

const FOOD_TYPES = {
    BURGER: 'burger',
    PIZZA: 'pizza',
    BEER: 'beer',
    LEMONADE: 'lemonade',
    SODA: 'soda'
};

const FOOD_ICONS = {
    burger: '🍔',
    pizza: '🍕',
    beer: '🍺',
    lemonade: '🍋',
    soda: '🥤'
};

const CAMPAIGN_TYPES = {
    BILLBOARD: 'billboard',
    MAILBOX: 'mailbox',
    AIRPLANE: 'airplane',
    RADIO: 'radio'
};

const PLAYER_COLORS = ['#c41e3a', '#3a6e8c', '#2a7a5a', '#d4940a', '#7b4daa'];
const PLAYER_NAMES = ['Red Corp', 'Blue Inc', 'Green Ltd', 'Gold Co', 'Purple LLC'];

// Employee definitions
const EMPLOYEES = {
    // Kitchen
    kitchen_trainee: {
        id: 'kitchen_trainee', name: 'Kitchen Trainee', type: 'kitchen',
        category: 'kitchen', entryLevel: true, salary: 0,
        action: 'produce', produces: { burger: 1, pizza: 1, choice: true },
        supply: 12, trainsTo: ['burger_cook', 'pizza_cook']
    },
    burger_cook: {
        id: 'burger_cook', name: 'Burger Cook', type: 'kitchen',
        category: 'kitchen', entryLevel: false, salary: 5,
        action: 'produce', produces: { burger: 3 },
        supply: 6, trainsTo: ['burger_chef'], trainsFrom: 'kitchen_trainee'
    },
    pizza_cook: {
        id: 'pizza_cook', name: 'Pizza Cook', type: 'kitchen',
        category: 'kitchen', entryLevel: false, salary: 5,
        action: 'produce', produces: { pizza: 3 },
        supply: 6, trainsTo: ['pizza_chef'], trainsFrom: 'kitchen_trainee'
    },
    burger_chef: {
        id: 'burger_chef', name: 'Burger Chef', type: 'kitchen',
        category: 'kitchen', entryLevel: false, salary: 5,
        action: 'produce', produces: { burger: 8 },
        supply: 3, topPosition: true, trainsFrom: 'burger_cook'
    },
    pizza_chef: {
        id: 'pizza_chef', name: 'Pizza Chef', type: 'kitchen',
        category: 'kitchen', entryLevel: false, salary: 5,
        action: 'produce', produces: { pizza: 8 },
        supply: 3, topPosition: true, trainsFrom: 'pizza_cook'
    },

    // Buyers
    errand_boy: {
        id: 'errand_boy', name: 'Errand Boy', type: 'buyer',
        category: 'buyer', entryLevel: true, salary: 0,
        action: 'buy_drink', drinksPerSymbol: 1, range: 0, anyDrink: true,
        supply: 12, trainsTo: ['cart_operator']
    },
    cart_operator: {
        id: 'cart_operator', name: 'Cart Operator', type: 'buyer',
        category: 'buyer', entryLevel: false, salary: 5,
        action: 'buy_drink', drinksPerSymbol: 2, range: 2, routeType: 'road',
        supply: 6, trainsTo: ['truck_driver'], trainsFrom: 'errand_boy'
    },
    truck_driver: {
        id: 'truck_driver', name: 'Truck Driver', type: 'buyer',
        category: 'buyer', entryLevel: false, salary: 5,
        action: 'buy_drink', drinksPerSymbol: 3, range: 3, routeType: 'road',
        supply: 6, trainsTo: ['zeppelin_pilot'], trainsFrom: 'cart_operator'
    },
    zeppelin_pilot: {
        id: 'zeppelin_pilot', name: 'Zeppelin Pilot', type: 'buyer',
        category: 'buyer', entryLevel: false, salary: 5,
        action: 'buy_drink', drinksPerSymbol: 2, range: 4, routeType: 'fly',
        supply: 3, topPosition: true, trainsFrom: 'truck_driver'
    },

    // Marketing
    marketing_trainee: {
        id: 'marketing_trainee', name: 'Marketing Trainee', type: 'marketing',
        category: 'marketing', entryLevel: true, salary: 0,
        action: 'campaign', campaigns: ['billboard'], range: 2, maxDuration: 2,
        supply: 12, trainsTo: ['campaign_manager']
    },
    campaign_manager: {
        id: 'campaign_manager', name: 'Campaign Manager', type: 'marketing',
        category: 'marketing', entryLevel: false, salary: 5,
        action: 'campaign', campaigns: ['billboard', 'mailbox'], range: 3, maxDuration: 3,
        supply: 6, trainsTo: ['brand_manager'], trainsFrom: 'marketing_trainee'
    },
    brand_manager: {
        id: 'brand_manager', name: 'Brand Manager', type: 'marketing',
        category: 'marketing', entryLevel: false, salary: 5,
        action: 'campaign', campaigns: ['billboard', 'mailbox', 'airplane'], range: 99, maxDuration: 4,
        supply: 6, trainsTo: ['brand_director'], trainsFrom: 'campaign_manager'
    },
    brand_director: {
        id: 'brand_director', name: 'Brand Director', type: 'marketing',
        category: 'marketing', entryLevel: false, salary: 5,
        action: 'campaign', campaigns: ['billboard', 'mailbox', 'airplane', 'radio'], range: 99, maxDuration: 4,
        supply: 3, topPosition: true, trainsFrom: 'brand_manager'
    },

    // Management
    management_trainee: {
        id: 'management_trainee', name: 'Mgmt Trainee', type: 'management',
        category: 'management', entryLevel: true, salary: 0,
        isManager: true, slots: 2,
        supply: 12,
        trainsTo: ['junior_vp', 'pricing_manager', 'discount_manager', 'luxuries_manager',
                   'cfo', 'new_business_dev', 'local_manager']
    },
    junior_vp: {
        id: 'junior_vp', name: 'Junior VP', type: 'management',
        category: 'management', entryLevel: false, salary: 5,
        isManager: true, slots: 3,
        supply: 6, trainsTo: ['senior_vp', 'coach'], trainsFrom: 'management_trainee'
    },
    senior_vp: {
        id: 'senior_vp', name: 'Senior VP', type: 'management',
        category: 'management', entryLevel: false, salary: 5,
        isManager: true, slots: 5,
        supply: 6, trainsTo: ['executive_vp'], trainsFrom: 'junior_vp'
    },
    executive_vp: {
        id: 'executive_vp', name: 'Executive VP', type: 'management',
        category: 'management', entryLevel: false, salary: 5,
        isManager: true, slots: 10,
        supply: 3, topPosition: true, trainsFrom: 'senior_vp'
    },

    // Pricing
    pricing_manager: {
        id: 'pricing_manager', name: 'Pricing Mgr', type: 'pricing',
        category: 'pricing', entryLevel: false, salary: 5,
        action: 'pricing', priceModifier: -1,
        supply: 6, trainsFrom: 'management_trainee'
    },
    discount_manager: {
        id: 'discount_manager', name: 'Discount Mgr', type: 'pricing',
        category: 'pricing', entryLevel: false, salary: 5,
        action: 'pricing', priceModifier: -3,
        supply: 6, trainsFrom: 'management_trainee'
    },
    luxuries_manager: {
        id: 'luxuries_manager', name: 'Luxuries Mgr', type: 'pricing',
        category: 'pricing', entryLevel: false, salary: 5,
        action: 'pricing', priceModifier: 10,
        supply: 6, trainsFrom: 'management_trainee'
    },

    // CFO
    cfo: {
        id: 'cfo', name: 'CFO', type: 'special',
        category: 'special', entryLevel: false, salary: 5,
        action: 'cfo', earningsBonus: 0.5,
        supply: 3, topPosition: true, trainsFrom: 'management_trainee'
    },

    // New Business Developer
    new_business_dev: {
        id: 'new_business_dev', name: 'New Biz Dev', type: 'special',
        category: 'special', entryLevel: false, salary: 5,
        action: 'place_house',
        supply: 6, trainsFrom: 'management_trainee'
    },

    // Local/Regional Manager
    local_manager: {
        id: 'local_manager', name: 'Local Mgr', type: 'special',
        category: 'special', entryLevel: false, salary: 5,
        action: 'place_restaurant', range: 3, driveIn: true,
        supply: 6, trainsTo: ['regional_manager'], trainsFrom: 'management_trainee'
    },
    regional_manager: {
        id: 'regional_manager', name: 'Regional Mgr', type: 'special',
        category: 'special', entryLevel: false, salary: 5,
        action: 'place_restaurant', range: 99, driveIn: true, immediateOpen: true,
        supply: 3, topPosition: true, trainsFrom: 'local_manager'
    },

    // Recruiting
    recruiting_girl: {
        id: 'recruiting_girl', name: 'Recruiting Girl', type: 'recruiting',
        category: 'recruiting', entryLevel: true, salary: 0,
        action: 'recruit', recruits: 1,
        supply: 12, trainsTo: ['recruiting_manager']
    },
    recruiting_manager: {
        id: 'recruiting_manager', name: 'Recruiting Mgr', type: 'recruiting',
        category: 'recruiting', entryLevel: false, salary: 5,
        action: 'recruit', recruits: 2, salaryDiscount: true,
        supply: 6, trainsTo: ['hr_director'], trainsFrom: 'recruiting_girl'
    },
    hr_director: {
        id: 'hr_director', name: 'HR Director', type: 'recruiting',
        category: 'recruiting', entryLevel: false, salary: 5,
        action: 'recruit', recruits: 4, salaryDiscount: true,
        supply: 3, topPosition: true, trainsFrom: 'recruiting_manager'
    },

    // Training
    trainer: {
        id: 'trainer', name: 'Trainer', type: 'training',
        category: 'training', entryLevel: true, salary: 0,
        action: 'train', trainActions: 1,
        supply: 12, trainsTo: ['coach']
    },
    coach: {
        id: 'coach', name: 'Coach', type: 'training',
        category: 'training', entryLevel: false, salary: 5,
        action: 'train', trainActions: 2,
        supply: 6, trainsTo: ['guru'], trainsFrom: 'trainer'
    },
    guru: {
        id: 'guru', name: 'Guru', type: 'training',
        category: 'training', entryLevel: false, salary: 5,
        action: 'train', trainActions: 3,
        supply: 3, topPosition: true, trainsFrom: 'coach'
    },

    // Waitress
    waitress: {
        id: 'waitress', name: 'Waitress', type: 'waitress',
        category: 'waitress', entryLevel: true, salary: 0,
        action: 'waitress', tips: 3,
        supply: 12
    }
};

// Milestones
const MILESTONES = [
    { id: 'first_billboard', name: 'First Billboard', trigger: 'place_billboard',
      effect: 'Your campaigns are permanent (never end).' },
    { id: 'first_train', name: 'First to Train', trigger: 'train_employee',
      effect: '-$15 salary discount per round.' },
    { id: 'first_hire_3', name: 'First to Hire 3', trigger: 'hire_3_in_turn',
      effect: 'Receive 2 free Management Trainees.' },
    { id: 'first_burger_marketed', name: 'First Burger Marketed', trigger: 'market_burger',
      effect: '+$5 per burger sold.' },
    { id: 'first_pizza_marketed', name: 'First Pizza Marketed', trigger: 'market_pizza',
      effect: '+$5 per pizza sold.' },
    { id: 'first_drink_marketed', name: 'First Drink Marketed', trigger: 'market_drink',
      effect: '+$5 per drink sold.' },
    { id: 'first_errand_boy', name: 'First Errand Boy', trigger: 'play_errand_boy',
      effect: '+1 drink per source for all buyers.' },
    { id: 'first_burger_produced', name: 'First Burger Produced', trigger: 'produce_burger',
      effect: 'Free Burger Cook.' },
    { id: 'first_pizza_produced', name: 'First Pizza Produced', trigger: 'produce_pizza',
      effect: 'Free Pizza Cook.' },
    { id: 'first_20_cash', name: 'First to Have $20', trigger: 'have_20',
      effect: 'May view all reserve cards.' },
    { id: 'first_waitress', name: 'First Waitress', trigger: 'play_waitress',
      effect: 'Waitresses earn $5 instead of $3.' },
    { id: 'first_throw_food', name: 'First Throw Food', trigger: 'throw_food',
      effect: 'Freezer: store up to 10 items.' },
    { id: 'first_throw_drink', name: 'First Throw Drink', trigger: 'throw_drink',
      effect: 'Freezer: store up to 10 items.' },
    { id: 'first_lower_prices', name: 'First to Lower Prices', trigger: 'play_pricing',
      effect: 'Permanent -$1 unit price.' },
    { id: 'first_cart_operator', name: 'First Cart Operator', trigger: 'play_cart_operator',
      effect: '+1 range for all advanced buyers.' },
    { id: 'first_airplane', name: 'First Airplane', trigger: 'place_airplane',
      effect: '+2 phantom open slots for turn order.' },
    { id: 'first_radio', name: 'First Radio', trigger: 'place_radio',
      effect: 'Radio places 2 demand tokens per house.' },
    { id: 'first_100_cash', name: 'First to Have $100', trigger: 'have_100',
      effect: 'CEO gains CFO ability (+50%).' },
    { id: 'first_20_salary', name: 'First $20 Salary', trigger: 'pay_20_salary',
      effect: 'May combine trainers on same employee.' }
];

// Map tile configurations for board generation
const TILE_SIZE = 5; // 5x5 grid per tile

// Cell types
const CELL = {
    EMPTY: 0,
    ROAD: 1,
    HOUSE: 2,
    DRINK_BEER: 3,
    DRINK_LEMON: 4,
    DRINK_SODA: 5
};

const GRID_CONFIGS = {
    2: { rows: 3, cols: 3 },
    3: { rows: 4, cols: 4 },
    4: { rows: 4, cols: 5 },
    5: { rows: 5, cols: 4 }
};
