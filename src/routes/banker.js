const { Router } = require("express");
const { Banker, Account, CustomerUser } = require("../database");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middlewares");

const bankerRouter = Router();

bankerRouter.post("/register", async (req, res) => {
  const existingBanker = await Banker.findOne({
    where: { phoneNumber: req.body.phoneNumber },
  });

  if (existingBanker)
    return res.status(400).json({ message: "user already exists" });

  const banker = Banker.build({
    fullName: req.body.name,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
  });

  await banker.save();

  const { password, ...saved } = await (await banker.reload()).toJSON();

  res.json({
    message: "banker registered",
    data: saved,
  });
});

bankerRouter.post("/login", async (req, res) => {
  const banker = await Banker.findOne({
    where: { phoneNumber: req.body.phoneNumber },
  });

  if (!banker) return res.status(400).json({ message: "user does not exist" });

  if (banker.password !== req.body.password)
    return res.status(400).json({ message: "invalid credentials" });

  const { password, ...saved } = await banker.toJSON();

  const loginToken = jwt.sign(saved, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });

  res.json({
    message: "banker logged in",
    token: loginToken,
  });
});
customerRouter.get("/customer/profile", authMiddleware, async (req, res) => {
  const customer = await CustomerUser.findByPk(req.user.id);

  if (!customer)
    return res.status(400).json({ message: "user does not exist" });

  const { password, ...saved } = await customer.toJSON();

  res.json({
    message: "customer profile",
    data: saved,
  });
});

module.exports = bankerRouter;
