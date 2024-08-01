const sequelize = require('../util/db_helper').getdb();
const DataTypes = require("sequelize").DataTypes;
module.exports = sequelize.define('User_metadata', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  num_of_warnings: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  num_of_notifications: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(254),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(254),
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'User_metadata',
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
      name: "user_metadata_email_index",
      using: "BTREE",
      fields: [
        { name: "email" },
        { name: "password" },
      ]
    },
  ]
});
