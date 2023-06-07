const { Router } = require("express");
const { CustomerUser, Account } = require("../database");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middlewares");

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
    expiresIn: "1y",
  });

  res.json({
    message: "customer logged in",
    token: loginToken,
  });
});

customerRouter.get("/profile", authMiddleware, async (req, res) => {
  const customer = await CustomerUser.findByPk(req.user.id);

  if (!customer)
    return res.status(400).json({ message: "user does not exist" });

  const { password, ...saved } = await customer.toJSON();

  res.json({
    message: "customer profile",
    data: saved,
  });
});

customerRouter.post("/account", authMiddleware, async (req, res) => {
  const customer = await CustomerUser.findByPk(req.user.id);

  if (!customer)
    return res.status(400).json({ message: "user does not exist" });

  const account = await Account.build({
    customerId: customer.id,
  }).save();

  res.json({
    message: "account created",
    data: account,
  });
});

customerRouter.get("/accounts", authMiddleware, async (req, res) => {
  const customer = await CustomerUser.findByPk(req.user.id);

  if (!customer)
    return res.status(400).json({ message: "user does not exist" });

  const accounts = await Account.findAll({
    where: { customerId: customer.id },
  });

  res.json({
    message: "customer accounts",
    data: accounts,
  });
});

customerRouter.post("/transfer", authMiddleware, async (req, res) => {
  const customer = await CustomerUser.findByPk(req.user.id);

  if (!customer)
    return res.status(400).json({ message: "user does not exist" });

  const { from: fromAccountNumber, to: toAccountNumber, amount } = req.body;

  if (fromAccountNumber == toAccountNumber)
    return res.status(400).json({ message: "cannot transfer to same account" });

  const [fromAccount, toAccount] = await Promise.all([
    Account.findOne({
      where: { accountNumber: fromAccountNumber, customerId: customer.id },
    }),
    Account.findOne({
      where: { accountNumber: toAccountNumber },
    }),
  ]);

  if (!fromAccount || !toAccount)
    return res.status(400).json({ message: "account does not exist" });

  if (fromAccount.accountBalance < parseFloat(amount))
    return res.status(400).json({ message: "insufficient funds" });

  fromAccount.accountBalance -= parseFloat(amount);
  toAccount.accountBalance =
    parseFloat(toAccount?.accountBalance) + parseFloat(amount);

  // console.log({ toAccount, fromAccount });

  await Promise.all([fromAccount.save(), toAccount.save()]);

  // const transaction = await Transaction.build({
  //   accountNumber: account.accountNumber,
  //   amount: req.body.amount,
  //   type: "debit",
  // }).save();

  res.json({
    message: "transfer successful",
    // data: transaction,
  });
});

module.exports = customerRouter;
