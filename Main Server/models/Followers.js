const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../util/db_helper').getdb();

module.exports = sequelize.define('Followers', {
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  followerId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  last_message: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Messages',
      key: 'id'
    }
  }
}, {
  sequelize,
  tableName: 'Followers',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "followerId" },
        { name: "userId" },
      ]
    },
    {
      name: "followers_userid_index",
      using: "BTREE",
      fields: [
        { name: "userId" },
      ]
    },
    {
      name: "followers_last_message_foreign",
      using: "BTREE",
      fields: [
        { name: "last_message" },
      ]
    },
  ]
});
