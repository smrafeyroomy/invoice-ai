require("./config/db"); // DB connects here

const express = require("express");
const app = express();

app.use(express.json()); 

const invoiceRoutes = require("./routes/invoices");
app.use("/invoices", invoiceRoutes);

app.get("/", (req, res) => {
  res.send("Invoice AI backend is running 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
