const redis = require('redis');
const Chat_members = require('../models/Chat_members');
const { Op, Sequelize } = require('sequelize');
const Followers = require('../models/Followers');
const Messages = require('../models/Messages');
const { decodejwt } = require('./helper');
const notifications = require('../models/Notifications');
const User_metadata = require('../models/User_metadata');
const crypto = require('crypto');
const Chats = require('../models/Chats');
const db = require('../util/db_helper').getdb();
let socket, userToSocket = {}, socketToUser = {};

const subscriber = redis.createClient();
const publisher = redis.createClient();

subscriber.on('message', (channel, message) => {
    // send message to the user
    if (userToSocket[message.recipientId]) {
        const event = message.event;
        delete message.event;
        socket.to(userToSocket[message.recipientId]).emit(message.event, message);
    }
});

exports.init = server => {
    // import socket io package and create socket
    socket = require('socket.io')(server, { path: '/ws/' });

    socket.on('connection', onConnection);
}

exports.getSocket = () => {
    return socket;
}

const onConnection = socket => {
    socket.on('add-user', async data => {
        let userId;
        try {
            // get userId from the jwt token
            userId = decodejwt({ Authorization: data.token }).userId;
        } catch (err) {
            return;
        }

        // subscribe to the userId
        subscriber.subscribe(userId);

        // store the socket and userId in the global variables
        userToSocket[userId] = socket.id;
        socketToUser[socket.id] = userId;
    });

    socket.on('message', async message => {
        let { text, media, recepientId, chatId, token } = message;

        if ((!text && !media) || (!recepientId && !chatId)) {
            return;
        }

        try {
            // get userId from the jwt token
            const userId = decodejwt({ Authorization: token }).userId;
            const t = db.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });

            let promises = [];
            // check if there is a chat between the user and the recipient
            if (chatId) {
                let chatMembers = await Chat_members.findAll({
                    where: {
                        id: chatId
                    }
                });

                // check if the sender is a member of the chat
                if (chatMembers.length == 2 && chatMembers.find(member => member.userId == userId)) {
                    // get the id of the recipient
                    const member = chatMembers.find(member => member.userId != userId);
                    message.recipientId = member ? member.userId : undefined;
                }
            }
            else if (message.recipientId) {

                // check if there is a chat between the 2 users
                let chat = await Chat_members.findOne({
                    where: {
                        id: {
                            [Op.in]: Sequelize.literal(`SELECT id FROM Chat_members WHERE userId = ${req.user.id}`)
                        },
                        userId: recepientId
                    }
                });

                // check if the sender follows the recipient or the recipient follows the sender
                let follower = await Followers.findOne({
                    where: {
                        [Op.or]: [
                            {
                                userId: userId,
                                followerId: message.recipientId
                            },
                            {
                                userId: message.recipientId,
                                followerId: userId
                            }
                        ]
                    },
                    attributes: ['userId']
                });

                if (!message.recipientId) {
                    return;
                }

                if (!follower && !chat) {
                    message.recipientId = undefined;
                }
                // if there is no chat, create one
                else if (!chat) {
                    // create a hash value using user IDs to avoid adding the same chat twice
                    const hash1 = crypto.createHash('sha256').update(userId).digest('hex');
                    const hash2 = crypto.createHash('sha256').update(message.recipientId).digest('hex')
                    const dp = crypto.create('sha256').update(hash1 < hash2 ? hash1 + hash2 : hash2 + hash1).digest('hex');

                    // create a new chat
                    chat = await chat.create({
                        duplicate_prevention: dp
                    }, { transaction: t });
                    chatId = chat.id;

                    // create chat members
                    promises.push(Chat_members.create({
                        id: chat.id,
                        userId: req.user.id
                    }, { transaction: t }));

                    promises.push(Chat_members.create({
                        id: chat.id,
                        userId: recepientId
                    }, { transaction: t }));
                }
            }

            if (!message.recipientId) {
                return;
            }

            // create a new message
            promises.push(Messages.create({
                text: text,
                media: media,
                date: new Date(),
                senderId: userId,
                chatId: chatId,
                seen: false,
                received: false
            }, { transaction: t }));

            await Promise.all(promises);

            promises[promises.length - 1].recepientId = message.recipientId;

            let data = {
                num_of_msgs: Sequelize.literal('num_of_msgs + 1'),
                last_message: promises[promises.length - 1].id,
                last_message_date: promises[promises.length - 1].date,
            }

            // delete the hash if it is old so it does not take up space
            if (message.chatId)
                data.duplicate_prevention = null;
            // send the chat id to the user creating it
            else if (userToSocket[userId]) {
                socket.to(userToSocket[userId]).emit('chat-created', { chatId: chatId });
            }
            else {
                await publisher.publish(userId, {
                    event: 'chat-created',
                    chatId: chatId
                });
            }

            await Chats.update(data, {
                where: {
                    id: chatId
                }
            }, { transaction: t });

            await t.commit();

            // check if user has connection with this server
            if (userToSocket[message.recipientId]) {
                // send message to the user
                socket.to(userToSocket[message.recipientId]).emit('message', promises[promises.length - 1]);
            }
            else {
                promises[promises.length - 1].event = 'message';
                // send message to the user
                await publisher.publish(message.recipientId, promises[promises.length - 1]);
            }
        } catch (err) {
            return;
        }
    });

    socket.on('disconnect', async () => {
        // unsubscribe from redis channel
        await subscriber.unsubscribe(socketToUser[socket.id]);
        // remove the socket from the global variables
        delete userToSocket[socketToUser[socket.id]];
        delete socketToUser[socket.id];
    });

}


exports.sendNotification = async (senderId, recepientId, object_type, objectId, activity_type, description) => {
    // create a notification for object creator
    const t = db.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
    try {
        // get the number of notifications and create the notification
        const user_meta = await User_metadata.findOne({
            where: {
                id: recepientId
            },
            attributes: ['num_of_notifications'],
            transaction: t,
            lock: t.LOCK.SHARE
        });

        user_meta.num_of_notifications += 1;
        await user_meta.save({ transaction: t });

        const notification = await notifications.create({
            id: user_meta.num_of_notifications,
            object_type: object_type,
            activity_type: activity_type,
            description: description,
            recipientId: recepientId,
            senderId: senderId,
            objectId: objectId
        },
            { transaction: t }
        );

        // notify the user if he is currently connected to the server
        if (userToSocket[notification.recipientId])
            socket.to(userToSocket[notification.recipientId]).emit('notification', notification);
        else {
            notification.event = 'notification';
            await publisher.publish(notification.recipientId, notification);
        }

        await t.commit();
    } catch (err) {
        await t.rollback();
        return res.status(500).json({ msg: 'internal server error.' });
    }
}