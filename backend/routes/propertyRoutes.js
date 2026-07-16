const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/', (req, res) => {
        const query = 'SELECT * FROM tblproperty ORDER BY propertyID DESC';
        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Cant get Properties' });
            }
            res.json(results);
        });
    });

      router.get('/unique-locations', (req, res) => {
        const query = "SELECT DISTINCT locationId FROM tblproperty WHERE locationId IS NOT NULL AND locationId != '' ORDER BY locationId ASC";
        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Cant get Unique Locations' });
            }
            const locationIds = results.map(row => row.locationId);
            res.json(locationIds);
        });
    });
    
    router.post('/add', (req, res) => {
        const { PropertyName, sqft, locationId, leased, proposedProperty, chartColor } = req.body;
        const query = 'INSERT INTO tblproperty (PropertyName, sqft, locationId, leased, proposedProperty, chartColor) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(query, [PropertyName, sqft, locationId, leased || 'No', proposedProperty, chartColor], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Cant register Property' });
            }
            res.json({ message: 'Property registered successfully! ' });
        });
    });

    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { PropertyName, sqft, locationId, leased, proposedProperty, chartColor } = req.body;
        const query = 'UPDATE tblproperty SET PropertyName = ?, sqft = ?, locationId = ?, leased = ?, proposedProperty = ?, chartColor = ? WHERE propertyID = ?';
        
        db.query(query, [PropertyName, sqft, locationId, leased, proposedProperty, chartColor, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Cant update Property' });
            }
            res.json({ message: 'Property updated successfully! ' });
        });
    });

    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM tblproperty WHERE propertyId = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Cant delete Property' });
            }
            res.json({ message: 'Property deleted successfully!' });
        });
    });

    return router;
};