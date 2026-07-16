const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/', (req, res) => {
        const query = `
            SELECT s.*, c.companyName 
            FROM tblshop s 
            LEFT JOIN tblcompany c ON s.companyId = c.companyId 
            ORDER BY s.shopId DESC
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'error' });
            }
            res.json(results);
        });
    });

    router.post('/', (req, res) => {
        const { shopName, companyId, contact, email, integrationType, lastDocCount } = req.body;
        const query = 'INSERT INTO tblshop (shopName, companyId, contact, email, integrationType, lastDocCount, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        db.query(query, [shopName, companyId, contact, email, integrationType, lastDocCount, 'Active'], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Shop error' });
            }
            res.json({ message: 'Shop registered successfully! ' });
        });
    });

    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { shopName, companyId, contact, email, integrationType, lastDocCount, Status } = req.body;
        const query = 'UPDATE tblshop SET shopName = ?, companyId = ?, contact = ?, email = ?, integrationType = ?, lastDocCount = ?, Status = ? WHERE shopId = ?';
        
        db.query(query, [shopName, companyId, contact, email, integrationType, lastDocCount, Status, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Update error' });
            }
            res.json({ message: 'Shop updated successfully! ' });
        });
    });

    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM tblshop WHERE shopId = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Delete error' });
            }
            res.json({ message: 'Shop deleted successfully! ' });
        });
    });

    return router;
};