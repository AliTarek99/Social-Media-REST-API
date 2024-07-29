const { Kafka } = require('kafkajs');

exports.kf = new Kafka({ brokers: ["kafka1:9092", "kafka2:9092"], clientId: process.env.KAFKA_CLIENT_ID });

exports.consumer = this.kf.consumer({ groupId: 'Encoding' });