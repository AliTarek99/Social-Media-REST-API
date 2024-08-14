const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/db_helper').getdb();
module.exports = sequelize.define('Chats', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    num_of_msgs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    last_message: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id'
      }
    },
    last_message_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Chats',
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
        name: "chats_last_message_date_index",
        using: "BTREE",
        fields: [
          { name: "last_message_date" },
        ]
      },
      {
        name: "chats_last_message_foreign",
        using: "BTREE",
        fields: [
          { name: "last_message" },
        ]
      },
    ]
  });
