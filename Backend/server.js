const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hr_db',
  password: 'Veera@0134',
  port: 5432,
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create appraisals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appraisals (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(7) NOT NULL,
        employee_name VARCHAR(30) NOT NULL,
        position VARCHAR(30) NOT NULL,
        department VARCHAR(50) NOT NULL,
        appraisal_date DATE NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        strengths TEXT NOT NULL,
        improvements TEXT NOT NULL,
        comments TEXT,
        CONSTRAINT unique_employee_date UNIQUE (employee_id, appraisal_date)
      );
    `);

    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(7) NOT NULL,
        employee_name VARCHAR(30) NOT NULL,
        department VARCHAR(50) NOT NULL,
        role VARCHAR(30) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        review_date DATE NOT NULL
      );
    `);

    // Insert initial appraisal data if table is empty
    const { rowCount: appraisalCount } = await pool.query('SELECT * FROM appraisals');
    if (appraisalCount === 0) {
      await pool.query(`
        INSERT INTO appraisals (employee_id, employee_name, position, department, appraisal_date, rating, strengths, improvements, comments)
        VALUES
          ('ATS0123', 'Raghava', 'Junior Developer', 'IT', '2023-05-15', 4, 'Excellent technical skills, strong team player', 'Could improve time estimation for tasks', ''),
          ('ATS0456', 'Ajay', 'Java Developer', 'Software Developer', '2023-06-20', 5, 'Creative campaigns, great leadership', 'Needs to delegate more effectively', ''),
          ('ATS0789', 'Ilyas', 'HR Specialist', 'HR', '2023-07-10', 4, 'Strong interpersonal skills, reliable', 'Could enhance recruitment strategies', ''),
          ('ATS0124', 'Pavan', 'Financial Analyst', 'Finance', '2023-04-05', 3, 'Attention to detail, reliable', 'Should speak up more in meetings', '')
      `);
    }

    // Insert initial review data if table is empty
    const { rowCount: reviewCount } = await pool.query('SELECT * FROM reviews');
    if (reviewCount === 0) {
      await pool.query(`
        INSERT INTO reviews (employee_id, employee_name, department, role, rating, review_text, review_date)
        VALUES
          ('ATS0125', 'Shravan Reddy', 'Developer', 'Senior Software Engineer', 4, 'He has shown excellent problem-solving skills and dedication.', '2023-08-01'),
          ('ATS0789', 'Ilyas Zubair', 'HR', 'HR Manager', 4, 'He is a great team player and handles employee relations effectively.', '2023-08-02'),
          ('ATS0345', 'Srikant Nalla', 'Manager', 'Project Manager', 5, 'He is a strong leader and ensures timely project delivery.', '2023-08-03'),
          ('ATS0678', 'Jay Simha', 'Manager', 'Manager', 5, 'He is a strong leader and ensures timely project delivery.', '2023-08-04')
      `);
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// --- Appraisal Endpoints ---

// Get all appraisals
app.get('/api/appraisals', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM appraisals ORDER BY appraisal_date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appraisal by employee ID
app.get('/api/appraisals/employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM appraisals WHERE employee_id = $1 ORDER BY appraisal_date DESC', [employeeId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new appraisal
app.post('/api/appraisals', async (req, res) => {
  const { employeeId, employeeName, position, department, appraisalDate, rating, strengths, improvements, comments } = req.body;

  try {
    // Check for duplicate appraisal on the same date
    const { rows: existing } = await pool.query(
      'SELECT * FROM appraisals WHERE employee_id = $1 AND appraisal_date = $2',
      [employeeId, appraisalDate]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cannot submit more than one appraisal per day for the same employee' });
    }

    const { rows } = await pool.query(
      `INSERT INTO appraisals (employee_id, employee_name, position, department, appraisal_date, rating, strengths, improvements, comments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [employeeId, employeeName, position, department, appraisalDate, rating, strengths, improvements, comments || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Review Endpoints ---

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews ORDER BY review_date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews by employee ID
app.get('/api/reviews/employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE employee_id = $1 ORDER BY review_date DESC', [employeeId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new review
app.post('/api/reviews', async (req, res) => {
  const { employeeId, employeeName, department, role, rating, reviewText } = req.body;
  const reviewDate = new Date().toISOString().split('T')[0];

  try {
    const { rows } = await pool.query(
      `INSERT INTO reviews (employee_id, employee_name, department, role, rating, review_text, review_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [employeeId, employeeName, department, role, rating, reviewText, reviewDate]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, async () => {
  await initializeDatabase();
  console.log(`Server running on http://localhost:${port}`);
});