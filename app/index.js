/**
 * Load the 'fs' module for accessing the filesystem of the host
 */
var fs = require('fs');

/**
 * Load the 'path' module for manipulating directory strings
 */
var path = require('path');

/**
 * Export this module as a function accepting 'app', which is an
 * instance of an Express app defined from our main index file, as
 * the first parameter.
 */
module.exports = app => {
    /**
     * Load the bootstrapper for the app. What this does is basically
     * load all the necessary configurations essential to your application.
     */
    require('./core/boot')(app);

    /**
     * A variable to identify the directory of where the application modules
     * can be found.
     */
    var modulesDir = 'modules';

    /**
     * We now read try to read the directory where the modules are. Refer to
     * the comments below for some notes.
     * 
     * path.join() - basically just concatenates directory strings.
     * 
     * __dirname - is a special NodeJS variable that resolves to the current 
     * working directory. https://www.computerhope.com/jargon/c/currentd.htm
     * ...thus for this instance the __dirname would be equal to the full path
     * of the 'app' folder (ex. C:\Users\PC_Name\Web\express\app)
     */
    fs.readdir(path.join(__dirname, modulesDir), (err, modules) => {
        if (err) throw err;

        modules.forEach(moduleDir => {
            var routes = require(`./${modulesDir}/${moduleDir}/routes`);
            Object.keys(routes).forEach(route => {
                app.use(`/${route}`, routes[route]);
            });
        });

        if (!process.env.MAIN) {
            console.log(`
                Your .env file should have a MAIN variable like this:
                MAIN=home/index
                ...this maps the application's index route ('http://localhost:3009')
                to home module's routes.js' index method.
            `);
            throw 'Kindly update your .env configuration file and include a MAIN variable for your main module';
        }
        
        /** Define the main index route of the app and what it should do */
        var mainModule = process.env.MAIN.split('/');
        app.use('/', require(`./modules/${mainModule[0]}/routes`)[mainModule[1]]); 
    });
}