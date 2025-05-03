const { DataSource } = require("typeorm");
const config = require("../config/index");

const User = require("../entities/User");
const Video = require("../entities/video");

const AppDataSource = new DataSource({
  type: "postgres",
  host: config.get("db.host"),
  port: config.get("db.port"),
  username: config.get("db.username"),
  password: config.get("db.password"),
  database: config.get("db.database"),
  synchronize: config.get("db.synchronize"),
  entities: [User, Video], // ← 注意這裡要匯入正確 Entity
});

module.exports = { AppDataSource };
