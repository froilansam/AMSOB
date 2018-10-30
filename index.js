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

var moment = require('moment');
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.setMaxListeners(0);
io.setMaxListeners(0);
var db = require('./app/lib/database')();

app.use(function(req,res,next){
    req.io = io;
    next();
    req.port = app.get('port');
});

io.on('connection', function(socket){

    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    console.log('socket room: ', socket.room);
    socket.join(socket.room);

    socket.on('bidding', function(price, catalogid){
        console.log('catalog', catalogid);
        io.in(catalogid).in('mainroom').emit('bidding', price, catalogid)
        var bidQuery = `INSERT INTO tbl_bidlist (intBidlistCatalogID, intBidlistBidderID, dblBidPrice, datDateBid) VALUES (?,?,?,now())`
        db.query(bidQuery, [catalogid, socket.bidder.intBidderID, parseFloat(price).toFixed(2)], function(err, results, field){
            if(err) console.log(err);
            var date = moment().format('MMMM Do YYYY, h:mm:ss a');
            io.in(catalogid).emit('history', price, socket.bidder.strUsername, date)
        })
    })
    socket.on('monitoring', (itemId, newStatus, consignmentId, callback) =>{
        console.log(`SINEND{itemId: ${itemId}, newStatus: ${newStatus}, consignmentId: ${consignmentId}}`)
        io.in(`monitor${consignmentId}`).emit('updateStatus', itemId, newStatus)
        return callback();
    })

    socket.on('newConsignor', () =>{
        console.log('luuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuh');
        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New Consignor sent an application.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
            io.emit('newNotif', 'New Consignor sent an application.', 0 , moment(new Date).fromNow());
            console.log('New Consignor')

        }) 
    })

    socket.on('newBidder', () =>{

        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New Bidder sent an application.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
            io.emit('newNotif', 'New Bidder sent an application.', 0 , moment(new Date).fromNow());
            console.log('New Bidder')

        }) 
    })

    socket.on('paymentAwards', () =>{

        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New pending award payment.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
            console.log('===========')
            io.emit('newNotif', 'New pending award payment.', 0 , moment(new Date).fromNow());
            console.log('New Pending Payment')

        }) 
    })

    socket.on('paymentRegistration', () =>{

        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New pending registration payment.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
            io.emit('newNotif', 'New pending registration payment.', 0 , moment(new Date).fromNow());
            console.log('New Pending Registration Payment')

        }) 
    })
});
/**
 * We now pass the app instance to a custom module 'app' for bootstrapping
 * Refer to this link for what boostrapping means: https://stackoverflow.com/a/1254561
 */


require('./app')(app);

/**
 * This tells the app instance to listen to a certain port for any requests
 */
server.listen(app.get('port'), () => {
    console.log(`ExpressJS server listening to port ${app.get('port')}`);
});