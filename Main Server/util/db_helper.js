const sql = require("sequelize");
const cnf = require("../config/config.json");
let db;

exports.getdb = () => {
    if(!db) {
        db = new sql(cnf.replication.write.database, cnf.replication.write.username, cnf.replication.write.password, {
            host: cnf.replication.write.host,
            dialect: cnf.replication.write.dialect,
            port: cnf.replication.write.port,
            // Connection pool settings (optional)
            pool: {
                max: 5,
                min: 0,
                idle: 10000,
            },
            // Replication configuration
            replication: {
            read: cnf.replication.read, // Array of replica configurations
            }
        });
    }
    return db;
}