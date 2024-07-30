const sequelize = require('sequelize');
const DataTypes = require("sequelize").DataTypes;
module.exports = sequelize.define('Users', {
  id: {
    autoIncrement: true,
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  profile_pic: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  bio: {
    type: DataTypes.STRING(1023),
    allowNull: true
  },
  number_of_followers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  number_of_followed: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  banned: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'Users',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "id" },
      ]
    },
    {
      name: "id",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "id" },
      ]
    },
  ]
});
