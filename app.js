const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger")("App");

//導入router

const usersRouter = require("./routes/users");
const uploadRouter = require("./routes/upload");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        req.body = req.raw.body;
        return req;
      },
    },
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//前端路由
app.use(express.static("public"));

//後端路由
app.use("/users", usersRouter);
app.use("/api/v1/courses/upload-mux", uploadRouter);

app.use((req, res, next) => {
  logger.warn("404 找不到對應資源");
  res.status(404).json({
    status: false,
    message: "找不到對應資源",
  });
  return;
});

app.use((err, req, res, next) => {
  req.log.error(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : false,
    message: err.message || "伺服器錯誤，未能取得資料",
  });
});

module.exports = app;
