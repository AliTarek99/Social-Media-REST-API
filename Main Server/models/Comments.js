const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Comments', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    creatorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    postId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Posts',
        key: 'id'
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    media: {
      type: DataTypes.STRING(36),
      allowNull: true
    },
    num_of_children: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type_of_parent: {
      type: DataTypes.STRING(8),
      allowNull: false,
      primaryKey: true
    },
    parent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'Comments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "postId" },
          { name: "type_of_parent" },
          { name: "parent" },
          { name: "id" },
        ]
      },
      {
        name: "comments_creatorid_foreign",
        using: "BTREE",
        fields: [
          { name: "creatorId" },
        ]
      },
    ]
  });
};
