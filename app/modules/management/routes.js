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
			if(results[i].booAuctionStatus != 0){
				results[i].jsonDuration = JSON.parse(results[i].jsonDuration)
				events.push({});
				events[i].id = results[i].intAuctionID;
				events[i].title = 'Auction #'+results[i].intAuctionID;
				events[i].start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
				var endDate = moment(events[i].start).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').add(results[i].jsonDuration.minutes, 'm').format('YYYY-MM-DD HH:mm');
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

router.post('/createAuction', (req, res) => {
	console.log(req.body);
	var queryString = `INSERT INTO tbl_auction(jsonDuration, booAuctionType) VALUES (?, 0)`;
	var jsonInsert = JSON.stringify(req.body);
	console.log(jsonInsert);

	db.query(queryString,[jsonInsert], (err, results, fields) =>{
		if(err) console.log(err)

		res.redirect('/auction');
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

router.post('/scheduleAuction', (req, res) => {
	db.query('UPDATE tbl_auction SET datDateStart=?, booAuctionStatus=? WHERE intAuctionID=?', [req.body.datDateStart, 1, req.body.id], (err, results, fields) =>{
		if(err) console.log(err)
		return res.send(true)
	});
});

router.post('/refetchEvents', (req, res) => {
	var events = [];
	db.query('SELECT * FROM tbl_auction WHERE booAuctionStatus = 1', (err, results, fields) => {
		if(err) console.log(err)

		for(var i=0;i<results.length;i++){
			results[i].jsonDuration = JSON.parse(results[i].jsonDuration)
			events.push({});
			events[i].id = results[i].intAuctionID;
			events[i].title = 'Auction #'+results[i].intAuctionID;
			events[i].start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
			var endDate = moment(events[i].start).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').add(results[i].jsonDuration.minutes, 'm').format('YYYY-MM-DD HH:mm');
			events[i].end = endDate;
			if(results[i].booAuctionType == 1)
				events[i].color = '#122d59'
			else if (results[i].booAuctionType == 2)
				events[i].color = '#591212'
		}

		return res.send(events);
	});
});

exports.index = router