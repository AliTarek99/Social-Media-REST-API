const busboy = require('busboy');
const minio = require('../util/object_store');
const { producer } = require('../util/kafka_helper');

exports.uploadPost = async (req, res, next) => {
    const bb = busboy({ headers: req.headers });
    let metadata = {};

    bb.on('field', (fieldname, val) => {
        metadata[fieldname] = val;
    });
    req.user = { id: 1 };///////////////////////////////delete
    let media = undefined, mtype;
    bb.on('file', async (fieldname, fileStream, { filename, encoding, mimeType }) => {
        // check the mimeType to ensure it is media
        if (['video/mp4', 'video/webm', 'video/mpeg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].indexOf(mimeType) == -1) return res.status(400).json({msg: 'invalid mimeType.'});
        // construct file name
        const objectname = `${req.user.id}-${Date.now()}.${filename.split('.').pop()}`;
        // mark that there is media in this post and save its name
        media = objectname, mtype = mimeType;

        // forward stream to encoding buffer
        await minio.buffer.putObject('media', objectname, fileStream, async (err, etag) => {
            if (err) {
                console.error('Error uploading to MinIO:', err);
                return res.status(500).json({ msg: 'Upload error' });
            }
            // produce event to kafka topic
            await producer.send({
                topic: 'PostWrites',
                messages: [
                    { 
                        value: JSON.stringify({
                            media: media,
                            repostedId: metadata.repostedId,
                            creatorId: req.user.id,
                            caption: metadata.caption,
                            mediaType: ['video/mp4', 'video/webm', 'video/mpeg'].indexOf(mtype) !== -1 ? 'video' : 'image'
                        }) 
                    }
                ]
            });
        });
    });

    bb.on('finish', async() => {
        try {
            console.log('producing');
            // check if the post does not contain any data to dismiss it
            if (!media && !metadata.caption) return res.status(400).json({ msg: "at least provide caption or media" });
            console.log('produced');
        } catch (produceErr) {
            console.error('Error producing message:', produceErr);
            return res.sendStatus(500);
        }
        console.log('Upload complete');
        res.sendStatus(201);
    });
    req.pipe(bb);
}

exports.getMedia = (req, res, next) => {
    const objectName = req.params.objectName;
    // get stream from object store
    minioClient.getObject('media', objectName, (err, dataStream) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        dataStream.on('error', (err) => {
            console.log(err);
            return res.sendStatus(500);
        });

        // write data to stream
        dataStream.on('data', (chunk) => {
            res.write(chunk);
        });

        dataStream.on('end', () => {
            res.end();
        });
    });
}

// Function to handle the GET request for retrieving a specific post
exports.getPost = (req, res, next) => {
  
}

// Function to handle the GET request for retrieving the timeline
exports.getTimeline = (req, res, next) => {
  
}

// Function to handle the GET request for retrieving comments of a post
exports.getComments = (req, res, next) => {
  
}

// Function to handle the POST request for adding a comment to a post
exports.comment = (req, res, next) => {
  
}

// Function to handle the POST request for liking a post
exports.like = (req, res, next) => {
  
}

// Function to handle the POST request for saving a post
exports.save = (req, res, next) => {
  
}

// Function to handle the POST request for unliking a post
exports.unlike = (req, res, next) => {
  
}

// Function to handle the POST request for unsaving a post
exports.unsave = (req, res, next) => {
  
}

// Function to handle the GET request for retrieving likes of a post
exports.getLikes = (req, res, next) => {
  
}

// Function to handle the POST request for sharing a post
exports.share = (req, res, next) => {
  
}

// Function to handle the DELETE request for deleting a post
exports.deletePost = (req, res, next) => {
  
}

// Function to handle the POST request for reporting a post
exports.reportPost = (req, res, next) => {
  
}
