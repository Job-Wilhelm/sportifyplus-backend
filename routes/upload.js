const express = require("express");
const router = express.Router();

const appError = require("../utils/errorHandler");
const { AppDataSource } = require("../db/data-source");
require("dotenv").config();
const Mux = require("@mux/mux-node");

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

//建立本地上傳(direct upload)用的url
mux.video.uploads
  .create({
    //網站部署完成後要改成自己的DNS
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["public"],
      video_quality: "plus",
    },
  })
  .then((upload) => {});

//這是將影片從既有的網上url上傳到mux的功能，而direct upload才是允許用戶端從本地上傳影片。
//準備建影片檔案的資料庫
//準備建立取得playback id的api
//若將上傳當下的狀態直接存入資料庫，好像就會維持preparing，不再改變?

router.post("/create-asset", async (req, res, next) => {
  try {
    //取得request body送入的影片名稱、影片來源url(inputs內)、回放原則、影片畫質
    const {
      video_name: videoName,
      inputs,
      playback_policies: playbackPolicies,
      video_quality: videoQuality,
    } = req.body;
    //將上述資訊藉由mux sdk上傳到mux平台
    const asset = await mux.video.assets.create({
      inputs: inputs,
      playback_policies: playbackPolicies,
      video_quality: videoQuality,
    });
    //取得video資料表，並輸入建檔資料
    const videoRepo = AppDataSource.getRepository("Video");
    const newVideo = await videoRepo.create({
      asset_id: asset.id,
      video_name: videoName,
      uploading_status: asset.status,
      created_at: asset.created_at,
    });
    await videoRepo.save(newVideo);

    //建檔後回傳respond訊息
    res.status(201).json({
      status: true,
      message: "上傳成功",
      data: {
        asset_id: newVideo.asset_id,
        video_name: newVideo.video_name,
        created_at: newVideo.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", async (req, res, next) => {
  //正式上線時，請把cors_origin改成自己的網域，並去掉test屬性(test是測試用)
  try {
    const { cors_origin: corsOrigin } = req.body;

    const upload = await mux.video.uploads.create({
      timeout: 7200,
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "plus",
      },
      cors_origin: corsOrigin || "*", //部署前請去掉"*"
      test: true, //部署前請去掉
    });
    res.status(201).json({
      status: true,
      message: "新增上傳成功",
      data: {
        uploadUrl: upload.url,
        id: upload.id,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
