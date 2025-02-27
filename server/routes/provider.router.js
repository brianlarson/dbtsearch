const express = require('express');
const pool = require('../modules/pool');

const router = express.Router();

// GET route for providers with availability: '/api/providers'
router.get('/', (req, res) => {
  pool.query(`SELECT * FROM "providers" WHERE "availability" = true ORDER BY "updated_at" DESC;`)
    .then(result => {
      // console.log('Fetch providers from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      // console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

// GET route for all providers: '/api/providers/all'
router.get('/all', (req, res) => {
  pool.query(`SELECT * FROM "providers" ORDER BY "updated_at" DESC;`)
    .then(result => {
      // console.log('Fetch providers from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      // console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

// GET route for Admin: '/api/providers/[id]'
router.get('/:id', (req, res) => {
  pool.query(`SELECT * FROM "providers" WHERE "manager_id" = ${req.params.id} ORDER BY "name";`)
    .then(result => {
      // console.log('Fetch manager's providers from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      // console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

// GET route for Admin editing: '/api/providers/edit/[id]'
router.get('/edit/:id', (req, res) => {
  pool.query(`SELECT * FROM "providers" WHERE id = ${req.params.id};`)
    .then(result => {
      // console.log('Fetch provider to edit from database…', result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      // console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

// GET route for Admin provider updating: '/api/providers/edit/update/[id]'
router.put('/edit/update/:id', (req, res) => {
  // console.log("req.body", req.body);
  // console.log("req.params.id", req.params.id);
  pool.query(
    `UPDATE "providers" SET "name" = $1, "availability" = $2 WHERE "id" = $3;`,
    [req.body.name, req.body.availability, req.params.id]
  )
    .then(result => {
      console.log('Updated provider in database…', result);
      res.sendStatus(200);
    })
    .catch(err => {
      console.log('Error with GET query:', err);
      res.sendStatus(500);
    });
});

module.exports = router;