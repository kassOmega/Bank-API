const { Router } = require("express");

const adminRouter = Router();

adminRouter.post("/register", (req, res) => {
  res.json({ message: "admin registered", data: req.body });
});
adminRouter.post("/login", (req, res) => {
  res.json({ message: "log in successfully" });
});

module.exports = adminRouter;
