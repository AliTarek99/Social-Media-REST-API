const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../util/db_helper').getdb();

module.exports = sequelize.define('Reports', {
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  UserId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  SupportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Support',
      key: 'id'
    }
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  postId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  assigned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'Reports',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "SupportId" },
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
    {
      name: "reports_userid_postid_commentid_index",
      using: "BTREE",
      fields: [
        { name: "UserId" },
        { name: "postId" },
        { name: "commentId" },
      ]
    },
    {
      name: "reports_assigned_id_index",
      using: "BTREE",
      fields: [
        { name: "assigned" },
        { name: "id" },
      ]
    },
    {
      name: "reports_postid_foreign",
      using: "BTREE",
      fields: [
        { name: "postId" },
      ]
    },
  ]
});
