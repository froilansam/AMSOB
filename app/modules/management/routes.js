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
			results[i].jsonDuration = JSON.parse(results[i].jsonDuration)
			if(results[i].booAuctionType != 0){
				events.push({});
				events[i].id = results[i].intAuctionID;
				events[i].title = 'Auction #'+results[i].intAuctionID;
				events[i].start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
				var endDate = moment(events[i].start).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').format('YYYY-MM-DD HH:mm');
				events[i].end = endDate;
				if(results[i].booAuctionType == 1)
					events[i].color = '#122d59'
				else if (results[i].booAuctionType == 2)
					events[i].color = '#591212'
				//events[i].editable = false;
				results.splice(i,1)
			}
		}

		console.log(results);
		return res.render('management/views/auctionSchedule', {auctionSched: events, unscheduled: results});
	});
});

//Router for 404 Page
router.get('*', (req, res) => {
	console.log('404 Page')
	res.status(404).render('management/views/404');
})


//AJAX 
router.post('/eventDetails', (req, res) => {
	db.query('SELECT * FROM tbl_auction WHERE intAuctionID = ?', [req.body.auctionId], (err, results, fields) =>{
		res.send(results[0]);
	});
})

exports.index = router