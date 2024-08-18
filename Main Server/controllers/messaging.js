const { Op } = require('sequelize');
const sequelize = require('../util/db_helper').getdb();
const chat_members = require('../models/Chat_members');
const validator = require('validator');
const Messages = require('../models/Messages');
const chat = require('../models/Chats');



exports.getConversations = async (req, res, next) => {
    // check if the user is logged in
    if (!req.user) {
        return res.sendStatus(401);
    }

    // validate the request body
    const { offset } = req.query;

    if (offset != undefined && !validator.isDate(offset)) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    // join the tables chat_members, messages, users, and chats
    // where the user is a member of the chat
    // and the message date is less than the offset to avoid using offset key word in sql for better performance
    let chats = await sequelize.query(`
        SELECT U.profile_pic, U.name, M.chatId, M.text, M.media, M.call, M.date, M.senderId, M.seen, M.received
        FROM Chat_members
        JOIN Users U ON U.id = Chat_members.userId
        JOIN Chats C ON C.id = Chat_members.id
        JOIN Messages M ON M.chatId = Chat_members.id
        WHERE Chat_members.id IN (SELECT id FROM Chat_members WHERE userId = ${req.user.id}) AND M.date < :offset AND Chat_members.userId <> ${req.user.id}
        ORDER BY M.date DESC
        LIMIT 10
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            offset: offset || new Date()
        }
    });

    res.status(200).json({
        chats: chats
    });
}


exports.getConversation = async (req, res, next) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    const { conversationId } = req.params;

    // check if the user is a member of the conversation
    const members = await chat_members.findAll({
        where: {
            id: conversationId,
        },
        attributes: ['userId']
    });

    if (!members.find(value => value.userId === req.user.id)) {
        return res.sendStatus(401);
    }

    // get the messages with id less than the offset
    const messages = await Messages.findAll({
        where: {
            chatId: conversationId,
            id: {
                [Op.lt]: req.query.offset
            }
        },
        attributes: ['text', 'media', 'call', 'date', 'senderId', 'seen', 'received', 'id'],
        order: [['date', 'DESC']],
        limit: 100
    });

    return res.status(200).json({
        messages: messages
    });
}

exports.getNonReceivedMessages = async (req, res, next) => {
    // check if the user is logged in
    if (!req.user) {
        return res.sendStatus(401);
    }

    // get the chats the user is member of and get the messages that are not received
    const messages = await chat_members.findAll({
        where: {
            userId: req.user.id
        },
        attributes: ['id'],
        include: [{
            model: Messages,
            where: {
                received: false
            },
            attributes: ['text', 'media', 'call', 'date', 'senderId', 'seen', 'received', 'id'],
            on: {
                [Op.and]: [
                    sequelize.where(sequelize.col('Messages.chatId'), '=', sequelize.col('Chat_members.id')),
                    sequelize.where(sequelize.col('Messages.senderId'), '<>', req.user.id)
                ]
            }
        }],
        group: ['Chat_members.id', 'Messages.id']
    });

    return res.status(200).json({
        messages: messages
    });
}