const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.static(__dirname)); // Serve static files

// Database path
const dbPath = path.join(__dirname, 'db.json');

// Helper function to read the database
const readDb = async () => {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        const db = JSON.parse(data);
        // Ensure all expected arrays exist
        if (!db.quotations) db.quotations = [];
        if (!db.clients) db.clients = [];
        if (!db.invoices) db.invoices = [];
        if (!db.reports) db.reports = [];
        return db;
    } catch (error) {
        console.error("Error reading database:", error);
        // If the file doesn't exist or is corrupted, return an empty structure
        return { quotations: [], clients: [], invoices: [], reports: [] };
    }
};

// Helper function to write to the database
const writeDb = async (db) => {
    try {
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to database:", error);
        throw error; // Re-throw to handle it in the caller
    }
};

// --- API Endpoints ---

// GET all quotations
app.get('/api/quotations', async (req, res) => {
    const db = await readDb();
    res.json(db.quotations);
});

// POST a new quotation
app.post('/api/quotations', async (req, res) => {
    const db = await readDb();
    const newQuotation = req.body;

    // Basic validation
    if (!newQuotation || !newQuotation.clientName || !newQuotation.totalValue) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate a new ID (simple approach)
    const newId = `Q-${String(db.quotations.length + 1).padStart(3, '0')}`;
    newQuotation.id = newId;
    newQuotation.version = 1;
    newQuotation.status = 'Pending'; // Default status

    db.quotations.push(newQuotation);
    await writeDb(db);

    res.status(201).json(newQuotation);
});

// DELETE a quotation
app.delete('/api/quotations/:id', async (req, res) => {
    const db = await readDb();
    const { id } = req.params;

    const initialLength = db.quotations.length;
    db.quotations = db.quotations.filter(q => q.id !== id);

    if (db.quotations.length === initialLength) {
        return res.status(404).json({ message: 'Quotation not found' });
    }

    await writeDb(db);
    res.status(204).send(); // No Content
});

// GET all clients
app.get('/api/clients', async (req, res) => {
    const db = await readDb();
    res.json(db.clients);
});

// DELETE a client
app.delete('/api/clients/:id', async (req, res) => {
    const db = await readDb();
    const { id } = req.params;
    const clientId = parseInt(id, 10);

    const initialLength = db.clients.length;
    db.clients = db.clients.filter(c => c.id !== clientId);

    if (db.clients.length === initialLength) {
        return res.status(404).json({ message: 'Client not found' });
    }

    await writeDb(db);
    res.status(204).send(); // No Content
});

// GET all invoices
app.get('/api/invoices', async (req, res) => {
    const db = await readDb();
    res.json(db.invoices);
});

// DELETE an invoice
app.delete('/api/invoices/:id', async (req, res) => {
    const db = await readDb();
    const { id } = req.params;

    const initialLength = db.invoices.length;
    db.invoices = db.invoices.filter(i => i.id !== id);

    if (db.invoices.length === initialLength) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    await writeDb(db);
    res.status(204).send(); // No Content
});

// GET all saved reports
app.get('/api/reports', async (req, res) => {
    const db = await readDb();
    res.json(db.reports);
});

// POST a new saved report
app.post('/api/reports', async (req, res) => {
    try {
        const db = await readDb();
        const newReport = req.body;

        // Basic validation
        if (!newReport || !newReport.name || !newReport.dataSource || !newReport.reportType) {
            return res.status(400).json({ message: 'Missing required report configuration fields' });
        }

        // Generate a new ID
        newReport.id = `REP-${Date.now()}`;
        newReport.lastGenerated = new Date().toISOString().split('T')[0]; // Set current date

        db.reports.push(newReport);
        await writeDb(db);

        res.status(201).json(newReport);
    } catch (error) {
        console.error("Error in POST /api/reports:", error);
        res.status(500).json({ message: 'Internal Server Error while saving the report.' });
    }
});

// DELETE a saved report
app.delete('/api/reports/:id', async (req, res) => {
    try {
        const db = await readDb();
        const { id } = req.params;

        const initialLength = db.reports.length;
        db.reports = db.reports.filter(r => r.id !== id);

        if (db.reports.length === initialLength) {
            return res.status(404).json({ message: 'Report not found' });
        }

        await writeDb(db);
        res.status(204).send(); // No Content
    } catch (error) {
        console.error("Error in DELETE /api/reports:", error);
        res.status(500).json({ message: 'Internal Server Error while deleting the report.' });
    }
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API endpoints are available at /api/...');
    console.log('Serving static files from the root directory.');
});
