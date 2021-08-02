const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');
const config = require('./config');

// Connection to Database
mongoose.connect(config.mongo_connection_url, {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true});
mongoose.connection.on('error', err => console.error(`Error: ${err.message}`));

// Import database models
require('./models/ApiToken');


// Middlewares
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5120kb'}));  //5MB
app.use(bodyParser.urlencoded({ extended: false }));

// Import routes
app.use('/', require('./routes/index'));

// Start Server
let { port } = config;
app.listen(port, () => {
    console.log(`TP/EP Core Service Running On Port ${port}`);
});