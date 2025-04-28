const express = require("express");
const router = express.Router();
const config = require("../config/index");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.status(200).json({
    status: true,
    message: "成功取得資料",
  });
});

module.exports = router;
