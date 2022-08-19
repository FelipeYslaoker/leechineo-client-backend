require('dotenv').config();
const db = require('mongoose');

db.connect(process.env.DBURL || '').then(() => {
    console.log('Connected to DB.');
}).catch(e => {
    console.log('Connection with DB failed,', e);
});

db.Promise = global.Promise;

module.exports = db;
