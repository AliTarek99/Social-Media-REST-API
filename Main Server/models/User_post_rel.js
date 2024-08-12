const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../util/db_helper').getdb();

module.exports = sequelize.define('User_post_rel', {
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
  },
  liked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
    primaryKey: true
  },
  saved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'User_post_rel',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "liked" },
        { name: "postId" },
        { name: "userId" },
      ]
    },
    {
      name: "saved_posts_index",
      using: "BTREE",
      fields: [
        { name: "userId" },
        { name: "postId" },
        { name: "saved" },
      ]
    },
    {
      name: "User_post_rel_postid_foreign",
      using: "BTREE",
      fields: [
        { name: "postId" },
      ]
    },
  ]
});
