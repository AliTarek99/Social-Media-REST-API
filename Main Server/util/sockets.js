const redis = require('redis');
const Chat_members = require('../models/Chat_members');
const { Op, Sequelize } = require('sequelize');
const Followers = require('../models/Followers');
const Messages = require('../models/Messages');
let socket, userToSocket = {}, socketToUser = {};

const subscriber = redis.createClient();
const publisher = redis.createClient();

subscriber.on('message', (channel, message) => {
    // send message to the user
    if (userToSocket[message.recipientId]) {
        socket.to(userToSocket[message.recipientId]).emit('message', message);
    }
});

const onConnection = socket => {
    // get userId from the jwt token
    // TODO: get userId from the jwt token

    // subscribe to the userId
    subscriber.subscribe(userId);

    // store the socket and userId in the global variables
    userToSocket[userId] = socket.id;
    socketToUser[socket.id] = userId;

    socket.on('message', async (message) => {
        const { text, media, recepientId, chatId } = message;

        if ((!text && !media) || (!recepientId && !chatId)) {
            return;
        }

        // get userId from the jwt token
        // TODO: get userId from the jwt token

        let promises = [];
        // check if there is a chat between the user and the recipient
        if (message.chatId) {
            let chatMembers = await Chat_members.findAll({
                where: {
                    id: message.chatId
                }
            });

            // check if the sender is a member of the chat
            if (chatMembers.length == 2 && chatMembers.find(member => member.userId == userId)) {
                // get the id of the recipient
                message.recipientId = chatMembers.find(member => member.userId != userId).userId;
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

            if (!follower) {
                message.recipientId = undefined;
            }

            // if there is no chat, create one
            if(!chat) {
                // create a new chat
                chat = await chat.create();
                chatId = chat.id;

                // create chat members
                promises.push(Chat_members.create({
                    id: chat.id,
                    userId: req.user.id
                }));

                promises.push(Chat_members.create({
                    id: chat.id,
                    userId: recepientId
                }));
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
        }));

        await Promise.all(promises);

        promises[promises.length - 1].recepientId = message.recipientId;

        // check if user has connection with this server
        if (userToSocket[message.recipientId]) {
            // send message to the user
            socket.to(userToSocket[message.recipientId]).emit('message', promises[promises.length - 1]);
        }
        else {
            // send message to the user
            await publisher.publish(message.recipientId, promises[promises.length - 1]);
        }
    });

}

exports.init = server => {
    socket = require('socket.io')(server, { path: '/ws/' });

    socket.on('connection', onConnection);
}

exports.getSocket = () => {
    return socket;
}