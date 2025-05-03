//這裡是取得.env的mux token以通過驗證
const Mux = require("@mux/mux-node");

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

module.exports = mux;
