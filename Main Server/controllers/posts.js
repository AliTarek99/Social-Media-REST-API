const busboy = require('busboy');
const minio = require('../util/object_store');
const { producer } = require('../util/kafka_helper');
const Posts = require('../models/Posts');
const User_post_rel = require('../models/User_post_rel');
const Reports = require('../models/Reports');
const Followers = require('../models/Followers');
const { Sequelize, Op } = require('sequelize');
const db = require('../util/db_helper').getdb();
const Comments = require('../models/Comments');
const Users = require('../models/Users');
const socket = require('../util/sockets');
const User_metadata = require('../models/User_metadata');


exports.uploadPost = async (req, res, next) => {
    const bb = busboy({ headers: req.headers });
    let metadata = {};

    bb.on('field', (fieldname, val) => {
        metadata[fieldname] = val;
    });

    let media = undefined, mtype;
    bb.on('file', async (fieldname, fileStream, { filename, encoding, mimeType }) => {
        // check the mimeType to ensure it is media
        if (['video/mp4', 'video/webm', 'video/mpeg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].indexOf(mimeType) == -1) return res.status(400).json({ msg: 'invalid mimeType.' });
        // construct file name
        const objectname = `${req.userId}-${Date.now()}.${filename.split('.').pop()}`;
        // mark that there is media in this post and save its name
        media = objectname, mtype = mimeType;

        // forward stream to encoding buffer
        minio.buffer.putObject('media', objectname, fileStream, async (err, etag) => {
            if (err) {
                console.error('Error uploading to MinIO:', err);
                return res.status(500).json({ msg: 'Upload error' });
            }
            // produce event to kafka topic
            await producer.send({
                topic: 'PostWrites',
                messages: [
                    {
                        value: JSON.stringify({
                            media: media,
                            repostedId: metadata.repostedId,
                            creatorId: req.userId,
                            caption: metadata.caption,
                            mediaType: ['video/mp4', 'video/webm', 'video/mpeg'].indexOf(mtype) !== -1 ? 'video' : 'image'
                        })
                    }
                ]
            });
        });
    });

    bb.on('finish', async () => {
        try {
            console.log('producing');
            // check if the post does not contain any data to dismiss it
            if (!media && !metadata.caption) return res.status(400).json({ msg: "at least provide caption or media" });
            console.log('produced');
        } catch (produceErr) {
            console.error('Error producing message:', produceErr);
            return res.sendStatus(500);
        }
        console.log('Upload complete');
        res.sendStatus(201);
    });
    req.pipe(bb);
}

exports.getMedia = async (req, res, next) => {
    const objectName = req.params.objectName;
    // get stream from object store
    minioClient.getObject('media', objectName, (err, dataStream) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.setHeader('Content-Type', 'video/webm');
        res.setHeader('Content-Disposition', `inline; filename="${objectName}"`);

        dataStream.on('error', (err) => {
            console.log(err);
            return res.sendStatus(500);
        });

        // pipe the data from minio to response
        dataStream.pipe(res);
    });
}

// Function to handle the GET request for retrieving a specific post
exports.getPost = async (req, res, next) => {
    const postId = req.params.id

    // retreive post from database
    const post = await Posts.findOne({
        where: {
            id: postId
        },
        include: {
            model: Posts,
            on: Sequelize.where(Sequelize.col('Posts.id'), '=', Sequelize.col('Posts.repostedId'))
        }
    });

    res.status(200).json(post);
}

// Function to handle the GET request for retrieving the timeline
exports.getTimeline = async (req, res, next) => {
    const { offset } = req.query;

    // get accounts the user is following
    const following = await Followers.findAll({
        where: {
            followerId: req.userId
        },
        attributes: ['userId']
    });

    // get the latest 15 posts after the offset
    const posts = await Posts.findAll({
        where: {
            creatorId: {
                [Op.in]: following.map(f => f.userId)
            },
            id: {
                [Op.lt]: offset || 1000000000
            }
        },
        include: [
            {
                model: Posts,
                on: Sequelize.where(Sequelize.col('Posts.id'), '=', Sequelize.col('Posts.repostedId')),
                attributes: ['id', 'media_HD', 'media_SD', 'caption', 'num_of_likes', 'num_of_comments', 'post_date']
            },
            {
                models: Users,
                on: Sequelize.where(Sequelize.col('Users.id'), '=', Sequelize.col('Posts.creatorId')),
                attributes: ['name', 'id', 'profile_pic']
            }
        ],
        limit: 15,
        attributes: ['id', 'media_HD', 'media_SD', 'caption', 'num_of_likes', 'num_of_comments', 'post_date'],
        order: [['id', 'DESC']]
    });

    res.status(200).json({ posts: posts });
}

// Function to handle the GET request for retrieving comments of a post
exports.getComments = async (req, res, next) => {
    const { type_of_parent, parentId } = req.body;
    const postId = req.params;

    // get comments from the database
    const comments = await Comments.findAll({
        where: {
            postId: postId,
            type_of_parent: type_of_parent,
            parent: parentId,
            id: {
                [Op.lt]: req.query.offset || 0
            }
        },
        include: {
            model: Users,
            on: Sequelize.where(Sequelize.col('Users.id'), '=', Sequelize.col('Comments.creatorId')),
            attributes: ['name', 'id', 'profile_pic']
        },
        limit: 30,
        attributes: ['id', 'postId', 'text', 'media', 'num_of_children'],
        order: [['id', 'DESC']]
    });

    res.status(200).json({ comments: comments });
}

// Function to handle the POST request for adding a comment to a post
exports.comment = async (req, res, next) => {
    const { type_of_parent, parentId, text, media } = req.body;
    const postId = req.params.id;

    let par;
    // check that parent exist
    if (type_of_parent == 'comment') {
        par = await Comments.findOne({
            where: {
                postId: postId,
                id: parentId
            },
            attributes: ['id']
        });
    }
    else if (type_of_parent == 'post') {
        par = await Posts.findOne({
            where: {
                id: postId
            },
            attributes: ['id']
        });
    }
    else {
        return res.status(400).json({ msg: 'invalid parent type.' });
    }

    if (!par) {
        return res.status(400).json({ msg: 'invalid parent.' });
    }

    // save comment to database
    await Comments.create({
        creatorId: req.userId,
        postId: postId,
        type_of_parent: type_of_parent,
        parentId: parentId,
        text: text,
        media: media
    });

    await socket.sendNotification(
        req.userId,
        par.creatorId,
        'comment',
        par.id,
        'commented',
        `commented on your ${type_of_parent}`
    );

    res.sendStatus(201);
}

// Function to handle the POST request for liking a post
exports.like = async (req, res, next) => {
    const postId = req.params.id;
    const t = db.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
    try {
        // add post to liked posts
        const userPost = await User_post_rel.findOne({
            where: {
                userId: req.userId,
                postId: postId
            },
            attributes: ['liked'],
            transaction: t,
            lock: t.LOCK.SHARE
        });

        if (!userPost) {
            await User_post_rel.create({
                userId: req.userId,
                postId: postId,
                liked: true
            },
                { transaction: t }
            );
        }
        else {
            userPost.liked = true;
            await userPost.save({ transaction: t });
        }

        const post = await Posts.findOne({
            where: {
                id: postId
            },
            attributes: ['num_of_likes', 'creatorId'],
            transaction: t,
            lock: t.LOCK.SHARE // lock for update
        });

        post.num_of_likes += 1;
        await post.save({ transaction: t });

        await t.commit();

        await socket.sendNotification(
            req.userId,
            post.creatorId,
            'post',
            postId,
            'liked',
            `liked your post`
        );
    } catch (err) {
        await t.rollback();
        next(err);
    }

    res.sendStatus(200);
}

// Function to handle the POST request for saving a post
exports.save = async (req, res, next) => {
    const postId = req.params.id;
    const t = db.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
    try {
        // add post to saved posts
        const userPost = await User_post_rel.findOne({
            where: {
                userId: req.userId,
                postId: postId
            },
            attributes: ['saved'],
            transaction: t,
            lock: t.LOCK.SHARE
        });

        if (!userPost) {
            await User_post_rel.create({
                userId: req.userId,
                postId: postId,
                saved: true
            },
                { transaction: t }
            );
        }
        else {
            userPost.saved = true;
            await userPost.save({ transaction: t });
        }

        await t.commit();
    } catch (err) {
        await t.rollback();
        next(err);
    }

    res.sendStatus(200);
}

// Function to handle the POST request for unliking a post
exports.unlike = async (req, res, next) => {
    const postId = req.params.id;

    const t = db.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
    try {
        // get user_post relation
        const userPost = await User_post_rel.findOne({
            where: {
                userId: req.userId,
                postId: postId
            },
            attributes: ['saved', 'liked'],
            lock: t.LOCK.SHARE,
            transaction: t
        });

        if (!userPost) {
            return res.sendStatus(404);
        }

        // delete the relaion if the post is not liked and not saved
        if (!userPost.saved) {
            await User_post_rel.destroy({
                where: {
                    userId: req.userId,
                    postId: postId
                },
                transaction: t
            });
        }
        else {
            userPost.liked = false;
            await userPost.save({ transaction: t });
        }

        // decrease number of likes
        const post = await Posts.findOne({
            where: {
                id: postId
            },
            attributes: ['num_of_likes', 'creatorId'],
            lock: t.LOCK.SHARE, // This locks the row for update
            transaction: t
        });

        post.num_of_likes -= 1;
        await post.save({ transaction: t });

        await t.commit();
    } catch (err) {
        await t.rollback();
        next(err);
    }

    res.sendStatus(200);
}

// Function to handle the POST request for unsaving a post
exports.unsave = async (req, res, next) => {
    const postId = req.params.id;
    const t = db.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });

    try {
        // get user_post relation
        const userPost = await User_post_rel.findOne({
            where: {
                userId: req.userId,
                postId: postId
            },
            attributes: ['saved', 'liked'],
            transaction: t,
            lock: t.LOCK.SHARE
        });

        if (!userPost) {
            return res.sendStatus(404);
        }

        // delete the relaion if the post is not liked and not saved
        if (!userPost.liked) {
            await User_post_rel.destroy({
                where: {
                    userId: req.userId,
                    postId: postId
                }
            }, { transaction: t }
            );
        }
        else {
            userPost.saved = false;
            await userPost.save({ transaction: t });
        }

        await t.commit();
    } catch (err) {
        await t.rollback();
        next(err);
    }

    res.sendStatus(200);
}

