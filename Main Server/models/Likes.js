const sequelize = require('sequelize');
const DataTypes = require("sequelize").DataTypes;
module.exports = sequelize.define('Likes', {
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Posts',
      key: 'id'
    }
  }
}, {
  sequelize,
  tableName: 'Likes',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "postId" },
        { name: "userId" },
      ]
    },
    {
      name: "likes_userid_foreign",
      using: "BTREE",
      fields: [
        { name: "userId" },
      ]
    },
  ]
});
