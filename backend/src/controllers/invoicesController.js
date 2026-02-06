const pool = require("../config/db");
const path = require("path");
const { runOCR } = require("../services/ocrService");

/**
 * POST /invoices
 * Create a new invoice
 */
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

/**
 * GET /invoices
 * Fetch all invoices
 */
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

/**
 * POST /invoices/:id/upload
 * Upload invoice PDF/image
 */
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

/**
 * POST /invoices/:id/ocr
 * Run OCR on uploaded invoice and SAVE raw_text
 */
const runInvoiceOCR = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // 1. Fetch invoice
    const invoiceResult = await pool.query(
      "SELECT file_path FROM invoices WHERE id = $1",
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const filePath = invoiceResult.rows[0].file_path;

    if (!filePath) {
      return res.status(400).json({ error: "No file uploaded for this invoice" });
    }

    // 2. Absolute path to file
    const fullPath = path.join(__dirname, "../../", filePath);

    // 3. Run OCR
    const text = await runOCR(fullPath);

    console.log("OCR TEXT LENGTH:", text.length);
    console.log("Saving OCR text for invoice:", invoiceId);

    // 4. SAVE OCR TEXT TO DATABASE (THIS WAS MISSING BEFORE)
    await pool.query(
      "UPDATE invoices SET raw_text = $1 WHERE id = $2",
      [text, invoiceId]
    );

    // 5. Respond
    res.json({
      message: "OCR completed and saved",
      invoiceId,
      raw_text: text,
    });
  } catch (err) {
    console.error("OCR error:", err.message);
    res.status(500).json({ error: "OCR failed" });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  uploadInvoiceFile,
  runInvoiceOCR,
};
