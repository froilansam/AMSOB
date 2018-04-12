/**
 * The 'dotenv' module basically reads data from a .env file
 * and loads it to process.env
 * 
 * Refer to https://github.com/motdotla/dotenv for the official documentation
 */
require('dotenv').config();

/**
 * This imports the ExpressJS module
 */
var express = require('express');

/**
 * Here we are creating a new ExpressJS app
 */
var app = express();

/**
 * We now pass the app instance to a custom module 'app' for bootstrapping
 * Refer to this link for what boostrapping means: https://stackoverflow.com/a/1254561
 */
require('./app')(app);

/**
 * This tells the app instance to listen to a certain port for any requests
 */
app.listen(app.get('port'), () => {
    console.log(`ExpressJS server listening to port ${app.get('port')}`);
});