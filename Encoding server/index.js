const minio = require('./util/object_store');
const { consumer } = require('./util/kafka_helper');
const busboy = require('busboy');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const { PassThrough } = require('stream');
const Posts = require("./models/Posts");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

async function init() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['PostWrites'], fromBeginning: true });
}

async function main() {
    await init();
    // Available resolutions
    const resolutions = [
        { width: 1920, height: 1080, name: '1080p' },
        { width: 854, height: 480, name: '480p' }
    ];
    // consume messages from kafka to write posts to the database
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            // parse message content
            message.value = JSON.parse(message.value.toString());
            // split name and file
            let objectname = message.value.media, ext = `.${message.value.media.split('.').pop()}`, tasks = [];
            objectname = objectname.slice(0, objectname.length - ext.length);
            console.log(objectname);
            try {
            // check if there is media in this post
                if (objectname) {
                    // get the content from the buffer server
                    let dataStream = await minio.buffer.getObject('media', message.value.media);
                    if (message.value.mediaType == 'video') {
                        // get the resolution of the video
                        const metadata = await getVideoMetadata(dataStream);
                        tasks = resolutions
                            .filter(res => metadata.width > res.width || metadata.height > res.height)
                            .map(async res => {
                                return encodeStream(res, objectname, ext);
                            });
                        console.log(tasks.length);
                        // wait for the encoding and downscaling if any is being done
                        await Promise.all(tasks).catch(err => console.log(err));

                        if (!tasks.length) {
                            // getting new stream
                            await encodeStream(metadata, objectname, ext);
                        }
                    }
                    else {
                        await minio.objStore.putObject('media', `${objectname}-SD.mp4`, dataStream, (err, etag) => { if (err) return console.log(err); });
                    }

                    console.log('Videos encoded successfully');
                }
                
                // write to the database
                await Posts.create({
                    creatorId: message.value.creatorId,
                    num_of_likes: 0,
                    num_of_comments: 0,
                    media_HD: tasks.length >= 2 ? `${objectname}-HD.mp4` : null,
                    media_SD: tasks.length ? `${objectname}-SD.mp4` : null,
                    caption: message.value.caption
                });
            } catch (error) {
                console.error('Error processing video:', error);
            }
        }
    });
}

const getVideoMetadata = (inputStream) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputStream, (err, metadata) => {
            if (err) return reject(err);
            // extract resolution
            const { width, height } = metadata.streams[0];
            resolve({ width, height });
        });
    });
};

const encodeStream = (resolution, objectname, ext) => {
    return new Promise(async (resolve, reject) => {
        const inputStream = await getObjectStream(objectname + ext);
        const stream = new PassThrough();
        let videoname = `${objectname}-${resolution.height > 480 ? 'HD' : 'SD'}.mp4`;
        console.log('encoding');
        // Pipe the ffmpeg output to MinIO
        try {
            ffmpeg()
                .input(inputStream)
                .size(`${resolution.width}x${resolution.height}`)
                .videoCodec('libx265')
                .format('mp4')
                .pipe(stream, { end: true })
                .on('end', () => {
                    console.log('Encoding finished');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                });

            // Create a writable stream for MinIO
            await minio.objStore.putObject('media', videoname, stream).catch(err => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};

// Helper function to get a new stream from MinIO
const getObjectStream = (objectname) => {
    return new Promise((resolve, reject) => {
        minio.buffer.getObject('media', objectname, (err, stream) => {
            if (err) return reject(err);
            resolve(stream);
        });
    });
};

main();