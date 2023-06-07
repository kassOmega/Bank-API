const { DataTypes } = require("sequelize");
const db = require("./db");
const CustomerUser = db.define(
  "CustomerUser",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT({ unsigned: true }),
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { timestamps: true }
);

db.sync({ alter: true })
  .then(() => console.log("models synced"))
  .catch((err) => console.log("syncing models error: ", err));

module.exports = { CustomerUser };
