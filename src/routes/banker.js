const { Router } = require("express");
const { Banker, Account, CustomerUser, Admin } = require("../database");
const jwt = require("jsonwebtoken");
const { authMiddleware, roleMiddleWare } = require("./middlewares");
const httpStatus = require("http-status");

const bankerRouter = Router();

bankerRouter.post(
  "/register",
  authMiddleware,
  roleMiddleWare("admin"),
  async (req, res) => {
    const adminUser = await Admin.findByPk(req.user.id);
    if (!adminUser)
      return res.status(400).json({ message: "You can't create a banker" });

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
  }
);

bankerRouter.post("/login", async (req, res) => {
  const banker = await Banker.findOne({
    where: { phoneNumber: req.body.phoneNumber },
  });

  if (!banker) return res.status(400).json({ message: "user does not exist" });

  if (banker.password !== req.body.password)
    return res.status(400).json({ message: "invalid credentials" });

  if (banker.suspended) return res.status(400).json({ message: "suspended" });

  const { password, ...saved } = await banker.toJSON();

  const loginToken = jwt.sign(
    { ...saved, role: "banker" },
    process.env.JWT_SECRET,
    {
      expiresIn: "1y",
    }
  );

  res.json({
    message: "banker logged in",
    token: loginToken,
  });
});

bankerRouter.get(
  "/customer/profile",
  authMiddleware,
  roleMiddleWare("banker"),
  async (req, res) => {
    const { phoneNumber, accountNumber, customerId } = req.body;
    let customer = null;
    if (phoneNumber) {
      customer = await CustomerUser.findOne({
        where: { phoneNumber: req.body.phoneNumber },
        include: [Account],
      });
    } else if (customerId) {
      customer = await CustomerUser.findByPk(customerId, {
        include: [Account],
      });
    } else if (accountNumber) {
      const accountNumber = await Account.findOne({
        where: { accountNumber: req.body.accountNumber },
      });
      customer = await CustomerUser.findByPk(accountNumber.customerId, {
        include: [Account],
      });
    }

    if (!customer)
      return res.status(400).json({ message: "user does not exist" });

    const { password, ...saved } = await customer.toJSON();

    res.json({
      message: "customer profile",
      data: saved,
    });
  }
);

bankerRouter.put(
  "/account/withdraw",
  authMiddleware,
  roleMiddleWare("banker"),
  async (req, res) => {
    const account = await Account.findOne({
      where: { accountNumber: req.body.accountNumber },
    });
    if (!account)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Account Not Found" });
    if (req.body.amount <= 0 || account.accountBalance - req.body.amount < 10)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Insufficient fund" });
    await account.update({
      accountBalance:
        parseFloat(account.accountBalance) - parseFloat(req.body.amount),
    });

    res.json({ data: account, message: "Account withdraw" });
  }
);
bankerRouter.put(
  "/account/deposit",
  authMiddleware,
  roleMiddleWare("banker"),
  async (req, res) => {
    const account = await Account.findOne({
      where: { accountNumber: req.body.accountNumber },
    });
    if (!account)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Account Not Found" });
    console.log("account", account.toJSON());
    await account.update({
      accountBalance:
        parseFloat(account.accountBalance) + parseFloat(req.body.amount),
    });
    console.log("after deposit account", account.toJSON());

    res.json({ data: account, message: "Account deposit done" });
  }
);

module.exports = bankerRouter;
