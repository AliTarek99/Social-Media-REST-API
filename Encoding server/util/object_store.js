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