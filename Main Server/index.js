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
const { decodejwt } = require('./util/helper');


const app = express();

app.use('/auth', authRouter);

app.use('/message', decodejwt, messageRouter);

app.use('/profile', decodejwt, profileRouter);

app.use('/support', supportRouter);

app.use('/posts', decodejwt, postsRouter);

const server = app.listen(process.env.PORT);

initModels();
obj.initBuckets(['media']);
producer.connect();
init(server);