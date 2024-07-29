const busboy = require('busboy');
const minio = require('../util/object_store');
const { producer } = require('../util/kafka_helper');

exports.uploadPost = async (req, res, next) => {
    const bb = busboy({ headers: req.headers });
    let metadata = {};
    
    bb.on('field', (fieldname, val) => {
        metadata[fieldname] = val;
    });
    req.user = {id: 1};
    let promises = [];
    bb.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
        const objectname = `${req.user.id}-${Date.now()}.${filename.filename.split('.').pop()}`;
        promises.push(minio.client.putObject('posts', objectname, fileStream, metadata, async (err, etag) => {
            if (err) {
                console.error('Error uploading to MinIO:', err);
                return res.status(500).json({ msg: 'Upload error' });
            }
            try {
                console.log('producing');
                promises.push(producer.send({
                    topic: 'PostWrites', 
                    messages: [
                        { value: objectname }
                    ]
                }));
                console.log('produced');
            } catch (produceErr) {
                console.error('Error producing message:', produceErr);
                return res.status(500).json({ msg: 'Produce error' });
            }
        }));
    });
    await Promise.all(promises);
    bb.on('finish', () => {
        console.log('Upload complete');
        res.json({ msg: 'saved' });
    });
    req.pipe(bb);
}