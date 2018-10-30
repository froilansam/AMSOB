require('dotenv').config();
var express = require('express');
var app = express();

/* Moment JS is a module to parse, validate, manipulate, and display dates and times in JavaScript.
*/
var moment = require('moment');

/* Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server
*/
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.setMaxListeners(0);
io.setMaxListeners(0);

/* Create pooling for database connection
*/

var db = require('./app/lib/database')();

/* To pass the io function to request
*/

app.use(function(req,res,next){
    req.io = io;
    next();
    req.port = app.get('port');
});

/* Socket.io Listener */ 

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
        io.in(`monitor${consignmentId}`).emit('updateStatus', itemId, newStatus)
        return callback();
    })

    socket.on('newConsignor', () =>{
        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New Consignor sent an application.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
            io.emit('newNotif', 'New Consignor sent an application.', 0 , moment(new Date).fromNow());
            console.log('New Consignor has registered.')

        }) 
    })

    socket.on('newBidder', () =>{

        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New Bidder sent an application.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
            io.emit('newNotif', 'New Bidder sent an application.', 0 , moment(new Date).fromNow());
            console.log('New Bidder has registered.')

        }) 
    })

    socket.on('paymentAwards', () =>{

        var notifQuery = `INSERT INTO tbl_notification (strNotifTo, strNotifMessage, booNotifRead, datNotifDate) VALUES (?,?,?,?)`
        db.query(notifQuery, ['admin', 'New pending award payment.', 0, new Date], (err, results, field) => {
            if(err) console.log(err);
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

/* Socket Listener */ 


require('./app')(app);

server.listen(app.get('port'), () => {
    console.log(`ExpressJS server listening to port ${app.get('port')}`);
});