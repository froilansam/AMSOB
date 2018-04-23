var express = require('express');
var router = express.Router();
var moment = require('moment');
var db = require('../../lib/database')();

router.get('/', (req, res) => {
	res.render('management/views/index')
});

router.get('/consignment', (req, res) => {
	res.render('management/views/consignment')
});

router.get('/auction', (req, res) => {
	var queryString = `SELECT * FROM tbl_auction`;
	var events = [];
	db.query(queryString, (err, results, fields) =>{
		if(err) console.log(err)
		console.log(results);

		for(var i=0;i<results.length;i++){
			events.push({});
			events[i].title = 'Auction #'+results[i].intAuctionID;
			events[i].start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
			events[i].end = moment(results[i].datDateEnd).format('YYYY-MM-DD HH:mm');
		}


		return res.render('management/views/auctionSchedule', {auctionSched: events});
	});
});

//Router for 404 Page
router.get('*', (req, res) => {
	console.log('404 Page')
	res.status(404).render('management/views/404');
})

exports.index = router