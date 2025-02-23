const express = require('express');
const pool = require('../modules/pool');

const router = express.Router();

// GET route: '/api/providers'
router.get('/', (req, res) => {
  pool.query(`SELECT * FROM "providers" ORDER BY availability DESC, updated_at DESC;`)
    .then(result => {
      // console.log('Fetch providers from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      // console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

// GET route: '/api/providers/[id]'
router.get('/:id', (req, res) => {
  pool.query(`SELECT * FROM "providers" WHERE manager_id = ${req.params.id};`)
    .then(result => {
      console.log('Fetch admin providers from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      // console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

module.exports = router;