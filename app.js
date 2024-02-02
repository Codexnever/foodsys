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
app.use(express.static('public'));

app.set('view engine', 'hbs');
app.set('views', b);

hbs.registerPartials(a);

app.get('/api/categories', (req, res) => {
  const categoryQuery = 'SELECT * FROM category';

  db.query(categoryQuery, (err, results) => {
    if (err) {
      console.error('Error querying categories:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const categories = results;
   
    res.json({ categories });
  });
});

app.get('/api/items', (req, res) => {
  const { category } = req.query;

  const query = `SELECT * FROM menuitem WHERE LOWER(category) = LOWER('${category}')`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const items = results;
    res.json({ items });
  });
});


///api/subcategories
app.get('/api/subcategories', (req, res) => {
  const qr = "SELECT * FROM subcategory";
  db.query(qr, (err, results) => {
    if (err) {
      console.error('Error querying subcategories:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const subcategories = results;
    // console.log(subcategories);
    // Handle the results as needed
    res.json({ subcategories });
  });
});




app.get('/api/itemss', (req, res) => {
  const { subcategory } = req.query;

  // Check if subcategory is empty
  if (!subcategory) {
    return res.status(400).json({ error: 'Subcategory cannot be empty' });
  }

  const queryy = `SELECT * FROM menuitem WHERE LOWER(subcategory) = LOWER('${subcategory}')`;

  console.log('Executing SQL Query:', queryy);

  db.query(queryy, (err, results) => {
    if (err) {
      console.error('Error querying items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const it = results;
    console.log('Subcategory:', subcategory);
    console.log('Filtered items:', it);

    res.json({ it });
  });
});





//category sepration
app.get('/api/items', (req, res) => {
  const { category } = req.query;

  const query = `SELECT * FROM menuitem WHERE LOWER(category) = LOWER('${category}')`;
  console.log('SQL Query:', query);
  
  

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const items = results;
    res.json({ items });
  });
});

//end

app.get('/', (req, res) => {
  const categoryQuery = 'SELECT * FROM category';
  db.query(categoryQuery, (categoryErr, categoryResults) => {
    if (categoryErr) {
      console.error('Error querying categories:', categoryErr);
      return res.status(500).send('Internal Server Error');
    }

    const categories = categoryResults;

    // Fetch subcategories from the Subcategory table
    const subcategoryQuery = 'SELECT * FROM subcategory';
    db.query(subcategoryQuery, (subcategoryErr, subcategoryResults) => {
      if (subcategoryErr) {
        console.error('Error querying subcategories:', subcategoryErr);
        return res.status(500).send('Internal Server Error');
      }

      const subcategories = subcategoryResults;

      let searchTerm = req.query.searchTerm || '';

      // Fetch items from the database
      let query = 'SELECT * FROM menuitem';

      if (searchTerm) {
        searchTerm = db.escape('%' + searchTerm + '%'); // Escape and add wildcards
        query = `SELECT * FROM menuitem WHERE name LIKE ${searchTerm}`;
      }

      db.query(query, (err, results) => {
        if (err) {
          console.error('Error querying items:', err);
          res.status(500).send('Internal Server Error');
          return;
        }

        const items = results;
        res.render('index', { pageTitle: 'Medresto', items, searchTerm, categories, subcategories });
      });
    });
  });
});


app.get('/second', (req, res) => {
  const items = req.query.items ? JSON.parse(decodeURIComponent(req.query.items)) : [];
  res.render('second', { pageTitle: 'Second Page', selectedItems: items });
});


app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});