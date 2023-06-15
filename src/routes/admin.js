const { Router } = require("express");
const HttpStatus = require("http-status");
const { Admin, Banker } = require("../database");
const jwt = require("jsonwebtoken");
const {
  roleMiddleWare,
  authMiddleware,
  validateRequestBody,
} = require("./middlewares");
const { z } = require("zod");
const adminRouter = Router();

adminRouter.post("/register", (req, res) => {
  res.json({ message: "admin registered", data: req.body });
});

const loginRequestSchema = z.object({
  id: z.number("id is required"),
  password: z.string().min(1, "password is required"),
});

adminRouter.post(
  "/login",
  validateRequestBody(loginRequestSchema),
  async (req, res) => {
    const admin = await Admin.findOne({
      where: { id: req.body.id },
    });

    if (!admin) return res.status(400).json({ message: "user does not exist" });

    if (admin.password !== req.body.password)
      return res.status(400).json({ message: "invalid credentials" });

    const { password, ...saved } = await admin.toJSON();

    const loginToken = jwt.sign(
      { ...saved, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );

    res.json({
      message: "Admin logged in",
      token: loginToken,
    });
  }
);

adminRouter.get(
  "/bankers",
  authMiddleware,
  roleMiddleWare("admin"),
  async (req, res) => {
    const adminUser = await Admin.findByPk(req.user.id);
    if (!adminUser)
      return res
        .status(400)
        .json({ message: "you are not allowed for this service" });

    const bankers = await Banker.findAll();

    return res.status(200).json({ bankers });
  }
);

adminRouter.put(
  "/banker/suspend",
  authMiddleware,
  roleMiddleWare("admin"),
  async (req, res) => {
    const { body } = req;
    const banker = await Banker.findByPk({
      where: { phoneNumber: body.phoneNUmber },
    });
    if (!banker)
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "No banker found" });

    await banker.update({ suspended: body.suspend });

    const { user, ...password } = (await banker.reload()).toJSON();
    return res.json({ data: user, message: "banker updated successfully" });
  }
);

module.exports = adminRouter;
