
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const Sequelize = require("sequelize");
const db = {};

var sequelize = new Sequelize(
    null,
    null,
    null,
    {
        dialect: 'sqlite',
        storage: './data/database.sqlite',
        logging: false,
        operatorsAliases: Sequelize.Op,
        sync: { force: false },
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log("SQLite database connection established");
    })
    .catch(err => {
        throw new Error('Unable to connect to SQLite database:', err.message);
    });

fs.readdirSync(__dirname)
    .filter(
        file =>
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
    )
    .forEach(file => {
        let model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;