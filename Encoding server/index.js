const minio = require('./util/object_store');
const { consumer } = require('./util/kafka_helper');
const busboy = require('busboy');
const fs = require('fs');
const path = require('path')

async function initKafka() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['PostWrites'], fromBeginning: true });
}

async function main() {
    await initKafka();
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            let objectname = message.value.toString();
            console.log(objectname);
            await minio.client.getObject('posts', objectname, (err, dataStream) => {
                // encode
                const writeStream = fs.createWriteStream(path.join(__dirname, objectname));
                dataStream.pipe(writeStream);
                writeStream.on('error', (err) => {
                    console.error('Error writing file:', err);
                });
            });
        }
    });
}

main();