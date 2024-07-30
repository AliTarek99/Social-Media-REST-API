const sequelize = require('sequelize');
const DataTypes = require("sequelize").DataTypes;
module.exports = sequelize.define('Saved_Posts', {
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
  tableName: 'Saved_Posts',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "userId" },
        { name: "postId" },
      ]
    },
    {
      name: "saved_posts_postid_foreign",
      using: "BTREE",
      fields: [
        { name: "postId" },
      ]
    },
  ]
});
