const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../util/db_helper').getdb();

module.exports = sequelize.define('Posts', {
  id: {
    autoIncrement: true,
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  media_HD: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  media_SD: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  repostedId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  creatorId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  post_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  num_of_likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  num_of_comments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'Posts',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "creatorId" },
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
      name: "posts_id_index",
      using: "BTREE",
      fields: [
        { name: "id" },
      ]
    },
    {
      name: "posts_repostedid_foreign",
      using: "BTREE",
      fields: [
        { name: "repostedId" },
      ]
    },
  ]
});
