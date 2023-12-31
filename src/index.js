require("dotenv").config();
const express = require("express");
require("./database/db");
require("./database");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/customer", require("./routes/customer"));
app.use("/api/admin", require("./routes/admin"));

app.get("/", (req, res) => res.send("healthy!"));

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
