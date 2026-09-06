const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3005;

// Game state management
let games = {};
let lobbyPlayers = [];

// CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware to parse JSON
app.use(express.json());

// Serve static files from test game directory
app.use(express.static(__dirname));

// Serve card images
app.use('/cards', express.static(path.join(__dirname, '..', 'All Cards', 'Fehu White Deck')));

// Route for main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Join lobby endpoint
app.post('/api/join-lobby', (req, res) => {
    const { playerId, playerName } = req.body;
    
    console.log(`Player ${playerName} (${playerId}) joining lobby`);
    
    // Check if player is already in lobby
    const existingPlayer = lobbyPlayers.find(p => p.id === playerId);
    if (existingPlayer) {
        existingPlayer.name = playerName || existingPlayer.name;
        existingPlayer.lastSeen = Date.now();
    } else {
        lobbyPlayers.push({
            id: playerId,
            name: playerName || 'Waiting Player',
            lastSeen: Date.now()
        });
    }
    
    res.json({
        success: true,
        message: 'Joined lobby successfully'
    });
    
    console.log(`Lobby players: ${lobbyPlayers.length}`);
});

// Get lobby players endpoint
app.get('/api/lobby-players', (req, res) => {
    // Remove players who haven't been seen in 30 seconds
    const now = Date.now();
    lobbyPlayers = lobbyPlayers.filter(p => now - p.lastSeen < 30000);
    
    // Update last seen for requesting player
    const playerId = req.query.playerId;
    if (playerId) {
        const player = lobbyPlayers.find(p => p.id === playerId);
        if (player) {
            player.lastSeen = now;
            
            // Check if this player has been invited to a game
            if (player.gameId) {
                const game = games[player.gameId];
                if (game) {
                    // Find which player index this is
                    const playerIndex = game.players.findIndex(p => p.id === playerId);
                    res.json({
                        success: true,
                        players: lobbyPlayers,
                        gameInvitation: {
                            gameId: game.id,
                            opponentName: game.players[1 - playerIndex].name,
                            playerIndex: playerIndex,
                            goesFirst: playerIndex === game.currentTurn,
                            coinFlipResult: game.coinFlipResult,
                            gameState: game
                        }
                    });
                    return;
                }
            }
        }
    }
    
    res.json({
        success: true,
        players: lobbyPlayers,
        gameInvitation: null
    });
});

// Challenge player endpoint
app.post('/api/challenge-player', (req, res) => {
    const { playerId, opponentId } = req.body;
    
    console.log(`Player ${playerId} challenging ${opponentId}`);
    
    const challenger = lobbyPlayers.find(p => p.id === playerId);
    const opponent = lobbyPlayers.find(p => p.id === opponentId);
    
    if (!challenger || !opponent) {
        return res.json({ success: false, error: 'Player not found in lobby' });
    }
    
    // Create game
    const gameId = `game_${Date.now()}`;
    
    // Coin flip to determine who goes first
    const coinFlip = Math.random() < 0.5;
    const firstPlayerIndex = coinFlip ? 0 : 1;
    
    // Determine which player is which index
    const challengerIndex = challenger.id === playerId ? 0 : 1;
    const opponentIndex = 1 - challengerIndex;
    
    games[gameId] = {
        id: gameId,
        players: [
            { id: challenger.id, name: challenger.name, life: 30, mana: 0, hand: [], battlefield: [], deck: [], isReady: false, vigorUsedThisTurn: 0, totalVigor: 0 },
            { id: opponent.id, name: opponent.name, life: 30, mana: 0, hand: [], battlefield: [], deck: [], isReady: false, vigorUsedThisTurn: 0, totalVigor: 0 }
        ],
        currentTurn: firstPlayerIndex,
        phase: 'vigor',
        lastUpdate: Date.now(),
        coinFlipResult: coinFlip,
        challengerId: playerId,
        opponentId: opponentId
    };
    
    // Generate decks for both players
    generateDeck(games[gameId].players[0]);
    generateDeck(games[gameId].players[1]);
    
    // Mark players as being in this game (so they can be found later)
    challenger.gameId = gameId;
    opponent.gameId = gameId;
    
    // Respond to challenger
    res.json({
        success: true,
        gameId: gameId,
        opponentName: games[gameId].players[opponentIndex].name,
        playerIndex: challengerIndex,
        goesFirst: challengerIndex === firstPlayerIndex,
        coinFlipResult: coinFlip,
        gameState: games[gameId]
    });
    
    console.log(`Game created: ${gameId} between ${challenger.name} and ${opponent.name}`);
    console.log(`Coin flip: ${coinFlip ? 'Heads' : 'Tails'}, ${games[gameId].players[firstPlayerIndex].name} goes first`);
    console.log(`Challenger (${challenger.name}) sent to game. Opponent (${opponent.name}) needs to poll for game.`);
});

