const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/db_helper').getdb();
module.exports = sequelize.define('Chat_members', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Chats',
        key: 'id'
      }
    },
    userId: {
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
    tableName: 'Chat_members',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
          { name: "id" },
        ]
      },
      {
        name: "chats_members_userId_id_index",
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "userId" },
        ]
      },
    ]
  });
