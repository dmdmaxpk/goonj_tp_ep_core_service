const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();


const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');


// Import database models
require('./models/ApiToken');

// Connection to Database
mongoose.connect(config.mongo_connection_url, {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true});
mongoose.connection.on('error', err => console.error(`Error: ${err.message}`));


// Middlewares
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5120kb'}));  //5MB
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mongoSanitize());

// Import routes
app.use('/', require('./routes/index'));

// Start Server
let { port } = config;
app.listen(port, () => {
    console.log(`TP/EP Core Service Running On Port ${port}`);
});