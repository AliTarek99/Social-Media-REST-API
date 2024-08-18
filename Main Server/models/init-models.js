var DataTypes = require("sequelize").DataTypes;
var Chat_members = require("./Chat_members");
var Chats = require("./Chats");
var Comments = require("./Comments");
var Followers = require("./Followers");
var Messages = require("./Messages");
var Notifications = require("./Notifications");
var Posts = require("./Posts");
var Reports = require("./Reports");
var Support = require("./Support");
var User_metadata = require("./User_metadata");
var User_post_rel = require("./User_post_rel");
var Users = require("./Users");

function initModels() {

  Chats.belongsToMany(Users, { as: 'userId_Users', through: Chat_members, foreignKey: "id", otherKey: "userId" });
  Posts.belongsToMany(Users, { as: 'userId_Users_User_post_rels', through: User_post_rel, foreignKey: "postId", otherKey: "userId" });
  Users.belongsToMany(Chats, { as: 'id_Chats', through: Chat_members, foreignKey: "userId", otherKey: "id" });
  Users.belongsToMany(Posts, { as: 'postId_Posts', through: User_post_rel, foreignKey: "userId", otherKey: "postId" });
  Users.belongsToMany(Users, { as: 'userId_Users_Followers', through: Followers, foreignKey: "followerId", otherKey: "userId" });
  Users.belongsToMany(Users, { as: 'followerId_Users', through: Followers, foreignKey: "userId", otherKey: "followerId" });
  Chat_members.belongsTo(Chats, { as: "id_Chat", foreignKey: "id"});
  Chats.hasMany(Chat_members, { as: "Chat_members", foreignKey: "id"});
  Messages.belongsTo(Chats, { as: "chat", foreignKey: "chatId"});
  Chats.hasMany(Messages, { as: "Messages", foreignKey: "chatId"});
  Chats.belongsTo(Messages, { as: "last_message_Message", foreignKey: "last_message"});
  Messages.hasMany(Chats, { as: "Chats", foreignKey: "last_message"});
  Comments.belongsTo(Posts, { as: "post", foreignKey: "postId"});
  Posts.hasMany(Comments, { as: "Comments", foreignKey: "postId"});
  Posts.belongsTo(Posts, { as: "reposted", foreignKey: "repostedId"});
  Posts.hasMany(Posts, { as: "Posts", foreignKey: "repostedId"});
  Reports.belongsTo(Posts, { as: "post", foreignKey: "postId"});
  Posts.hasMany(Reports, { as: "Reports", foreignKey: "postId"});
  User_post_rel.belongsTo(Posts, { as: "post", foreignKey: "postId"});
  Posts.hasMany(User_post_rel, { as: "User_post_rels", foreignKey: "postId"});
  Reports.belongsTo(Support, { as: "Support", foreignKey: "SupportId"});
  Support.hasMany(Reports, { as: "Reports", foreignKey: "SupportId"});
  Chat_members.belongsTo(Users, { as: "user", foreignKey: "userId"});
  Users.hasMany(Chat_members, { as: "Chat_members", foreignKey: "userId"});
  Comments.belongsTo(Users, { as: "creator", foreignKey: "creatorId"});
  Users.hasMany(Comments, { as: "Comments", foreignKey: "creatorId"});
  Followers.belongsTo(Users, { as: "follower", foreignKey: "followerId"});
  Users.hasMany(Followers, { as: "Followers", foreignKey: "followerId"});
  Followers.belongsTo(Users, { as: "user", foreignKey: "userId"});
  Users.hasMany(Followers, { as: "user_Followers", foreignKey: "userId"});
  Messages.belongsTo(Users, { as: "sender", foreignKey: "senderId"});
  Users.hasMany(Messages, { as: "Messages", foreignKey: "senderId"});
  Notifications.belongsTo(Users, { as: "recipient", foreignKey: "recipientId"});
  Users.hasMany(Notifications, { as: "Notifications", foreignKey: "recipientId"});
  Notifications.belongsTo(Users, { as: "sender", foreignKey: "senderId"});
  Users.hasMany(Notifications, { as: "sender_Notifications", foreignKey: "senderId"});
  Posts.belongsTo(Users, { as: "creator", foreignKey: "creatorId"});
  Users.hasMany(Posts, { as: "Posts", foreignKey: "creatorId"});
  Reports.belongsTo(Users, { as: "User", foreignKey: "UserId"});
  Users.hasMany(Reports, { as: "Reports", foreignKey: "UserId"});
  User_metadata.belongsTo(Users, { as: "id_User", foreignKey: "id"});
  Users.hasOne(User_metadata, { as: "User_metadatum", foreignKey: "id"});
  User_post_rel.belongsTo(Users, { as: "user", foreignKey: "userId"});
  Users.hasMany(User_post_rel, { as: "User_post_rels", foreignKey: "userId"});
}
module.exports = initModels;