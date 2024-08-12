const express = require('express');
const initModels = require('./models/init-models');
const { getdb } = require('./util/db_helper');
const { producer } = require('./util/kafka_helper');
const obj = require('./util/object_store');
const postsRouter = require('./routers/posts');
const authRouter = require('./routers/authentication');
const profileRouter = require('./routers/profiles')
const supportRouter = require('./routers/support');
const messageRouter = require('./routers/messaging');

const server = express();

server.use('/auth', authRouter);

server.use('/message', messageRouter);

server.use('/profile', profileRouter);

server.use('/support', supportRouter);

server.use('/posts', postsRouter);

server.listen(process.env.PORT, async () => {
    const db = getdb();
    initModels();
    await obj.initBuckets(['media']);
    await producer.connect();
});