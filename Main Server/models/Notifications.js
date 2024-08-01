const sequelize = require('../util/db_helper').getdb();
const DataTypes = require('sequelize').DataTypes;
module.exports = sequelize.define('Notifications', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  recipientId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  activity_type: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  object_type: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
  },
  senderId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  not_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'Notifications',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "recipientId" },
        { name: "not_read" },
        { name: "id" },
      ]
    },
    {
      name: "notifications_senderid_foreign",
      using: "BTREE",
      fields: [
        { name: "senderId" },
      ]
    },
  ]
});
