var express = require('express');
var router = express.Router();
var db = require('../../lib/database')();
const multer = require('multer');
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
	.post('/consignment', upload.single('IDPicture'), (req, res) => {
		console.log(req.body);
		console.log(req.file);

		if(req.body.consignorType == 0){
			var consignorQuery = `INSERT INTO tbl_consignor (strName, strRepresentativeName, strAddress, strContact, strEmail, 
				strCheckPayable, strIDType, strIDNumber, booConsignorType, strTinNumber, strIDPicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
			db.query(consignorQuery, [req.body.companyName, req.body.repFirstName+' '+req.body.repLastName, req.body.companyAddress, req.body.phone, req.body.email, req.body.cpName, req.body.IDType, req.body.IDNumber, req.body.TINNumber, req.file.filename], (err, results, fields) => {
				if(err) return console.log(err);
				var insertID = results.insertId;
				var credentialsQuery = `INSERT INTO tbl_consignor_accounts (strUsername, intCSConsignorID, booStatus) VALUE (?,?,0)`;
				db.query(credentialsQuery, [req.body.username, insertID], (err, results, fields) => {
					if(err) return console.log(err);
					res.send('success')	
				})
			})
		}
		else if(req.body.consignorType == 1){
			var consignorQuery = `INSERT INTO tbl_consignor (strName, strRepresentativeName, strAddress, strContact, strEmail, 
				strCheckPayable, strIDType, strIDNumber, booConsignorType, strIDPicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
			db.query(consignorQuery, [req.body.firstName+' '+req.body.lastName, req.body.firstName+' '+req.body.lastName, req.body.address, req.body.phone, req.body.email, req.body.cpName, req.body.IDType, req.body.IDNumber, req.file.filename], (err, results, fields) => {
				if(err) return console.log(err);
				var insertID = results.insertId;
				var credentialsQuery = `INSERT INTO tbl_consignor_accounts (strUsername, intCSConsignorID, booStatus) VALUE (?,?,0)`;
				db.query(credentialsQuery, [req.body.username, insertID], (err, results, fields) => {
					if(err) return console.log(err);
					res.send('success')	
				})
			})
		}

	});

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