const mongoose = require('mongoose');

const connectDatabase = () =>
{
    mongoose.connect(process.env.DB_LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(con => {
        console.log(`Mongo DB has been connected to ${con.connection.host}`)
    })
}

module.exports = connectDatabase;