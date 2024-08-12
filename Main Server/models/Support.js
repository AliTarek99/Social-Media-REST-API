const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../util/db_helper').getdb();

module.exports = sequelize.define('Support', {
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
  num_of_reviewed_reports: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'Support',
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
    {
      name: "support_email_index",
      using: "BTREE",
      fields: [
        { name: "email" },
        { name: "password" },
      ]
    },
  ]
});
