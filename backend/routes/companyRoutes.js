const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.post('/', (req, res) => {
        const { companyName, address, contact, email } = req.body;
        const query = 'INSERT INTO tblCompany (companyName, address, contact, email, Status) VALUES (?, ?, ?, ?, ?)';
        
        db.query(query, [companyName, address, contact, email, 'Active'], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error!' });
            res.json({ message: 'Company registered successfully! ' });
        });
    });

    router.get('/', (req, res) => {
        const query = 'SELECT * FROM tblCompany ORDER BY companyID DESC';
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error!' });
            res.json(results);
        });
    });

    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM tblCompany WHERE companyID = ?';
        db.query(query, [id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error!' });
            res.json({ message: 'Company deleted successfully! ' });
        });
    });

    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { companyName, address, contact, email, Status } = req.body;
        const query = 'UPDATE tblCompany SET companyName = ?, address = ?, contact = ?, email = ?, Status = ? WHERE companyID = ?';
        db.query(query, [companyName, address, contact, email, Status, id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error!' });
            res.json({ message: 'Company details updated successfully! ' });
        });
    });

    return router;
};