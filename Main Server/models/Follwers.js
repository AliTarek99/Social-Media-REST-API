const sequelize = require('../util/db_helper').getdb();
const DataTypes = require("sequelize").DataTypes;
module.exports = sequelize.define('Follwers', {
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
  tableName: 'Follwers',
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
      name: "follwers_userid_index",
      using: "BTREE",
      fields: [
        { name: "userId" },
      ]
    },
  ]
});
