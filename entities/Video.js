const { timeStamp } = require("console");
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Video",
  tableName: "videos",
  columns: {
    asset_id: {
      primary: true,
      type: "varchar",
      length: 100,
      nullable: false,
    },
    video_name: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    uploading_status: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    created_at: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
  },
});
