var fs = require('fs');
var path = require('path');
module.exports = app => {
    require('./core/boot')(app);
    var modulesDir = 'modules';
    fs.readdir(path.join(__dirname, modulesDir), (err, modules) => {
        if (err) throw err;

        modules.forEach(moduleDir => {
            var routes = require(`./${modulesDir}/${moduleDir}/routes`);
            Object.keys(routes).forEach(route => {
                app.use(`/${route}`, routes[route]);
            });
        });
        
        var mainModule = process.env.MAIN.split('/');
        app.use('/', require(`./modules/${mainModule[0]}/routes`)[mainModule[1]]); 
    });
}