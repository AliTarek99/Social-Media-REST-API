const Minio = require('minio');

const minio = new Minio.Client({
    endPoint: 'encoding-buffer',
    port: 9000,
    useSSL: false,
    accessKey: "My_ID",
    secretKey: "secret_key"
});

exports.client = minio;

exports.initBuckets = async (bucketNames) => {
    let promises = [];
    bucketNames.forEach(value => promises.push(minio.makeBucket(value, '', this.errorHandler)));
    await Promise.all(promises);
}

exports.errorHandler = err => {
    if(err) return console.log(err);
    console.log('bucket created successfully');
}