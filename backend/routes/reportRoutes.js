const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/report', (req, res) => {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Please provide a valid report date!' });
        }

        const query = `
            SELECT 
                IFNULL(a.minimumSTOLevel, 0) AS minLimit,
                IFNULL(c.companyName, 'Not Linked') AS companyName,
                IFNULL(sh.shopName, 'Unknown Shop') AS shopName,
                IFNULL(w.NET_SALES, 0.00) AS saleAmount,
                IFNULL(w.CURRENCY, 'USD') AS currency
            FROM tblweeklysale w
            LEFT JOIN tblshop sh ON CAST(w.shopId AS CHAR) = CAST(sh.shopId AS CHAR)
            LEFT JOIN tblcompany c ON CAST(sh.companyId AS CHAR) = CAST(c.companyId AS CHAR)
            LEFT JOIN tblagreement a ON CAST(w.shopId AS CHAR) = CAST(a.shopId AS CHAR)
            WHERE DATE(w.TRANSACTION_DATE) = ?
            ORDER BY w.dayId DESC`;

        db.query(query, [date], (err, results) => {
            if (err) {
                console.error("SQL Report Error:", err);
                return res.status(500).json({ message: 'Cant fetch sales report data from database' });
            }
            return res.json(results);
        });
    });

    router.get('/report-monthly', (req, res) => {
        const { month } = req.query; 

        if (!month) {
            return res.status(400).json({ message: 'Please provide a valid report month!' });
        }

        const query = `
            SELECT 
                IFNULL(a.minimumSTOLevel, 0) AS minLimit,
                IFNULL(c.companyName, 'Not Linked') AS companyName,
                IFNULL(sh.shopName, 'Unknown Shop') AS shopName,
                SUM(IFNULL(w.NET_SALES, 0.00)) AS saleAmount,
                IFNULL(w.CURRENCY, 'USD') AS currency
            FROM tblweeklysale w
            LEFT JOIN tblshop sh ON CAST(w.shopId AS CHAR) = CAST(sh.shopId AS CHAR)
            LEFT JOIN tblcompany c ON CAST(sh.companyId AS CHAR) = CAST(c.companyId AS CHAR)
            LEFT JOIN tblagreement a ON CAST(w.shopId AS CHAR) = CAST(a.shopId AS CHAR)
            WHERE DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m') = ?
            GROUP BY w.shopId, c.companyName, sh.shopName, w.CURRENCY 
            ORDER BY saleAmount DESC`;

        db.query(query, [month], (err, results) => {
            if (err) {
                console.error("SQL Monthly Report Error:", err);
                return res.status(500).json({ message: 'Cant fetch monthly sales report data' });
            }
            return res.json(results);
        });
    });

    //Fetch Month Summary for a SPECIFIC selected Shop AND SPECIFIC Month
    router.get('/report-shop-monthly-summary', (req, res) => {
        const { shopId, month } = req.query;

        if (!shopId || !month) {
            return res.status(400).json({ message: 'Please provide both a valid Shop ID and Target Month!' });
        }

        const query = `
            SELECT 
                DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m') AS reportMonth,
                IFNULL(a.agreementId, 'N/A') AS agreementId,
                IFNULL(c.companyName, 'Not Linked') AS companyName,
                IFNULL(sh.shopName, 'Unknown Shop') AS shopName,
                DATE_FORMAT(MAX(w.TRANSACTION_DATE), '%Y-%m-%d') AS lastDate,
                (
                    SELECT w2.INVOICE_NUMBER 
                    FROM tblweeklysale w2 
                    WHERE w2.shopId = w.shopId 
                      AND DATE_FORMAT(w2.TRANSACTION_DATE, '%Y-%m') = DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m')
                    ORDER BY w2.dayId DESC LIMIT 1
                ) AS lastInvoiceNo,
                SUM(IFNULL(w.NET_SALES, 0.00)) AS saleAmount
            FROM tblweeklysale w
            LEFT JOIN tblshop sh ON CAST(w.shopId AS CHAR) = CAST(sh.shopId AS CHAR)
            LEFT JOIN tblcompany c ON CAST(sh.companyId AS CHAR) = CAST(c.companyId AS CHAR)
            LEFT JOIN tblagreement a ON CAST(w.shopId AS CHAR) = CAST(a.shopId AS CHAR)
            WHERE w.shopId = ? AND DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m') = ?
            GROUP BY DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m'), w.shopId, a.agreementId, c.companyName, sh.shopName`;

        db.query(query, [shopId, month], (err, results) => {
            if (err) {
                console.error("SQL Shopwise Summary Error:", err);
                return res.status(500).json({ message: 'Error fetching shop monthly summary' });
            }
            return res.json(results);
        });
    });

    router.get('/report-monthly-invoice-count', (req, res) => {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ message: 'Please provide a valid report month!' });
        }

        const query = `
            SELECT 
                w.shopId,
                IFNULL(sh.shopName, 'Unknown Shop') AS shopName,
                DATE_FORMAT(w.TRANSACTION_DATE, '%Y') AS reportYear,
                DATE_FORMAT(w.TRANSACTION_DATE, '%c') AS reportMonth,
                COUNT(w.INVOICE_NUMBER) AS invoiceCount,
                SUM(IFNULL(w.NET_SALES, 0.00)) AS saleAmount,
                IFNULL(w.CURRENCY, 'USD') AS currency,
                IFNULL(a.minimumSTOLevel, 0) AS minLimit,
                IFNULL(c.companyName, 'Not Linked') AS companyName
            FROM tblweeklysale w
            LEFT JOIN tblshop sh ON CAST(w.shopId AS CHAR) = CAST(sh.shopId AS CHAR)
            LEFT JOIN tblcompany c ON CAST(sh.companyId AS CHAR) = CAST(c.companyId AS CHAR)
            LEFT JOIN tblagreement a ON CAST(w.shopId AS CHAR) = CAST(a.shopId AS CHAR)
            WHERE DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m') = ?
            GROUP BY w.shopId, DATE_FORMAT(w.TRANSACTION_DATE, '%Y-%m'), sh.shopName, w.CURRENCY, c.companyName, a.minimumSTOLevel
            ORDER BY w.shopId ASC`;

        db.query(query, [month], (err, results) => {
            if (err) {
                console.error("SQL Monthly Invoice Count Report Error:", err);
                return res.status(500).json({ message: 'Cant fetch monthly sales and invoice count data' });
            }
            return res.json(results);
        });
    });
    return router;
};