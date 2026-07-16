require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: 'dbdutyfreepos' 
});

db.connect((err) => {
    if(err){
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// User login API route

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM tbllogin WHERE username = ?';
    
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error!' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Username is incorrect!' });
        }

        const user = results[0];

        if (password !== user.password) {
            return res.status(401).json({ message: 'Password is incorrect!' });
        }

        const token = jwt.sign(
            { id: user.shopId, username: user.username, userType: user.userType }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful!', token: token });
    });
});




const companyRoutes = require('./routes/companyRoutes')(db);
app.use('/api/companies', companyRoutes);

const shopRoutes = require('./routes/shopRoutes')(db);
app.use('/api/shops', shopRoutes);

const propertyRoutes = require('./routes/propertyRoutes')(db);
app.use('/api/properties', propertyRoutes);

const agreementRoutes = require('./routes/agreementRoutes')(db);
app.use('/api/agreements', agreementRoutes);

const salesRoutes = require('./routes/salesRoutes')(db);
app.use('/api/sales', salesRoutes);

const reportRoutes = require('./routes/reportRoutes')(db);
app.use('/api/sales', reportRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});