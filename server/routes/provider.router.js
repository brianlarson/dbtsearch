const express = require('express');
const pool = require('../modules/pool');

const router = express.Router();

// GET route: '/api/providers'
router.get('/', (_, res) => {
  // Run SQL query statement with pg pool to retrieve providers
  const statement = `SELECT * FROM "providers" ORDER BY "name";`;
  // const statement = `SELECT * FROM "providers" ORDER BY "availability" DESC;`;
  pool.query(statement)
    .then(result => {
      // console.log('Fetch providers from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

module.exports = router;