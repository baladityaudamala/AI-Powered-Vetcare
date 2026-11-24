const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PostMedia = sequelize.define(
  "PostMedia",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mediaData: {
      type: DataTypes.BLOB("medium"),
      allowNull: false,
    },
  },
  {
    tableName: "post_media",
    timestamps: true,
  }
);

module.exports = PostMedia;
