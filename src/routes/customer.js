const { Router } = require("express");
const { CustomerUser } = require("../database");
const jwt = require("jsonwebtoken");

const customerRouter = Router();

customerRouter.post("/register", async (req, res) => {
  const existingUser = await CustomerUser.findOne({
    where: { phoneNumber: req.body.phoneNumber },
  });

  if (existingUser)
    return res.status(400).json({ message: "user already exists" });

  const customer = CustomerUser.build({
    fullName: req.body.name,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
  });

  await customer.save();

  const { password, ...saved } = await (await customer.reload()).toJSON();

  res.json({
    message: "customer registered",
    data: saved,
  });
});

customerRouter.post("/login", async (req, res) => {
  const customer = await CustomerUser.findOne({
    where: { phoneNumber: req.body.phoneNumber },
  });

  if (!customer)
    return res.status(400).json({ message: "user does not exist" });

  if (customer.password !== req.body.password)
    return res.status(400).json({ message: "invalid credentials" });

  const { password, ...saved } = await customer.toJSON();

  const loginToken = jwt.sign(saved, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  res.json({
    message: "customer logged in",
    token: loginToken,
  });
});

module.exports = customerRouter;
