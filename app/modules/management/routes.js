var express = require('express');
var router = express.Router();
var db = require('../../lib/database')();
const multer = require('multer');
const moment = require('moment');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.jpg')
  }
})
var upload = multer({storage: storage})

router.get('/', (req, res) => {
	res.render('management/views/index')
});

//Consignment Router
router
	.get('/consignment', (req, res) => {
		res.render('management/views/consignment')
	})
	

//Consignor Router
router
	.get('/consignor', (req, res) => {//list of consignors
		var consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID`
		db.query(consignorQuery, (err, results, fields) => {
			if(err) return console.log(err);
			res.render('management/views/consignor', {consignorData: results})		
		});
	})
	.post('/consignor', upload.single('IDPicture'), (req, res) => {//post for insertion of consignor data
		console.log(req.body);
		console.log(req.file);

		if(req.body.consignorType == 0){//if the data is for company
			var consignorQuery = `INSERT INTO tbl_consignor (datDateRegistered, strName, strRepresentativeFirstName, strRepresentativeLastName, strAddress, strPhone, strTelephone, strEmail, 
				strCheckPayable, strIDType, strIDNumber, booConsignorType, strTinNumber, strIDPicture) VALUES (now(),?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
			db.query(consignorQuery, [req.body.companyName, req.body.repFirstName, req.body.repLastName, req.body.companyAddress, req.body.phone, req.body.telephone, req.body.email, req.body.cpName, req.body.IDType, req.body.IDNumber, req.body.TINNumber, req.file.filename], (err, results, fields) => {
				if(err) return console.log(err);
				console.log(fields)
				var insertID = '';
				var smartQuery = `SELECT * FROM tbl_consignor WHERE strEmail = ?`
				db.query(smartQuery, [req.body.email], (err, results, fields) => {
					if(err) return console.log(err);
					insertID = results[0].intConsignorID;
					var consignorData = req.body;
					consignorData.strName = req.body.companyName;
					consignorData.intConsignorID = insertID;
					var credentialsQuery = `INSERT INTO tbl_consignor_accounts (strUsername, intCSConsignorID, booStatus) VALUE (?,?,0)`;
					db.query(credentialsQuery, [req.body.username, insertID], (err, results, fields) => {
						if(err) return console.log(err);
						res.send({indicator: 'success', consignorData: consignorData})	
					})
				})		
			})
		}
		else if(req.body.consignorType == 1){//if data is for personal
			var consignorQuery = `INSERT INTO tbl_consignor (datDateRegistered, strName, strRepresentativeFirstName, strRepresentativeLastName, strAddress, strPhone, strTelephone, strEmail, 
				strCheckPayable, strIDType, strIDNumber, booConsignorType, strIDPicture) VALUES (now(),?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
			db.query(consignorQuery, [req.body.firstName+' '+req.body.lastName, req.body.firstName, req.body.lastName, req.body.address, req.body.phone, req.body.telephone, req.body.email, req.body.cpName, req.body.IDType, req.body.IDNumber, req.file.filename], (err, results, fields) => {
				if(err) return console.log(err);
				console.log(fields)
				var insertID = '';
				var smartQuery = `SELECT * FROM tbl_consignor WHERE strEmail = ?`
				db.query(smartQuery, [req.body.email], (err, results, fields) => {
					if(err) return console.log(err);
					insertID = results[0].intConsignorID;
					var consignorData = req.body;
					consignorData.strName = req.body.firstName + ' ' + req.body.lastName;
					consignorData.intConsignorID = insertID;
					var credentialsQuery = `INSERT INTO tbl_consignor_accounts (strUsername, intCSConsignorID, booStatus) VALUE (?,?,0)`;
					db.query(credentialsQuery, [req.body.username, insertID], (err, results, fields) => {
						if(err) return console.log(err);
						res.send({indicator: 'success', consignorData: consignorData})	
					})
				})				
			})
		}
	})
	.get('/consignor/:intConsignorID', (req, res) => {//view consignor data
		var editQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
		db.query(editQuery, [req.params.intConsignorID], (err, results, fields) => {
			if(err) return console.log(err);
			if(results.length == 0) return res.render('management/views/404')
			results[0].datDateRegistered = moment(results[0].datDateRegistered).format('lll');
			res.render('management/views/editconsignor', {consignorData: results[0]});
		});
	})
	.post('/consignor/data', (req, res) => {// get information ajaxly
		var editQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
		db.query(editQuery, [req.body.intConsignorID], (err, results, fields) => {
			if(err) return console.log(err);
			console.log(results[0])
			results[0].datDateRegistered = moment(results[0].datDateRegistered).format('lll');
			res.send({indicator: 'success', consignorData: results[0]});
		});
	})
	.post('/consignor/update/:intConsignorID', (req, res) => {//- edit information
		var updateQuery = `UPDATE tbl_consignor SET strEmail = ?, strName = ?, strRepresentativeFirstName = ?, strRepresentativeLastName = ?, strAddress = ?, strPhone = ?, strTelephone = ? WHERE intConsignorID = ?`
		db.query(updateQuery, [req.body.strEmail, req.body.strName ,req.body.strRepresentativeFirstName, req.body.strRepresentativeLastName, req.body.strAddress, req.body.strPhone, req.body.strTelephone, req.params.intConsignorID], (err, results, fields) => {
			if(err) return console.log(err);

			var secondUpdateQuery = `UPDATE tbl_consignor_accounts SET strUsername = ? WHERE intCSConsignorID = ?`;
			db.query(secondUpdateQuery, [req.body.strUsername, req.params.intConsignorID], (err, results, fields) => {
				if(err) return console.log(err);
				
				var consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
				db.query(consignorQuery, [req.params.intConsignorID], (err, results, fields) => {
					if(err){
						console.log(err);
						res.send({indicator: 'fail'})	
					}

					res.send({consignorData: results[0], indicator: 'success'})
				})
			})			
		});
	})
	.post('/consignor/requirement/update', upload.single('IDPicture'), (req, res) => {//- edit requirement
		console.log(req.file)
		console.log(req.body)
		if(typeof(req.file) != 'undefined'){
			var updateQuery = `UPDATE tbl_consignor SET strIDType = ?, strTINNumber = ?, strIDNumber = ?, strIDPicture = ? WHERE intConsignorID = ?`
			db.query(updateQuery, [req.body.strIDType, req.body.strTINNumber ,req.body.strIDNumber, req.file.filename, req.body.intConsignorID], (err, results, fields) => {
				if(err) return console.log(err);
				console.log('updateSuccess')
			
				var consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
				db.query(consignorQuery, [req.body.intConsignorID], (err, results, fields) => {
					if(err) return console.log(err);
					
					console.log(results[0])
					res.send({consignorData: results[0], indicator: 'success'})
				})					
			});
		}
		else{
			var updateQuery = `UPDATE tbl_consignor SET strIDType = ?, strTINNumber = ?, strIDNumber = ? WHERE intConsignorID = ?`
			db.query(updateQuery, [req.body.strIDType, req.body.strTINNumber ,req.body.strIDNumber, req.body.intConsignorID], (err, results, fields) => {
				if(err) return console.log(err);
				console.log('updateSuccess')
			
				var consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
				db.query(consignorQuery, [req.body.intConsignorID], (err, results, fields) => {
					if(err) return console.log(err);
					
					console.log(results[0])
					res.send({consignorData: results[0], indicator: 'success'})
				})					
			});
		}
		
	})
	
	

//Form Validation
router
	.post('/usernameavailability', (req, res) => {//Check if username is existing
		var usernameQuery = `SELECT * FROM tbl_consignor_accounts WHERE strUsername = ?`;
		db.query(usernameQuery, [req.body.username], function (err, results, fields) {
			if (err) return console.log(err);
			console.log(results)
			if(results.length > 0){
				console.log('Username is Existing')
				res.send({ "username": false });
			}
			else{
				console.log('Username is Available')
				res.send({ "username": true });
			}
		})
	})
	.post('/emailavailability', (req, res) => {//check if email is existing
		var emailQuery = `SELECT * FROM tbl_consignor WHERE strEmail = ?`;
		db.query(emailQuery, [req.body.email], function (err, results, fields) {
			if (err) return console.log(err);
			console.log(results)
			if(results.length > 0){
				console.log('E-mail is Existing')
				res.send({"email": false });
			}
			else{
				console.log('E-mail is Available')
				res.send({"email": true });
			}
		})
	})
	.post('/usernameavailability/:strUsername', (req, res) => {//Check if username is existing
		var usernameQuery = `SELECT * FROM tbl_consignor_accounts WHERE strUsername = ? AND strUsername != ?`;
		db.query(usernameQuery, [req.body.username, req.params.strUsername], function (err, results, fields) {
			if (err) return console.log(err);
			console.log(results)
			if(results.length > 0){
				console.log('Username is Existing')
				res.send({ "username": false });
			}
			else{
				console.log('Username is Available')
				res.send({ "username": true });
			}
		})
	})
	.post('/emailavailability/:strEmail', (req, res) => {//check if email is existing
		var emailQuery = `SELECT * FROM tbl_consignor WHERE strEmail = ? AND strEmail != ?`;
		db.query(emailQuery, [req.body.email, req.params.strEmail], function (err, results, fields) {
			if (err) return console.log(err);
			console.log(results)
			if(results.length > 0){
				console.log('E-mail is Existing')
				res.send({"email": false });
			}
			else{
				console.log('E-mail is Available')
				res.send({"email": true });
			}
		})
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