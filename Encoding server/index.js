const minio = require('./util/object_store');
const { consumer } = require('./util/kafka_helper');
const busboy = require('busboy');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { PassThrough } = require('stream');
const _Posts = require("./models/Posts");
const sequelize = require("sequelize");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function init() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['PostWrites'], fromBeginning: true });

    var Posts = _Posts(sequelize, sequelize.DataTypes);

}

async function main() {
    await initKafka();
    const resolutions = [
        { width: 1920, height: 1080, name: '1080p' },
        { width: 854, height: 480, name: '480p' }
    ];
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            let objectname = message.value.toString();
            console.log(objectname);
            await minio.client.getObject('posts', objectname, async(err, dataStream) => {
                try {
                    const metadata = await getVideoMetadata(dataStream);
                    const tasks = resolutions
                      .filter(res => metadata.width > res.width || metadata.height > res.height)
                      .map(res => encodeStream(dataStream, res, objectname));
                    await Promise.all(tasks);
                    console.log('Videos encoded successfully');
                } catch (error) {
                    console.error('Error processing video:', error);
                }
            });
        }
    });
}

const getVideoMetadata = (inputStream) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputStream, (err, metadata) => {
            if (err) return reject(err);
            const { width, height } = metadata.streams[0];
            resolve({ width, height });
        });
    });
  };

const encodeStream = (inputStream, resolution, objectname) => {
    return new Promise((resolve, reject) => {
        const stream = new PassThrough({ autoDestroy: true, });

        // Create a writable stream for MinIO
        minio.client.putObject('posts', `${objectname}-${resolution.height}`, stream, (err, etag) => { if (err) return console.log(err); });

        // Pipe the ffmpeg output to MinIO
        ffmpeg()
        .input(inputStream)
        .videoCodec('libaom-av1')
        .size(`${resolution.width}x${resolution.height}`)
        .output(`${objectname}-${resolution.height}`)
        .pipe(stream, { end: true })
        .on('end', resolve)
        .on('error', reject);
    });
};

main();