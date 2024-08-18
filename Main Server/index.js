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
const { init } = require('./util/sockets');

const app = express();

app.use('/auth', authRouter);

app.use('/message', messageRouter);

app.use('/profile', profileRouter);

app.use('/support', supportRouter);

app.use('/posts', postsRouter);

const server = app.listen(process.env.PORT);

initModels();
await obj.initBuckets(['media']);
await producer.connect();
init(server);