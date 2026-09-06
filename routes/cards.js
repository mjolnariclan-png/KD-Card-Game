const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'CdJpM17!',
    database: 'test_game'
});

// Fetch cards
router.get('/cards', (req, res) => {
    pool.query('SELECT * FROM cards', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Add a new card
router.post('/cards', (req, res) => {
    const newCard = req.body;
    pool.query('INSERT INTO cards SET ?', newCard, (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ id: results.insertId, ...newCard });
    });
});


// Fetch player's hand
router.get('/player-hand', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cards WHERE player_id = ? AND location = "hand"', [req.query.player_id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching player hand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch battlefield
router.get('/battlefield', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cards WHERE location = "battlefield"');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching battlefield:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
