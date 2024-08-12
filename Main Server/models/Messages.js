const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../util/db_helper').getdb();

module.exports = sequelize.define('Messages', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
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
  text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  media: {
    type: DataTypes.STRING(36),
    allowNull: true
  },
  is_call: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  received: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  sequelize,
  tableName: 'Messages',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "senderId" },
        { name: "recipientId" },
        { name: "id" },
      ]
    },
    {
      name: "messages_recipientid_received_id_index",
      using: "BTREE",
      fields: [
        { name: "recipientId" },
        { name: "received" },
        { name: "id" },
      ]
    },
    {
      name: "messages_id_senderid_recipientid_index",
      using: "BTREE",
      fields: [
        { name: "id" },
        { name: "senderId" },
        { name: "recipientId" },
      ]
    },
  ]
});
