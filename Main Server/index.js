const express = require('express');
const { initModels } = require('./models/init-models');
const { getdb } = require('./util/db_helper');
const { producer } = require('./util/kafka_helper');
const obj = require('./util/object_store');
const postsRouter = require('./routers/posts');

const server = express();

server.use('/posts', postsRouter);

server.listen(process.env.PORT, async () => {
    const db = getdb();
    initModels(db);
    await obj.initBuckets(['media']);
    await producer.connect();
});