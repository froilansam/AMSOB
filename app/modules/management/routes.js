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
		var unscheduledEvents = results;

		for(var i=0;i<results.length;i++){
			if(results[i].booAuctionStatus != 0){
				results[i].jsonDuration = JSON.parse(results[i].jsonDuration)
				var event = {};
				event.id = results[i].intAuctionID;
				event.title = 'Auction #'+results[i].intAuctionID;
				event.start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
				var endDate = moment(event.start).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').add(results[i].jsonDuration.minutes, 'm').format('YYYY-MM-DD HH:mm');
				event.end = endDate;
				if(results[i].booAuctionType == 1)
					event.color = '#122d59'
				else if (results[i].booAuctionType == 2)
					event.color = '#591212'
				if(results[i].booAuctionStatus == 1)
					event.editable = true;
				else if (results[i].booAuctionStatus == 2 || results[i].booAuctionStatus == 3)
					event.editable = false;
				events.push(event);

				unscheduledEvents = unscheduledEvents.filter(item => item.intAuctionID != i+1);
			}
		}

		console.log('\nNASA CATALOG\n');
		console.log(unscheduledEvents)
		return res.render('management/views/auctionSchedule', {auctionSched: events, unscheduled: unscheduledEvents});
	});
});

router.post('/createAuction', (req, res) => {
	console.log(req.body);
	var queryString = `INSERT INTO tbl_auction(jsonDuration, booAuctionType) VALUES (?, ?)`;
	var auctionType = req.body.auctionType;
	delete req.body.auctionType;
	var jsonInsert = JSON.stringify(req.body);
	console.log(jsonInsert);

	db.query(queryString,[jsonInsert, auctionType], (err, results, fields) =>{
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

/* editType
1 - update inside details including datDateStart(TIME)
2 - datDateStart(DATE) 
*/
router.post('/editAuctionDetails', (req, res) => {
	var queryString;
	if(req.body.editType == 1){
		queryString = `UPDATE tbl_auction SET datDateStart=?, booAuctionType=?, jsonDuration=? WHERE intAuctionID=?`;
		db.query(queryString,[req.body.datDateStart,req.body.booAuctionType,req.body.jsonDuration,req.body.intAuctionID], (err, results, fields) => {
			if(err) console.log(err)

			return res.send(true)
		});
	}
	if(req.body.editType == 2){
		queryString = `UPDATE tbl_auction SET datDateStart=? WHERE intAuctionID=?`;
		db.query(queryString, [req.body.datDateStart, req.body.intAuctionID], (err, results, fields) => {
			if(err) console.log(err)

			return res.send(true)
		})
	}
});

router.post('/refetchEvents', (req, res) => {
	var events = [];
	db.query('SELECT * FROM tbl_auction WHERE booAuctionStatus != 0', (err, results, fields) => {
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
			if(results[i].booAuctionStatus == 1)
				events[i].editable = true;
			else if (results[i].booAuctionStatus == 2)
				events[i].editable = false;
		}

		return res.send(events);
	});
});

exports.index = router