// Decline game endpoint
app.post('/api/decline-game', (req, res) => {
    const { gameId, playerId } = req.body;
    
    console.log(`Player ${playerId} declining game ${gameId}`);
    
    const game = games[gameId];
    if (game) {
        // Remove the game
        delete games[gameId];
        
        // Return players to lobby
        const player1 = game.players[0];
        const player2 = game.players[1];
        
        if (player1.id !== playerId) {
            // The challenger is still waiting, return them to lobby
            lobbyPlayers.push({
                id: player1.id,
                name: player1.name,
                lastSeen: Date.now()
            });
        }
        
        if (player2.id !== playerId) {
            // The other player is still waiting, return them to lobby
            lobbyPlayers.push({
                id: player2.id,
                name: player2.name,
                lastSeen: Date.now()
            });
        }
    }
    
    res.json({ success: true });
});

// Regular HTTP routes
app.get('/api/player-hand', (req, res) => {
    res.json([]); // Return empty for now
});

app.get('/api/battlefield', (req, res) => {
    res.json([]); // Return empty for now
});

// Get game state endpoint
app.get('/api/game-state/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const game = games[gameId];
    
    if (game) {
        res.json({
            success: true,
            gameState: game
        });
    } else {
        res.json({
            success: false,
            error: 'Game not found'
        });
    }
});

// Play card endpoint
app.post('/api/play-card', (req, res) => {
    const { gameId, playerId, cardIndex } = req.body;
    const game = games[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        return res.json({ success: false, error: 'Player not found' });
    }
    
    // Check if it's player's turn
    if (game.players[game.currentTurn].id !== playerId) {
        return res.json({ success: false, error: 'Not your turn' });
    }
    
    // Check if in play phase
    if (game.phase !== 'play') {
        return res.json({ success: false, error: 'Can only play cards during Play Phase' });
    }
    
    const card = player.hand[cardIndex];
    
    if (!card) {
        return res.json({ success: false, error: 'Card not found' });
    }
    
    // Calculate available vigor (total vigor - vigor used this turn)
    const totalVigor = player.totalVigor || 0;
    const availableVigor = totalVigor - (player.vigorUsedThisTurn || 0);
    
    console.log(`Player ${player.name} trying to play card: ${card.name}`);
    console.log(`Card cost: ${card.cost}, Total vigor: ${totalVigor}, Available: ${availableVigor}`);
    
    if (card.cost > availableVigor) {
        console.log(`Not enough vigor. Need ${card.cost}, have ${availableVigor}`);
        return res.json({ success: false, error: `Not enough vigor. Need ${card.cost}, have ${availableVigor}` });
    }
    
    // Check creature limit (max 5, primordial doesn't count)
    if (card.type === 'creature') {
        const creatureCount = player.battlefield.filter(c => c.type === 'creature').length;
        if (creatureCount >= 5) {
            return res.json({ success: false, error: 'Maximum 5 creatures allowed on battlefield' });
        }
    }
    
    // Track vigor used this turn
    player.vigorUsedThisTurn = (player.vigorUsedThisTurn || 0) + card.cost;

    player.hand.splice(cardIndex, 1);

    if (card.type === 'creature' || card.type === 'primordial') {
        // Remove summoning sickness - can attack immediately
        card.canAttack = true;
        if (card.type === 'creature') {
            card.hasHaste = false;
        }
        player.battlefield.push(card);
        console.log(`${card.type} played to battlefield`);
    } else if (card.type === 'equipment') {
        // Equipment needs to be attached to a creature - not allowed here
        return res.json({ success: false, error: 'Equipment must be attached using the equipment endpoint' });
    } else if (card.type === 'vigor') {
        // Vigor cards are no longer played - vigor is accumulated automatically
        return res.json({ success: false, error: 'Vigor is accumulated automatically (+1 per turn, max 20)' });
    } else if (card.type === 'rune') {
        // Equipment needs to be attached to a creature
        // Return error if no target specified
        return res.json({ success: false, error: 'Equipment must be attached to a creature' });
    } else if (card.type === 'rune') {
        // Handle spell effect
        const opponent = game.players.find(p => p !== player);
        opponent.life -= Math.floor(Math.random() * 5) + 3;
        console.log(`Rune cast, dealt damage to opponent`);
    }
    
    game.lastUpdate = Date.now();
    res.json({ success: true, gameState: game });
});