// Function to handle the GET request for retrieving likes of a post
exports.getLikes = async (req, res, next) => {
    const postId = req.params.id
    // get the users who liked the post and join them with the users table
    const likes = await User_post_rel.findAll({
        where: {
            userId: req.userId,
            postId: postId,
            liked: true
        },
        include: {
            model: Users,
            attributes: ['name', 'id', 'profile_pic'],
            on: Sequelize.where(Sequelize.col('Users.id'), '=', Sequelize.col('User_post_rel.userId'))
        },
        attributes: [],
        limit: 30,
        offset: req.query.offset || 0
    });

    res.status(200).json({ likes: likes });
}

// Function to handle the POST request for sharing a post
exports.share = async (req, res, next) => {
    const postId = req.params.postId;
    const { caption } = req.body;

    // check if post exists
    const post = await Posts.findOne({
        where: {
            id: postId
        },
        attributes: ['repostedId', 'id']
    });

    if (!post) {
        return res.sendStatus(404);
    }

    // save post to database
    await Posts.create({
        repostedId: post.repostedId || postId,
        caption: caption,
        post_date: new Date(),
        creatorId: req.userId
    });

    if (post.repostedId) {
        post = await Posts.findOne({
            where: {
                id: post.repostedId
            },
            attributes: ['creatorId']
        });
    }

    // notify post creator
    await socket.sendNotification(
        req.userId,
        post.creatorId,
        'post',
        post.id,
        'shared',
        `Shared your post.`
    );

    res.sendStatus(201);
}

// Function to handle the DELETE request for deleting a post
exports.deletePost = async (req, res, next) => {
    // check if user is the creator of the post
    const postId = req.params.id;
    const post = await Posts.findOne({
        where: {
            id: postId
        },
        attributes: ['creatorId']
    });

    if (!post || post.creatorId != req.userId) {
        return res.sendStatus(401);
    }

    // delete the post
    await Posts.destroy({
        where: {
            id: postId
        }
    });

    res.sendStatus(200);
}

// Function to handle the POST request for reporting a post
exports.reportPost = async (req, res, next) => {
    // check that user is not the creator of the post
    const postId = req.params.id;
    const post = await Posts.findOne({
        where: {
            id: postId
        },
        attributes: ['creatorId']
    });

    if (!post || post.creatorId == req.userId) {
        return res.sendStatus(400);
    }

    // save report to database
    await Reports.create({
        userId: req.userId,
        description: req.body.description || '',
        postId: postId,
        commentId: req.commentId || null
    });

    res.sendStatus(201);
}
