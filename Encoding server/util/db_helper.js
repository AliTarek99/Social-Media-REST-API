const sql = require("sequelize");
const cnf = require("../config/config.json");
let db;

exports.getdb = () => {
    if(!db) {
        db = new sql(cnf.development.database, cnf.development.username, cnf.development.password, {
            host: cnf.development.host,
            dialect: cnf.development.dialect,
            port: cnf.development.port,
            // Connection pool settings (optional)
            pool: {
                max: 10,
                min: 0,
                idle: 10000,
            }
        });
    }
    return db;
}