// Attack endpoint
app.post('/api/attack', (req, res) => {
    const { gameId, playerId, attackerIndex, targetIndex, targetPlayer } = req.body;
    const game = games[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players.find(p => p.id === playerId);
    const opponent = game.players.find(p => p !== player);
    
    if (!player || !opponent) {
        return res.json({ success: false, error: 'Player not found' });
    }
    
    // Check if it's player's turn
    if (game.players[game.currentTurn].id !== playerId) {
        return res.json({ success: false, error: 'Not your turn' });
    }
    
    // Check if in attack phase
    if (game.phase !== 'attack') {
        return res.json({ success: false, error: 'Can only attack during Attack Phase' });
    }
    
    const attacker = player.battlefield[attackerIndex];
    
    if (!attacker) {
        return res.json({ success: false, error: 'Attacker not found' });
    }
    
    if (attacker.type !== 'creature' && attacker.type !== 'primordial') {
        return res.json({ success: false, error: 'Only creatures and primordials can attack' });
    }
    
    if (!attacker.canAttack && !attacker.hasHaste) {
        return res.json({ success: false, error: 'Unit has summoning sickness' });
    }
    
    // Check attack priority rules
    const opponentPrimordial = opponent.battlefield.find(c => c.type === 'primordial');
    const opponentCreatures = opponent.battlefield.filter(c => c.type === 'creature');
    
    console.log(`Attack attempt by ${player.name}`);
    console.log(`Opponent has primordial: ${!!opponentPrimordial}`);
    console.log(`Opponent has ${opponentCreatures.length} creatures`);
    console.log(`Target type: ${targetPlayer ? 'player' : 'creature'}`);
    
    // Priority: Primordial > Creatures > Player
    if (opponentPrimordial) {
        // Must attack primordial first
        if (targetPlayer) {
            return res.json({ success: false, error: 'Must attack Primordial first' });
        }
        const target = opponent.battlefield[targetIndex];
        if (target.type !== 'primordial') {
            return res.json({ success: false, error: 'Must attack Primordial first' });
        }
    } else if (opponentCreatures.length > 0) {
        // Must attack creatures first
        if (targetPlayer) {
            return res.json({ success: false, error: 'Must attack creatures first' });
        }
        const target = opponent.battlefield[targetIndex];
        if (target.type !== 'creature') {
            return res.json({ success: false, error: 'Must attack creatures first' });
        }
    }
    
    // Execute attack
    if (targetPlayer) {
        // Attack player directly
        opponent.life -= attacker.attack;
        console.log(`Attacked player directly for ${attacker.attack} damage`);
    } else {
        // Attack creature/primordial
        const target = opponent.battlefield[targetIndex];
        if (target) {
            target.defense -= attacker.attack;
            console.log(`Attacked ${target.name} for ${attacker.attack} damage`);
            
            if (target.defense <= 0) {
                opponent.battlefield.splice(targetIndex, 1);
                console.log(`${target.name} destroyed`);
            }
        }
    }
    
    // Attacker takes damage back (combat damage)
    if (!targetPlayer) {
        const target = opponent.battlefield[targetIndex];
        if (target && target.attack) {
            attacker.defense -= target.attack;
            if (attacker.defense <= 0) {
                player.battlefield.splice(attackerIndex, 1);
                console.log(`${attacker.name} destroyed in combat`);
            }
        }
    }
    
    game.lastUpdate = Date.now();
    res.json({ success: true, gameState: game });
});

// End turn endpoint
app.post('/api/end-turn', (req, res) => {
    const { gameId, playerId } = req.body;
    const game = games[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    game.currentTurn = (game.currentTurn + 1) % 2;
    const currentPlayer = game.players[game.currentTurn];
    
    // Start at vigor phase
    game.phase = 'vigor';

    // Reset vigor used this turn
    currentPlayer.vigorUsedThisTurn = 0;

    // Add 1 vigor per turn, max 20
    if ((currentPlayer.totalVigor || 0) < 20) {
        currentPlayer.totalVigor = (currentPlayer.totalVigor || 0) + 1;
    }
    currentPlayer.mana = currentPlayer.totalVigor;

    // Enable creatures and primordials to attack (they've been on battlefield for a full turn)
    currentPlayer.battlefield.forEach(card => {
        if (card.type === 'creature' || card.type === 'primordial') {
            card.canAttack = true;
        }
    });
    
    // Draw card
    if (currentPlayer.deck.length > 0) {
        const card = currentPlayer.deck.pop();
        if (card.type === 'primordial') {
            // Primordials start with canAttack = false (summoning sickness)
            card.canAttack = false;
            currentPlayer.battlefield.push(card);
        } else {
            currentPlayer.hand.push(card);
        }
    }
    
    game.lastUpdate = Date.now();
    res.json({ success: true, gameState: game });
});

// Advance phase endpoint
app.post('/api/advance-phase', (req, res) => {
    const { gameId, playerId } = req.body;
    const game = games[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const phases = ['vigor', 'draw', 'play', 'attack'];
    const currentPhaseIndex = phases.indexOf(game.phase);
    
    if (currentPhaseIndex === -1) {
        return res.json({ success: false, error: 'Invalid phase' });
    }
    
    const currentPlayer = game.players[game.currentTurn];
    
    if (currentPhaseIndex < phases.length - 1) {
        // Advance to next phase
        game.phase = phases[currentPhaseIndex + 1];
        
        // Phase-specific actions
        if (game.phase === 'vigor') {
            // Vigor Phase: Add 1 vigor per turn, max 20
            currentPlayer.vigorUsedThisTurn = 0;
            if ((currentPlayer.totalVigor || 0) < 20) {
                currentPlayer.totalVigor = (currentPlayer.totalVigor || 0) + 1;
            }
            currentPlayer.mana = currentPlayer.totalVigor;
            console.log(`Vigor Phase: ${currentPlayer.name} now has ${currentPlayer.totalVigor} total vigor`);
        } else if (game.phase === 'draw') {
            // Draw Phase: Draw 1 card
            if (currentPlayer.deck.length > 0) {
                const card = currentPlayer.deck.pop();
                if (card.type === 'primordial') {
                    card.canAttack = true; // Can attack immediately
                    currentPlayer.battlefield.push(card);
                } else {
                    currentPlayer.hand.push(card);
                }
            }
        } else if (game.phase === 'play') {
            // Play Phase: Nothing automatic, just allow playing cards
        } else if (game.phase === 'attack') {
            // Attack Phase: Enable creatures/primordials to attack
            currentPlayer.battlefield.forEach(card => {
                if (card.type === 'creature' || card.type === 'primordial') {
                    card.canAttack = true;
                }
            });
        }
    } else {
        // End of phases, end turn
        game.currentTurn = (game.currentTurn + 1) % 2;
        const nextPlayer = game.players[game.currentTurn];
        game.phase = 'vigor';
        
        // Reset vigor used this turn for next player
        nextPlayer.vigorUsedThisTurn = 0;

        // Add 1 vigor per turn, max 20
        if ((nextPlayer.totalVigor || 0) < 20) {
            nextPlayer.totalVigor = (nextPlayer.totalVigor || 0) + 1;
        }
        nextPlayer.mana = nextPlayer.totalVigor;
    }
    
    game.lastUpdate = Date.now();
    res.json({ success: true, gameState: game });
});

// Draw card endpoint
app.post('/api/draw-card', (req, res) => {
    const { gameId, playerId } = req.body;
    const game = games[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        return res.json({ success: false, error: 'Player not found' });
    }
    
    if (player.deck.length > 0 && player.hand.length < 10) {
        const card = player.deck.pop();
        if (card.type === 'primordial') {
            player.battlefield.push(card);
        } else {
            player.hand.push(card);
        }
        
        game.lastUpdate = Date.now();
        res.json({ success: true, gameState: game, drawnCard: card });
    } else {
        game.lastUpdate = Date.now();
        res.json({ success: true, gameState: game, drawnCard: null });
    }
});

// Attach equipment endpoint
app.post('/api/attach-equipment', (req, res) => {
    const { gameId, playerId, equipmentIndex, targetCreatureIndex } = req.body;
    const game = games[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        return res.json({ success: false, error: 'Player not found' });
    }
    
    // Check if it's player's turn
    if (game.players[game.currentTurn].id !== playerId) {
        return res.json({ success: false, error: 'Not your turn' });
    }
    
    // Check if in play phase
    if (game.phase !== 'play') {
        return res.json({ success: false, error: 'Can only attach equipment during Play Phase' });
    }
    
    const equipment = player.hand[equipmentIndex];
    const targetCreature = player.battlefield[targetCreatureIndex];
    
    if (!equipment) {
        return res.json({ success: false, error: 'Equipment not found' });
    }
    
    if (equipment.type !== 'equipment') {
        return res.json({ success: false, error: 'Selected card is not equipment' });
    }
    
    if (!targetCreature) {
        return res.json({ success: false, error: 'Target creature not found' });
    }
    
    if (targetCreature.type !== 'creature' && targetCreature.type !== 'primordial') {
        return res.json({ success: false, error: 'Target must be a creature or primordial' });
    }
    
    // Check if target already has equipment
    if (targetCreature.equipment) {
        return res.json({ success: false, error: 'Target already has equipment' });
    }
    
    // Check if player has enough vigor
    const totalVigor = player.totalVigor || 0;
    const availableVigor = totalVigor - (player.vigorUsedThisTurn || 0);

    if (equipment.cost > availableVigor) {
        return res.json({ success: false, error: `Not enough vigor. Need ${equipment.cost}, have ${availableVigor}` });
    }
    
    // Deduct equipment cost from vigor
    player.vigorUsedThisTurn = (player.vigorUsedThisTurn || 0) + equipment.cost;
    
    // Attach equipment to creature
    targetCreature.equipment = equipment;
    targetCreature.attack += equipment.attack;
    targetCreature.defense += equipment.defense;
    
    // Remove equipment from hand
    player.hand.splice(equipmentIndex, 1);
    
    console.log(`Equipment ${equipment.name} attached to ${targetCreature.name}`);
    console.log(`New stats: Attack ${targetCreature.attack}, Defense ${targetCreature.defense}`);
    
    game.lastUpdate = Date.now();
    res.json({ success: true, gameState: game });
});

// Auto-play vigor endpoint (no longer needed - vigor is accumulated automatically)
app.post('/api/auto-play-vigor', (req, res) => {
    const { gameId, playerId } = req.body;
    const game = games[gameId];

    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        return res.json({ success: false, error: 'Player not found' });
    }

    // Vigor is now accumulated automatically - this endpoint is deprecated
    // Just return current state
    game.lastUpdate = Date.now();
    res.json({ success: true, gameState: game, message: 'Vigor is accumulated automatically (+1 per turn, max 20)' });
});

function generateDeck(player) {
    // Generate 60-card deck (without vigor cards since vigor is accumulated automatically)
    const deck = [];

    // 1 Primordial (cost 5)
    deck.push({ type: 'primordial', name: 'Primordial King', cost: 5, attack: 10, defense: 10, isPrimordial: true, canAttack: false });

    // 32 Creatures (increased to reach 60 cards)
    for (let i = 0; i < 32; i++) {
        const attack = Math.floor(Math.random() * 5) + 1;
        const defense = Math.floor(Math.random() * 5) + 1;
        const cost = 1; // Low cost for testing
        const hasHaste = Math.random() < 0.2; // 20% chance of haste
        deck.push({ type: 'creature', name: `Creature ${i+1}`, cost: cost, attack: attack, defense: defense, hasHaste: hasHaste });
    }

    // 12 Runes (increased to reach 60 cards)
    for (let i = 0; i < 12; i++) {
        const cost = Math.floor(Math.random() * 3) + 1;
        deck.push({ type: 'rune', name: `Rune ${i+1}`, cost: cost, attack: 0, defense: 0 });
    }

    // 15 Equipment (increased to reach 60 cards)
    for (let i = 0; i < 15; i++) {
        const attack = Math.floor(Math.random() * 2);
        const defense = Math.floor(Math.random() * 2);
        const cost = 1;
        deck.push({ type: 'equipment', name: `Equipment ${i+1}`, cost: cost, attack: attack, defense: defense });
    }
    
    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);
    player.deck = deck;
    
    // Draw initial hand (7 cards)
    for (let i = 0; i < 7; i++) {
        const card = player.deck.pop();
        if (card.type === 'primordial') {
            // Primordials start with canAttack = false (summoning sickness)
            card.canAttack = false;
            player.battlefield.push(card);
        } else {
            player.hand.push(card);
        }
    }

    // Initial vigor reset (start with 0 vigor)
    player.totalVigor = 0;
    player.mana = 0;
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Game server is running on http://localhost:${PORT}`);
    console.log(`Main menu: http://localhost:${PORT}/index.html`);
    console.log(`Multiplayer: http://localhost:${PORT}/multiplayer.html`);
    console.log(`For network testing: http://YOUR_LOCAL_IP:${PORT}`);
    console.log(`To find your IP: run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)`);
});