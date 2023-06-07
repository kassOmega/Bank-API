const { Router } = require("express");

const adminRouter = Router();

adminRouter.post("/register", (req, res) => {
  res.json({ message: "admin registered", data: req.body });
});

module.exports = adminRouter;
