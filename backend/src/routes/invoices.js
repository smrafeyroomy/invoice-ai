const express = require("express");
const router = express.Router();

const upload = require("../config/upload");
const {
  createInvoice,
  getInvoices,
  uploadInvoiceFile,
} = require("../controllers/invoicesController");

router.post("/", createInvoice);
router.get("/", getInvoices);

// Upload invoice file
router.post(
  "/:id/upload",
  upload.single("invoice"),
  uploadInvoiceFile
);

module.exports = router;
