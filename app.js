const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config');
const axios = require('axios');
const app = express();


const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');


// Import database models
require('./models/ApiToken');

// Connection to Database
mongoose.connect(config.mongo_connection_url, {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true});
mongoose.connection.on('error', err => console.error(`Error on database connection: ${err.message}`));


// Middlewares
app.use(bodyParser.json({limit: '5120kb'}));  //5MB
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(mongoSanitize());

// Import routes
app.use('/', require('./routes/index'));

let { port } = config;

// Update api token right after start and schedule for every 50 mimutes
var CronJob = require('cron').CronJob;
var job = new CronJob('*/50 * * * *', async function() {
    console.log('Updating Telenor API Token...')
    await axios({
        method: 'post',
        url: `http://localhost:${port}/core/update-api-token`,
        headers: {'Content-Type': 'application/json'}
    }).then(response => {
        console.log(response.data);
    }).catch(err => {
        console.log("Error updating telenor api token: ", err);
    });
}, null, true, 'America/Los_Angeles', null, true);
job.start();

// Start Server
app.listen(port, () => {
    console.log(`TP/EP Core Service Running On Port ${port}`);
});