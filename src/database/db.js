const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "kass-bank",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("database connected"))
  .catch((err) => console.log("database: ", err));

module.exports = sequelize;
