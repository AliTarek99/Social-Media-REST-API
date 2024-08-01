const Minio = require('minio');

exports.buffer = new Minio.Client({
    endPoint: 'encoding-buffer',
    port: 9000,
    useSSL: false,
    accessKey: "My_ID",
    secretKey: "secret_key"
});

exports.objStore = new Minio.Client({
    endPoint: 'object-store',
    port: 9000,
    useSSL: false,
    accessKey: "My_ID",
    secretKey: "secret_key"
});

exports.initBuckets = async (bucketNames) => {
    let promises = [];
    bucketNames.forEach(value => {promises.push(this.objStore.makeBucket(value, '', this.errorHandler)), promises.push(this.buffer.makeBucket(value, '', this.errorHandler))});
    await Promise.all(promises);
}

exports.errorHandler = err => {
    if(err) return console.log(err);
    console.log('bucket created successfully');
}