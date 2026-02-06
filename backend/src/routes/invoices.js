const express = require("express");
const router = express.Router();

const upload = require("../config/upload");
const {
  createInvoice,
  getInvoices,
  uploadInvoiceFile,
  runInvoiceOCR,
} = require("../controllers/invoicesController");

router.post("/", createInvoice);
router.get("/", getInvoices);
router.post("/:id/ocr", runInvoiceOCR);


// Upload invoice file
router.post(
  "/:id/upload",
  upload.single("invoice"),
  uploadInvoiceFile
);

module.exports = router;
