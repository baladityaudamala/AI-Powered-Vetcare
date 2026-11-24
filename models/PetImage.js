const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PetImage = sequelize.define(
  "PetImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    imageData: {
      type: DataTypes.BLOB("medium"),
      allowNull: false,
    },
  },
  {
    tableName: "pet_images",
    timestamps: true,
  }
);

module.exports = PetImage;
