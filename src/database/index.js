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
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { timestamps: true }
);

const Account = db.define(
  "Account",
  {
    accountNumber: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT({ unsigned: true }),
    },
    accountType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "savings",
    },
    accountBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  { timestamps: true }
);
const Admin = db.define(
  "Admin",
  {
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { timestamps: true }
);

const Banker = db.define(
  "Banker",
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
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

CustomerUser.hasMany(Account, { foreignKey: "customerId", constraints: true });

db.sync({ alter: true })
  .then(() => console.log("models synced"))
  .catch((err) => console.log("syncing models error: ", err));

module.exports = { CustomerUser, Account, Banker, Admin };
