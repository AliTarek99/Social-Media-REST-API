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
  ]
});

