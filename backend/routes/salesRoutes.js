const express = require('express');
const router = express.Router();

module.exports = (db) => {

    //Fetch All Shops from tblshop
    router.get('/shops', (req, res) => {
        const query = 'SELECT shopId, shopName, companyId FROM tblshop ORDER BY shopName DESC';
        db.query(query, (err, results) => {
            if (err) {
                console.error("SQL Get Shops Error:", err);
                return res.status(500).json({ message: 'Cant get Shops data' });
            }
            res.json(results);
        });
    });

    //Fetch All Companies from tblcompany
    router.get('/companies', (req, res) => {
        const query = 'SELECT companyId, companyName FROM tblcompany ORDER BY companyName ASC';
        db.query(query, (err, results) => {
            if (err) {
                console.error("SQL Get Companies Error:", err);
                return res.status(500).json({ message: 'Cant get Companies data' });
            }
            res.json(results);
        });
    });

    // Fetch Locations from tbllocation
    router.get('/locations', (req, res) => {
        const query = 'SELECT locationId, locationName FROM tbllocation ORDER BY locationName ASC';
        db.query(query, (err, results) => {
            if (err) {
                console.error("SQL Get Locations Error:", err);
                return res.status(500).json({ message: 'Cant get Locations data' });
            }
            res.json(results);
        });
    });

    //Fetch Recent Transactions
    router.get('/recent', (req, res) => {
        const query = `
            SELECT 
                w.dayId, w.shopId, w.CONCESSIONAR_NAME, w.shopName, w.LOCATION,
                w.INVOICE_NUMBER, 
                DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m-%d') AS TRANSACTION_DATE,
                w.TRANSACTION_TIME, w.PRODUCT_NAME,
                w.PRODUCT_CATEGORY, w.PRODUCT_SUB_CATEGORY, w.BRAND_NAME, w.QUANTITY,
                w.UNIT_PRICE, w.TOTAL_AMOUNT_BEFORE_DISCOUNT, w.DISCOUNT_AMOUNT, w.DISCOUNT_TYPE,
                w.TOTAL_AMOUNT_AFTER_DISCOUNT, w.SALES_TAX_PERCENTAGE, w.SALES_TAX,
                w.NET_SALES, w.MINUS_TAX, w.PAYMENT_METHOD, w.CURRENCY,
                w.ACTUAL_PAYMENT_CURRENCY_TYPE, w.TRANSACTION_TYPE, w.VOID_CANCELATION_TYPE,
                w.FLIGHT, w.FLIGHT_DATE_TIME, w.AIRPORT_ORG, w.AIRPORT_DES,
                w.AIRPORT_DES2, w.AIRPORT_DES3, w.PASSENGER_ID_NAME, w.NATIONALITY,
                w.PASSPORT_ID, w.NATIONAL_ID, w.BIRTHDATE, w.GENDER, w.currentDateTime,
                w.dbn, w.tillNo, w.is_duplicate,
                w.CONCESSIONAR_NAME AS pos_concessionar_name,
                c.companyName AS db_company_name 
            FROM tblweeklysale w
            LEFT JOIN tblshop sh ON CAST(w.shopId AS CHAR) = CAST(sh.shopId AS CHAR)
            LEFT JOIN tblcompany c ON CAST(sh.companyId AS CHAR) = CAST(c.companyId AS CHAR)
            ORDER BY w.dayId DESC LIMIT 50`;
            
        db.query(query, (err, results) => {
            if (err) {
                console.error("SQL Fetch Live Logs Error:", err);
                return res.status(500).json({ message: 'Cant get transactional logs' });
            }
            res.json(results);
        });
    });

    router.post('/add', (req, res) => {
        const transactions = Array.isArray(req.body) ? req.body : [req.body];

        if (transactions.length === 0) {
            return res.status(400).json({ message: 'No transaction data provided!' });
        }

        for (const tx of transactions) {
            if (!tx.shopId || !tx.INVOICE_NUMBER || !tx.NET_SALES) {
                return res.status(400).json({ message: 'Required attributes (shopId, INVOICE_NUMBER, NET_SALES) are missing in one or more records!' });
            }
        }

        let completedCount = 0;
        let errors = [];

        transactions.forEach((tx) => {
            db.query('SELECT shopName FROM tblshop WHERE shopId = ?', [tx.shopId], (shopErr, shopResults) => {
                if (shopErr || shopResults.length === 0) {
                    errors.push(`shopId #${tx.shopId} not found`);
                    checkCompletion();
                    return;
                }

                const matchedShopName = shopResults[0].shopName;

                const insertQuery = `
                    INSERT INTO tblweeklysale (
                        shopId, CONCESSIONAR_NAME, shopName, LOCATION,
                        INVOICE_NUMBER, TRANSACTION_DATE, TRANSACTION_TIME, PRODUCT_NAME,
                        PRODUCT_CATEGORY, PRODUCT_SUB_CATEGORY, BRAND_NAME, QUANTITY,
                        UNIT_PRICE, TOTAL_AMOUNT_BEFORE_DISCOUNT, DISCOUNT_AMOUNT, DISCOUNT_TYPE,
                        TOTAL_AMOUNT_AFTER_DISCOUNT, SALES_TAX_PERCENTAGE, SALES_TAX,
                        NET_SALES, MINUS_TAX, PAYMENT_METHOD, CURRENCY,
                        ACTUAL_PAYMENT_CURRENCY_TYPE, TRANSACTION_TYPE, VOID_CANCELATION_TYPE,
                        FLIGHT, FLIGHT_DATE_TIME, AIRPORT_ORG, AIRPORT_DES,
                        AIRPORT_DES2, AIRPORT_DES3, PASSENGER_ID_NAME, NATIONALITY,
                        PASSPORT_ID, NATIONAL_ID, BIRTHDATE, GENDER, dbn, tillNo, is_duplicate
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                db.query(insertQuery, [
                    tx.shopId, tx.CONCESSIONAR_NAME || 'N/A', matchedShopName, tx.LOCATION || 'N/A',
                    tx.INVOICE_NUMBER, tx.TRANSACTION_DATE || new Date().toLocaleDateString('en-CA'),
                    tx.TRANSACTION_TIME || '00:00:00', tx.PRODUCT_NAME || '-',
                    tx.PRODUCT_CATEGORY || 'General', tx.PRODUCT_SUB_CATEGORY || 'General', tx.BRAND_NAME || '-', tx.QUANTITY || 0.00,
                    tx.UNIT_PRICE || 0.00, tx.TOTAL_AMOUNT_BEFORE_DISCOUNT || 0.00, tx.DISCOUNT_AMOUNT || 0.00, tx.DISCOUNT_TYPE || 'None',
                    tx.TOTAL_AMOUNT_AFTER_DISCOUNT || 0.00, tx.SALES_TAX_PERCENTAGE || 0.00, tx.SALES_TAX || 0.00,
                    tx.NET_SALES, tx.MINUS_TAX || 0.00, tx.PAYMENT_METHOD || 'Cash', tx.CURRENCY || 'USD',
                    tx.ACTUAL_PAYMENT_CURRENCY_TYPE || tx.CURRENCY || 'USD', tx.TRANSACTION_TYPE || 'SAL', tx.VOID_CANCELATION_TYPE || 'NONE',
                    tx.FLIGHT || 'N/A', tx.FLIGHT_DATE_TIME || 'N/A', tx.AIRPORT_ORG || 'N/A', tx.AIRPORT_DES || 'N/A',
                    tx.AIRPORT_DES2 || 'N/A', tx.AIRPORT_DES3 || 'N/A', tx.PASSENGER_ID_NAME || 'N/A', tx.NATIONALITY || 'N/A',
                    tx.PASSPORT_ID || 'N/A', tx.NATIONAL_ID || 'N/A', tx.BIRTHDATE || 'N/A', tx.GENDER || 'N/A', tx.dbn || 'LIVE', tx.tillNo || 'Till-01', tx.is_duplicate || 0
                ], (insertErr, result) => {
                    if (insertErr) {
                        console.error("Database Insert Error:", insertErr);
                        errors.push(`Failed to insert Invoice ${tx.INVOICE_NUMBER}`);
                    }
                    checkCompletion();
                });
            });
        });

        function checkCompletion() {
            completedCount++;
            if (completedCount === transactions.length) {
                if (errors.length > 0 && errors.length === transactions.length) {
                    return res.status(500).json({ message: 'All transactions failed to sync!', errors });
                }
                return res.json({ 
                    message: `Successfully synced ${transactions.length - errors.length} out of ${transactions.length} transactions!`,
                    errors: errors.length > 0 ? errors : undefined
                });
            }
        }
    });

    //Update Action
    router.put('/update/:id', (req, res) => {
        const { id } = req.params;
        const {
            shopId, CONCESSIONAR_NAME, shopName, LOCATION,
            INVOICE_NUMBER, TRANSACTION_DATE, TRANSACTION_TIME, PRODUCT_NAME,
            PRODUCT_CATEGORY, PRODUCT_SUB_CATEGORY, BRAND_NAME, QUANTITY,
            UNIT_PRICE, TOTAL_AMOUNT_BEFORE_DISCOUNT, DISCOUNT_AMOUNT, DISCOUNT_TYPE,
            TOTAL_AMOUNT_AFTER_DISCOUNT, SALES_TAX_PERCENTAGE, SALES_TAX,
            NET_SALES, MINUS_TAX, PAYMENT_METHOD, CURRENCY,
            ACTUAL_PAYMENT_CURRENCY_TYPE, TRANSACTION_TYPE, VOID_CANCELATION_TYPE,
            FLIGHT, FLIGHT_DATE_TIME, AIRPORT_ORG, AIRPORT_DES,
            AIRPORT_DES2, AIRPORT_DES3, PASSENGER_ID_NAME, NATIONALITY,
            PASSPORT_ID, NATIONAL_ID, BIRTHDATE, GENDER, dbn, tillNo, is_duplicate
        } = req.body;

        if (!INVOICE_NUMBER || !NET_SALES) {
            return res.status(400).json({ message: 'Required fields are missing for update!' });
        }

        const query = `
            UPDATE tblweeklysale 
            SET shopId = ?, CONCESSIONAR_NAME = ?, shopName = ?, LOCATION = ?,
                INVOICE_NUMBER = ?, TRANSACTION_DATE = ?, TRANSACTION_TIME = ?, PRODUCT_NAME = ?,
                PRODUCT_CATEGORY = ?, PRODUCT_SUB_CATEGORY = ?, BRAND_NAME = ?, QUANTITY = ?,
                UNIT_PRICE = ?, TOTAL_AMOUNT_BEFORE_DISCOUNT = ?, DISCOUNT_AMOUNT = ?, DISCOUNT_TYPE = ?,
                TOTAL_AMOUNT_AFTER_DISCOUNT = ?, SALES_TAX_PERCENTAGE = ?, SALES_TAX = ?,
                NET_SALES = ?, MINUS_TAX = ?, PAYMENT_METHOD = ?, CURRENCY = ?,
                ACTUAL_PAYMENT_CURRENCY_TYPE = ?, TRANSACTION_TYPE = ?, VOID_CANCELATION_TYPE = ?,
                FLIGHT = ?, FLIGHT_DATE_TIME = ?, AIRPORT_ORG = ?, AIRPORT_DES = ?,
                AIRPORT_DES2 = ?, AIRPORT_DES3 = ?, PASSENGER_ID_NAME = ?, NATIONALITY = ?,
                PASSPORT_ID = ?, NATIONAL_ID = ?, BIRTHDATE = ?, GENDER = ?, dbn = ?, tillNo = ?, is_duplicate = ?
            WHERE dayId = ?`;

        db.query(query, [
            shopId, CONCESSIONAR_NAME, shopName, LOCATION,
            INVOICE_NUMBER, TRANSACTION_DATE, TRANSACTION_TIME, PRODUCT_NAME,
            PRODUCT_CATEGORY, PRODUCT_SUB_CATEGORY, BRAND_NAME, QUANTITY,
            UNIT_PRICE, TOTAL_AMOUNT_BEFORE_DISCOUNT, DISCOUNT_AMOUNT, DISCOUNT_TYPE,
            TOTAL_AMOUNT_AFTER_DISCOUNT, SALES_TAX_PERCENTAGE, SALES_TAX,
            NET_SALES, MINUS_TAX, PAYMENT_METHOD, CURRENCY,
            ACTUAL_PAYMENT_CURRENCY_TYPE, TRANSACTION_TYPE, VOID_CANCELATION_TYPE,
            FLIGHT, FLIGHT_DATE_TIME, AIRPORT_ORG, AIRPORT_DES,
            AIRPORT_DES2, AIRPORT_DES3, PASSENGER_ID_NAME, NATIONALITY,
            PASSPORT_ID, NATIONAL_ID, BIRTHDATE, GENDER, dbn, tillNo, is_duplicate,
            id
        ], (err, result) => {
            if (err) {
                console.error("SQL Update Error:", err);
                return res.status(500).json({ message: 'Cant update transaction log' });
            }
            return res.json({ message: `Transaction Log ID #${id} updated successfully!` });
        });
    });

    //Delete Action
    router.delete('/delete/:id', (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM tblweeklysale WHERE dayId = ?';
        db.query(query, [id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Cant delete log' });
            return res.json({ message: `Transaction ID #${id} deleted!` });
        });
    });

    return router;
};