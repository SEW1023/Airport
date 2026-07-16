const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // GET ALL AGREEMENTS
    router.get('/', (req, res) => {
        const query = `
            SELECT 
                a.*, 
                c.companyName, 
                p.PropertyName
            FROM tblagreement a
            LEFT JOIN tblcompany c ON a.companyId = c.companyId
            LEFT JOIN tblproperty p ON a.propertyID = p.propertyID
            ORDER BY a.agreementId DESC`;

        db.query(query, (err, results) => {
            if (err) {
                console.error("SQL Error in Agreements GET:", err); 
                return res.status(500).json({ message: err.sqlMessage || 'Agreements cant get' });
            }
            res.json(results);
        });
    });

    // 2. POST REGISTER AGREEMENT
    router.post('/', (req, res) => {
        const { shopId, companyId, propertyID, startDate, endDate, minimumSTOLevel, confeeRate, BankDepositAmount, agreementStatus, locationId, stoCurrency } = req.body;
        
        const query = `INSERT INTO tblagreement 
            (shopId, companyId, propertyID, startDate, endDate, minimumSTOLevel, confeeRate, BankDepositAmount, agreementStatus, locationId, stoCurrency) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(query, [
            shopId || null, 
            companyId || null, 
            propertyID || null, 
            startDate, 
            endDate, 
            minimumSTOLevel || 0, 
            confeeRate || 0, 
            BankDepositAmount || '0', 
            agreementStatus || 'Active', 
            locationId || null, 
            stoCurrency || 'LKR'
        ], (err, result) => {
            if (err) {
                console.error("SQL Error in Agreements POST:", err);
                return res.status(500).json({ message: err.sqlMessage || 'Database insertion failed!' });
            }
            res.json({ message: 'Agreement registered successfully!' });
        });
    });

    // 3. PUT UPDATE AGREEMENT
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { shopId, companyId, propertyID, startDate, endDate, minimumSTOLevel, confeeRate, BankDepositAmount, agreementStatus, locationId, stoCurrency } = req.body;
        
        const query = `UPDATE tblagreement SET 
            shopId = ?, companyId = ?, propertyID = ?, startDate = ?, endDate = ?, minimumSTOLevel = ?, confeeRate = ?, BankDepositAmount = ?, agreementStatus = ?, locationId = ?, stoCurrency = ? 
            WHERE agreementId = ?`;
        
        db.query(query, [
            shopId || null, 
            companyId || null, 
            propertyID || null, 
            startDate, 
            endDate, 
            minimumSTOLevel || 0, 
            confeeRate || 0, 
            BankDepositAmount || '0', 
            agreementStatus, 
            locationId || null, 
            stoCurrency || 'LKR', 
            id
        ], (err, result) => {
            if (err) {
                console.error("SQL Error in Agreements PUT:", err);
                return res.status(500).json({ message: err.sqlMessage || 'cant update agreement!' });
            }
            res.json({ message: 'Agreement updated successfully!' });
        });
    });

    // 4. DELETE AGREEMENT
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM tblagreement WHERE agreementId = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error("🚨 SQL Error in Agreements DELETE:", err);
                return res.status(500).json({ message: err.sqlMessage || 'cant delete agreement!' });
            }
            res.json({ message: 'Agreement deleted successfully!' });
        });
    });
router.get('/locations-list', (req, res) => {
    const query = `SELECT DISTINCT locationId FROM tblproperty WHERE locationId IS NOT NULL AND locationId != '' ORDER BY locationId ASC`;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching locations' });
        return res.json(results);
    });
});
    return router;
};