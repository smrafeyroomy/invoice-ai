const pool = require("../config/db");

// POST /invoices
const createInvoice = async (req, res) => {
  try {
    const {
      vendor_name,
      invoice_number,
      invoice_date,
      total_amount,
    } = req.body;

    if (!vendor_name || typeof total_amount !== "number") {
      return res.status(400).json({
        error: "vendor_name (string) and total_amount (number) are required",
      });
    }

    if (total_amount <= 0) {
      return res.status(400).json({
        error: "total_amount must be greater than 0",
      });
    }

    const result = await pool.query(
      `INSERT INTO invoices 
       (vendor_name, invoice_number, invoice_date, total_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [vendor_name, invoice_number, invoice_date, total_amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create invoice error:", err.message);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

// POST /invoices/:id/upload
const uploadInvoiceFile = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const result = await pool.query(
      `UPDATE invoices
       SET file_path = $1, file_type = $2
       WHERE id = $3
       RETURNING *`,
      [req.file.path, req.file.mimetype, invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "File upload failed" });
  }
};

// GET /invoices
const getInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invoices ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch invoices error:", err.message);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  uploadInvoiceFile,
};
