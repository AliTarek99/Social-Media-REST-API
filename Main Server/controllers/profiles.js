const Users = require("../models/Users");
const Followers = require('../models/Followers');
const Posts = require('../models/Posts');
const { Sequelize, Op, where } = require("sequelize");
const Notifications = require('../models/Notifications');



// Function to handle the GET request for retrieving a profile
exports.getProfile = async (req, res, next) => {
    // retrieve profile from database
    const profile = await Users.findOne({
        where: {
            id: req.params.id || req.userId
        },
        attributes: {
            suspended: false
        }
    });

    // check if profile exists and is not banned
    if (!profile || profile.banned) {
        return res.sendStatus(404);
    }

    // send profile to client
    res.status(200).json(profile);
}

// Function to handle the POST request for updating a profile
exports.updateProfile = async (req, res, next) => {
    // check if the request body is valid
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // retrieve profile from database
    const profile = await Users.findOne({
        where: {
            id: req.userId
        },
        attributes: ['name', 'bio', 'banned']
    });

    // check if profile exists and is not banned
    if (!profile || profile.banned) {
        return res.sendStatus(404);
    }

    // update profile in database
    profile.name = req.body.name;
    profile.bio = req.body.bio;
    await profile.save();

    res.sendStatus(200);
}

// Function to handle the POST request for updating an avatar
exports.updateAvatar = async (req, res, next) => {
    // get the user's profile
    const profile = await Users.findOne({
        where: {
            id: req.userId
        },
        attributes: ['profile_pic', 'banned']
    });

    // check if profile exists and is not banned
    if (!profile || profile.banned) {
        return res.sendStatus(404);
    }

    // TODO: write the logic to upload the avatar to the object store
    // and update the avatar in the database

    res.sendStatus(200);

}

// Function to handle the GET request for retrieving followers
exports.getFollowers = async (req, res, next) => {
    // retrieve followers from database
    const followers = await Followers.findAll({
        where: {
            userId: req.params.id || req.userId
        },
        include: {
            model: Users,
            where: {
                banned: false
            },
            attributes: ['name', 'profile_pic', 'id'],
            on: Sequelize.where(Sequelize.col('Followers.followerId'), '=', Sequelize.col('Users.id'))
        },
        limit: 30,
        offset: req.query.offset || 0,
        attributes: []
    });

    // send followers to client
    res.status(200).json({
        followers: followers
    });
}

// Function to handle the GET request for retrieving following
exports.getFollowing = async (req, res, next) => {
    // retrieve following from database
    const following = await Followers.findAll({
        where: {
            followerId: req.params.id || req.userId
        },
        include: {
            model: Users,
            where: {
                banned: false
            },
            attributes: ['name', 'profile_pic', 'id'],
            on: Sequelize.where(Sequelize.col('Followers.userId'), '=', Sequelize.col('Users.id'))
        },
        limit: 30,
        offset: req.query.offset || 0,
        attributes: []
    });

    // send following to client
    res.status(200).json({
        following: following
    });
}

// Function to handle the POST request for following a profile
exports.follow = async (req, res, next) => {
    // check if the request body is valid
    if(!req.body.id) {
        return res.sendStatus(400)
    }

    // check if the user is already following the profile
    const follower = await Followers.findOne({
        where: {
            userId: req.params.id,
            followerId: req.userId
        }
    });

    if (follower) {
        return res.sendStatus(400);
    }

    // create a new follower
    await Followers.create({
        userId: req.body.id,
        followerId: req.userId
    });

    // TODO: send notification to the user

    res.sendStatus(201);
}

// Function to handle the POST request for unfollowing a profile
exports.unfollow = async (req, res, next) => {
    // check if the request body is valid
    if(!req.body.id) {
        return res.sendStatus(400)
    }

    // check if the user is following the profile
    const follower = await Followers.findOne({
        where: {
            userId: req.params.id,
            followerId: req.userId
        }
    });

    if (!follower) {
        return res.sendStatus(400);
    }

    // delete the follower
    await follower.destroy();

    res.sendStatus(200);
}

// Function to handle the GET request for retrieving posts of a profile
exports.getPosts = async (req, res, next) => {
    // retrieve posts from database
    const posts = await Posts.findAll({
        where: {
            creatorId: req.body.id || req.userId,
            id: {
                [Op.lt]: req.query.offset
            }
        },
        include: [
            {
                model: Users,
                where: {
                    banned: false
                },
                attributes: ['name', 'profile_pic'],
                on: Sequelize.where(Sequelize.col('Posts.creatorId'), '=', Sequelize.col('Users.id'))
            },
            {
                model: User_post_rel,
                where: {
                    userId: req.userId
                },
                on: Sequelize.where(Sequelize.col('Posts.id'), '=', Sequelize.col('User_post_rel.postId')),
                attributes: ['saved', 'liked']
            }
        ],
        order: [['id', 'DESC']],
        limit: 15,
        attributes: ['id', 'caption', 'media_SD', 'media_HD', 'post_date', 'num_of_likes', 'num_of_comments', 'repostedId', 'creatorId']
    });

    // send posts to client
    res.status(200).json({
        posts: posts
    });
}

// Function to handle the GET request for retrieving saved posts
exports.getSavedPosts = async (req, res, next) => {
    // retrieve posts from database
    const posts = await Posts.findAll({
        where: {
            creatorId: req.body.id || req.userId,
            id: {
                [Op.lt]: req.query.offset
            }
        },
        include: [
            {
                model: Users,
                where: {
                    banned: false
                },
                attributes: ['name', 'profile_pic'],
                on: Sequelize.where(Sequelize.col('Posts.creatorId'), '=', Sequelize.col('Users.id'))
            },
            {
                model: User_post_rel,
                where: {
                    userId: req.userId,
                    saved: true
                },
                on: Sequelize.where(Sequelize.col('Posts.id'), '=', Sequelize.col('User_post_rel.postId')),
                attributes: ['saved', 'liked']
            }
        ],
        order: [['id', 'DESC']],
        limit: 15,
        attributes: ['id', 'caption', 'media_SD', 'media_HD', 'post_date', 'num_of_likes', 'num_of_comments', 'repostedId', 'creatorId']
    });

    // send posts to client
    res.status(200).json({
        posts: posts
    });
}

// Function to handle the GET request for retrieving notifications
exports.getNotifications = async (req, res, next) => {
    // retrieve notifications from database
    const notifications = await Notifications.findAll({
        where: {
            recipientId: req.userId,
            id: {
                [Op.lt]: req.query.offset
            }
        },
        limit: 15,
        order: [['id', 'DESC']],
        attributes: ['id', 'type', 'date', 'read', 'data']
    });

    // send notifications to client
    return res.status(200).json({
        notifications: notifications
    });
}

// Function to handle the POST request for marking a notification as read
exports.markAsRead = async (req, res, next) => {
    // retrieve notification from database
    const notification = await Notifications.findOne({
        where: {
            id: req.params.id,
            recipientId: req.userId
        }
    });

    // check if notification exists
    if (!notification) {
        return res.sendStatus(404);
    }

    notification.not_read = false;
    await notification.save();

    return res.sendStatus(200);
}

// Function to handle the GET request for searching profiles by name
exports.searchProfiles = async (req, res, next) => {
    // retrieve profiles from database
    const profiles = await Users.findAll({
        where: {
            name: {
                [Op.like]: `${req.params.name}%`
            },
            banned: false
        },
        limit: 15,
        offset: req.query.offset || 0,
        attributes: ['name', 'profile_pic', 'id']
    });

    // send profiles to client
    res.status(200).json({
        profiles: profiles
    });
}