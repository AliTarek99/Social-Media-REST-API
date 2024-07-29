const Minio = require('minio');

const minio = new Minio.Client({
    endPoint: 'encoding-buffer',
    port: 9000,
    useSSL: false,
    accessKey: "My_ID",
    secretKey: "secret_key"
});

exports.client = minio;

exports.errorHandler = err => {
    if(err) return console.log(err);
    console.log('bucket created successfully');
}