var DataTypes = require("sequelize").DataTypes;
var _Comments = require("./Comments");
var _Follwers = require("./Follwers");
var _Likes = require("./Likes");
var _Messages = require("./Messages");
var _Notifications = require("./Notifications");
var _Posts = require("./Posts");
var _Reports = require("./Reports");
var _Saved_Posts = require("./Saved_Posts");
var _Support = require("./Support");
var _User_metadata = require("./User_metadata");
var _Users = require("./Users");

function initModels(sequelize) {
  var Comments = _Comments(sequelize, DataTypes);
  var Follwers = _Follwers(sequelize, DataTypes);
  var Likes = _Likes(sequelize, DataTypes);
  var Messages = _Messages(sequelize, DataTypes);
  var Notifications = _Notifications(sequelize, DataTypes);
  var Posts = _Posts(sequelize, DataTypes);
  var Reports = _Reports(sequelize, DataTypes);
  var Saved_Posts = _Saved_Posts(sequelize, DataTypes);
  var Support = _Support(sequelize, DataTypes);
  var User_metadata = _User_metadata(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);

  Posts.belongsToMany(Users, { as: 'userId_Users_Likes', through: Likes, foreignKey: "postId", otherKey: "userId" });
  Posts.belongsToMany(Users, { as: 'userId_Users_Saved_Posts', through: Saved_Posts, foreignKey: "postId", otherKey: "userId" });
  Users.belongsToMany(Posts, { as: 'postId_Posts', through: Likes, foreignKey: "userId", otherKey: "postId" });
  Users.belongsToMany(Posts, { as: 'postId_Posts_Saved_Posts', through: Saved_Posts, foreignKey: "userId", otherKey: "postId" });
  Users.belongsToMany(Users, { as: 'userId_Users', through: Follwers, foreignKey: "followerId", otherKey: "userId" });
  Users.belongsToMany(Users, { as: 'followerId_Users', through: Follwers, foreignKey: "userId", otherKey: "followerId" });
  Users.belongsToMany(Users, { as: 'recipientId_Users', through: Messages, foreignKey: "senderId", otherKey: "recipientId" });
  Users.belongsToMany(Users, { as: 'senderId_Users', through: Messages, foreignKey: "recipientId", otherKey: "senderId" });
  Comments.belongsTo(Posts, { as: "post", foreignKey: "postId" });
  Posts.hasMany(Comments, { as: "Comments", foreignKey: "postId" });
  Likes.belongsTo(Posts, { as: "post", foreignKey: "postId" });
  Posts.hasMany(Likes, { as: "Likes", foreignKey: "postId" });
  Posts.belongsTo(Posts, { as: "reposted", foreignKey: "repostedId" });
  Posts.hasMany(Posts, { as: "Posts", foreignKey: "repostedId" });
  Reports.belongsTo(Posts, { as: "post", foreignKey: "postId" });
  Posts.hasMany(Reports, { as: "Reports", foreignKey: "postId" });
  Saved_Posts.belongsTo(Posts, { as: "post", foreignKey: "postId" });
  Posts.hasMany(Saved_Posts, { as: "Saved_Posts", foreignKey: "postId" });
  Reports.belongsTo(Support, { as: "Support", foreignKey: "SupportId" });
  Support.hasMany(Reports, { as: "Reports", foreignKey: "SupportId" });
  Comments.belongsTo(Users, { as: "creator", foreignKey: "creatorId" });
  Users.hasMany(Comments, { as: "Comments", foreignKey: "creatorId" });
  Follwers.belongsTo(Users, { as: "follower", foreignKey: "followerId" });
  Users.hasMany(Follwers, { as: "Follwers", foreignKey: "followerId" });
  Follwers.belongsTo(Users, { as: "user", foreignKey: "userId" });
  Users.hasMany(Follwers, { as: "user_Follwers", foreignKey: "userId" });
  Likes.belongsTo(Users, { as: "user", foreignKey: "userId" });
  Users.hasMany(Likes, { as: "Likes", foreignKey: "userId" });
  Messages.belongsTo(Users, { as: "sender", foreignKey: "senderId" });
  Users.hasMany(Messages, { as: "Messages", foreignKey: "senderId" });
  Messages.belongsTo(Users, { as: "recipient", foreignKey: "recipientId" });
  Users.hasMany(Messages, { as: "recipient_Messages", foreignKey: "recipientId" });
  Notifications.belongsTo(Users, { as: "recipient", foreignKey: "recipientId" });
  Users.hasMany(Notifications, { as: "Notifications", foreignKey: "recipientId" });
  Notifications.belongsTo(Users, { as: "sender", foreignKey: "senderId" });
  Users.hasMany(Notifications, { as: "sender_Notifications", foreignKey: "senderId" });
  Posts.belongsTo(Users, { as: "creator", foreignKey: "creatorId" });
  Users.hasMany(Posts, { as: "Posts", foreignKey: "creatorId" });
  Reports.belongsTo(Users, { as: "User", foreignKey: "UserId" });
  Users.hasMany(Reports, { as: "Reports", foreignKey: "UserId" });
  Saved_Posts.belongsTo(Users, { as: "user", foreignKey: "userId" });
  Users.hasMany(Saved_Posts, { as: "Saved_Posts", foreignKey: "userId" });
  User_metadata.belongsTo(Users, { as: "id_User", foreignKey: "id" });
  Users.hasOne(User_metadata, { as: "User_metadatum", foreignKey: "id" });

  return {
    Comments,
    Follwers,
    Likes,
    Messages,
    Notifications,
    Posts,
    Reports,
    Saved_Posts,
    Support,
    User_metadata,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
