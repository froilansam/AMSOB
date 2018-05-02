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
				strCheckPayable, strIDType, strIDNumber, booConsignorType, strTinNumber, strIDPicture) VALUES (now(),?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
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
				strCheckPayable, strIDType, strIDNumber, booConsignorType, strIDPicture) VALUES (now(),?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
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
	});

router.get('/auction', (req, res) => {
	res.render('management/views/auctionSchedule')
});


//Router for 404 Page
router.get('*', (req, res) => {
	console.log('404 Page')
	res.status(404).render('management/views/404');
})

exports.index = router