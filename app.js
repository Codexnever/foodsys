const express = require('express');
const mysql = require('mysql2');
const hbs = require('hbs');
const path = require('path');

const a = path.join(__dirname, '../Table/views/partials');
const b = path.join(__dirname, './views');

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydatabase',
});

app.set('view engine', 'hbs');
app.set('views', b);

hbs.registerPartials(a);

app.get('/', (req, res) => {
  let searchTerm = req.query.searchTerm || '';

  // Fetch items from the database
  let query = 'SELECT * FROM MenuItem';

  if (searchTerm) {
    searchTerm = db.escape('%' + searchTerm + '%'); // Escape and add wildcards
    query = `SELECT * FROM MenuItem WHERE name LIKE ${searchTerm}`;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying items:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const items = results;
    res.render('index', { pageTitle: 'Medresto', items, searchTerm });
  });
});
app.get('/second', (req, res) => {
  const items = req.query.items ? JSON.parse(decodeURIComponent(req.query.items)) : [];
  res.render('second', { pageTitle: 'Second Page', selectedItems: items });
});

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
