var express = require('express');
var router = express.Router();
var routerConsignor = express.Router();
var db = require('../../lib/database')();
const multer = require('multer');
const moment = require('moment');
var MA = require('moving-average');

var renameKeys = require('rename-keys');
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/assets/uploads')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now()+'.jpg')
	}
})
var upload = multer({storage: storage})
var ip = require('ip');
var publicIp = require('public-ip');

var authMiddleware = require('../auth/middlewares/auth');




//Log In Page
router.use(authMiddleware.consignorLoggedIn)
router
			.get('/', (req, res) => {//- login
        req.session.consignor = ""
					res.render('consignor/views/login', {url: req.query.redirect, hostname: req.hostname, port: req.port})
			})
			.post('/', upload.single('IDPicture'), (req, res) => {//post for insertion of consignor data
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
							var credentialsQuery = `INSERT INTO tbl_consignor_accounts (strUsername, intCSConsignorID, strPassword, booStatus) VALUES (?,?,?,2)`;
							db.query(credentialsQuery, [req.body.username, insertID, req.body.enterPassword], (err, results, fields) => {
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
							var credentialsQuery = `INSERT INTO tbl_consignor_accounts (strUsername, intCSConsignorID, strPassword, booStatus) VALUES (?,?,?,2)`;
							db.query(credentialsQuery, [req.body.username, insertID, req.body.enterPassword], (err, results, fields) => {
								if(err) return console.log(err);
								res.send({indicator: 'success', consignorData: consignorData}) 
							})
						})    
					})
				}
			})
 .post('/authentication', (req, res) => {//post for logging in
	console.log(req.body)
	var loginQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE strUsername = ? AND strPassword = ? AND booStatus = 0`
	db.query(loginQuery, [req.body.username, req.body.password], (err, results, fields) => {
		if (err) return console.log(err);

		if(results.length == 0){
			res.send({indicator: 'failed'});
		}
		else{
      var onlineQuery = `UPDATE tbl_consignor SET booOnline = 1 WHERE intConsignorID = ?`;
      db.query(onlineQuery, [results[0].intConsignorID], (err, resulta, field) => {
        if(err) console.log(err)
        var localIp = ip.address();
        var ipPublic;
        console.log(req.ipv4)
        // publicIp.v4().then(ipv4 =>{
        // 	ipPublic = ipv4;
        // 	db.query('INSERT INTO tbl_consignor_account_logs(intCALogCAID, datDateLogin, strLocalIP, strPublicIP) VALUES(?, ?, ?, ?)', [results[0].intConsignorAccountsID, moment().format('YYYY-MM-DD HH:mm'), localIp, ipPublic], (err, results, fields) => {
        // 		if(err) console.log(err);
        // 	})
        // })

        
        delete results[0].strPassword;
        req.session.consignor = results[0];
        res.send({indicator: 'success', url: req.query});
        res.end();
      })
		}
	})
})

router.post('/query/idtypes', (req, res) => {
	db.query('SELECT * FROM tbl_id_types WHERE booStatus = 0', (err, results, fields) => {
		if(err) console.log(err)

		console.log(results)
		res.send({ids:results})
	})
})
router.get('/landing', (req, res) => {
  res.render('consignor/views/landing')
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



var arr = []
var arrJSON = []

//Consignor Home
routerConsignor.get('/logout', (req, res) => {
    var onlineQuery = `UPDATE tbl_consignor SET booOnline = 0 WHERE intConsignorID = ?`;
    db.query(onlineQuery, [req.session.consignor.intConsignorID], (err, resulta, field) => {
        delete req.session.consignor;
        res.redirect('/consignorportal');
    })
})
routerConsignor.use(authMiddleware.consignorNotLoggedIn);
routerConsignor
   .get('/', (req, res) => {//dashboard
      
      
		 res.render('consignor/views/dashboard', {session: req.session})
			})
			.get('/consignment', (req, res) => {
				arrJSON = []
				arr= []
				delete req.session.asset;
				let consignmentQuery = `SELECT * FROM tbl_consignment WHERE intConsignmentConsignorID = ?`
				db.query(consignmentQuery, [req.session.consignor.intConsignorID], function (err, results, fields) {
					if(err) return console.log(err);

					if(results.length > 0){
						for(var i = 0; i < results.length; i++){
							results[i].datDateCreated = moment(results[i].datDateCreated).format('LL')
							results[i].datDateReceived = moment(results[i].datDateReceived).format('LL')
							if(i == results.length - 1){
								res.render('consignor/views/viewconsignment', {consignments: results, session: req.session})
							}
						}
					}
					else{
						res.render('consignor/views/viewconsignment', {session: req.session})
					}
				});
			})
			.get('/consignment/create', (req, res) => {//dashboard
		 res.render('consignor/views/addconsignment', {consignor: req.session.consignor, asset: req.session.asset})
			})
			.get('/consignment/print/:intConsignmentID', (req, res) => {//dashboard
				let printQuery = `SELECT * FROM tbl_consignment JOIN tbl_consignment_item ON intCIConsignment = intConsignmentID WHERE intConsignmentID = ?`
				db.query(printQuery, [req.params.intConsignmentID], function (err, results, fields) {
					if(err) return console.log(err);
					if(results.length == 0) return res.status(404).render('management/views/404');
					if(results[0].intConsignmentConsignorID != req.session.consignor.intConsignorID) return res.redirect('/consignorhome/consignment')

					for(var i = 0; i < results.length; i++){
						results[i].jsonOtherSpecifications = JSON.parse(results[i].jsonOtherSpecifications)
						results[i].datDateCreated = moment(results[i].datDateCreated).format('LL')
						if(i == results.length - 1)
							res.render('consignor/views/print', {consignor: req.session.consignor, asset: results, session: req.session})        
					}
					
				})
				
      });      
routerConsignor.post('/delete/consignment', (req, res) => {//delete consignment
    console.log('/delete/consignment', req.body)
    console.log(req.session.consignor)
		var deleteQuery = `DELETE FROM tbl_consignment WHERE intConsignmentID = ? AND intConsignmentConsignorID = ?;`
		db.query(deleteQuery, [req.body.consignmentid, req.session.consignor.intConsignorID],(err, results, fields) => {
			if(err) return console.log(err);
			res.send({indicator: true, id: req.body.consignmentid})
			res.end();
		});
	})
routerConsignor.post('/consignment/create/count', (req, res) => {//dashboard
	if(req.session.asset){

		res.send({count: req.session.asset.length})
	}
	else{
		res.send({count: 0})    
	}
});      
routerConsignor.post('/consignment/create', (req, res) => {//dashboard
				let quantity =req.body.asset.quantity
				let description =req.body.asset.description

				delete req.body.asset.quantity;
				delete req.body.asset.description;
				console.log('quan', quantity)
				if(arr.includes(JSON.stringify(req.body.asset))){
					console.log('Item has already been added');
          res.send({indicator: 'Duplicate'})
				}
				else{
					asset = req.body.asset
					arr.push(JSON.stringify(asset));
					console.log(arr);
					console.log('obrigado', req.session.asset)
					if(req.session.asset){
						if(req.session.asset.length > 0){
							var highest = parseInt(req.session.asset[0].id)
							for(var i = 0; i < req.session.asset.length; i++){
								if(highest < parseInt(req.session.asset[i].id)){
									highest = parseInt(req.session.asset[i].id)
								}

								if(i == req.session.asset.length-1){
									asset['id'] = highest + 1;
								}
							}
						}
					}
					else{
						asset['id'] = 1;
					}
					asset['quantity'] = quantity;
					asset['description'] = description;
					arrJSON.push(asset)
					req.session.asset = arrJSON;
					console.log(arrJSON);
					console.log('-----')
					console.log(req.session.asset);
					res.send({indicator: 'success', asset: asset})
					res.end();
				}
			})

routerConsignor.post('/consignment/edit', (req, res) => {//edit asset
				console.log(req.body)
				for(var i = 0; i < req.session.asset.length; i++){
					if(req.body.assetId == req.session.asset[i].id){
						console.log(req.session.asset[i])
						res.send({asset: req.session.asset[i]})
						res.end();
					}
				}
			})
routerConsignor.post('/consignment/delete', (req, res) => {//edit asset
        console.log(req.body.assetId)
        console.log(req.session.asset)
				for(var i = 0; i < req.session.asset.length; i++){
					if(req.session.asset[i].id == req.body.assetId ){
						req.session.asset.splice(i, 1)
						arr.splice(i, 1)
						arrJSON.splice(i, 1)
						console.log('The results are in:')
						console.log(req.session.asset)
						console.log('-------')
						console.log(arr);
						console.log('-------')
						console.log(arrJSON);
						res.send({indic: 'success'})
						res.end()
					}
				}
      })
      
routerConsignor.post('/consignment/savechanges', (req, res) => {//dashboard
        let quantity = parseInt(req.body.asset.quantity)
        let description =req.body.asset.description
        req.body.asset.price = parseInt(req.body.asset.price) 
        delete req.body.asset.quantity;
        delete req.body.asset.description;
        console.log('quan', quantity)
        if(arr.includes(JSON.stringify(req.body.asset))){
          console.log('Item has already been added');
          res.send({indicator: 'Duplicate'})
        }
        else{
          asset = req.body.asset
          arr.push(JSON.stringify(asset));
          console.log(arr);
          console.log('obrigado', req.session.asset)
          asset['id'] = req.body.assetId;
          asset['quantity'] = quantity;
          asset['description'] = description;
          arrJSON.push(asset)
          req.session.asset = arrJSON;
          console.log(arrJSON);
          console.log('-----')
          console.log(req.session.asset);
          res.send({indicator: 'success', asset: asset})
          res.end();
        }
      })
routerConsignor.post('/consignment/submit', (req, res) => {//edit asset
				if(typeof req.session.asset == 'undefined' || req.session.asset.length == 0){
					return res.send({indicator:'invalid'})
				}
				console.log(req.session.consignor)
				console.log(req.session.asset)
				for(var i = 0; i < req.session.asset.length; i++){
					req.session.asset[i] = renameKeys(req.session.asset[i], function(key, val) {
						return capitalizeFirstLetter(key)
					});
					console.log(req.session.asset[i]);
					if(i == req.session.asset.length - 1){
							var text = "";
							var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

							for (var i = 0; i < 8; i++)
								text += possible.charAt(Math.floor(Math.random() * possible.length));
							

							var submitQuery = `INSERT INTO tbl_consignment (datDateCreated, intConsignmentConsignorID, booStatus, strConsignmentCode) VALUES (now(), ?,?,?);`
							db.query(submitQuery, [req.session.consignor.intConsignorID, 0, text], function (err, results, fields) {
								if(err) return console.log(err);
								let insertId = results.insertId;
								for(var i = 0; i < req.session.asset.length; i++){
									let description = req.session.asset[i].Description
									let price = req.session.asset[i].Price
									let category = req.session.asset[i].Category
									let quantity = req.session.asset[i].Quantity
									let UOM =  req.session.asset[i].UOM
									delete req.session.asset[i].Description
									delete req.session.asset[i].Price
									delete req.session.asset[i].Category
									delete req.session.asset[i].Quantity
									delete req.session.asset[i].UOM
									delete req.session.asset[i].Id
									console.log("req.session", req.session.asset[i])

									insertDeadlock(insertId, description, price, category, UOM, req.session.asset[i], quantity)
									
									function insertDeadlock(insertId, description, price, category, UOM, asset, quantity){

										var assetQuery = `INSERT INTO tbl_consignment_item (intCIConsignment, strItemDescription, booPrice, strCategory, booItemStatus, strUOM, jsonOtherSpecifications, intQTY, booIsReceived, booIsBundled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
										db.query(assetQuery, [insertId, description, price, category, 0, UOM, JSON.stringify(asset), quantity, 0, 0], function (err, results, fields) {
											if(err){
												console.log(err)
												if(err.errno == 1213){
													insertDeadlock(insertId, description, price, category, UOM, asset, quantity);
												}
												else if(err.errno == 1062){
													insertDeadlock(insertId, description, price, category, UOM, asset, quantity);                          
												}
											}
											else{
												req.session.asset = []
											}
											
										});
									}

									if(i == req.session.asset.length -1){
										res.send({indicator: 'success', intConsignmentID: insertId})
										res.end();
									}
								}


							});        

					}
				}
			})
  
routerConsignor.post('/pullout', (req, res) => {
  var pulloutQuery = `SELECT * FROM tbl_consignment_item JOIN tbl_consignment WHERE intTimesInAuction >= 3 AND intConsignmentConsignorID = ?`
  db.query(pulloutQuery, [req.session.consignor.intConsignorID], (err, results, field) =>{
    if(err) console.log(err);
    if(results.length>0){
      var unsold = results
      for(var i = 0; i < results.length; i++){
        var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARDAuctionResultID, booType) VALUES (?, ?, ?, ?)`
        db.query(insertQuery, [unsold[i].jsonOtherSpecifications, unsold[i].strItemID, req.body.intAuctionResultID, 5], (err, results, field) => {
          if(err) return console.log(err);

        })
        if(i == results.length -1){
          res.send({indicator: true, pullout: results});
          res.end();
        }
      }
    }
    else{
      res.send({indicator: true})
    }
  })
})


routerConsignor.post('/unsold', (req, res) => {
		 var unsoldQuery = `SELECT *, tbl_bidlist.booStatus AS thestatus
		 FROM tbl_consignment_item 
		 JOIN tbl_consignment 
			ON intCIConsignment = intConsignmentID 
		 JOIN tbl_catalog 
			ON strCatalogItemID = strItemID 
		 JOIN tbl_auction 
			ON intAuctionID = intCatalogAuctionID 
		 JOIN tbl_bidlist 
			ON intCatalogID = intBidlistCatalogID`
 db.query(unsoldQuery, [req.session.consignor.intConsignorID, req.body.intAuctionID ], (err, results, field) => {
		if(err) return console.log(err);
		if(results.length > 0){
			console.log('=====unsold====')
			console.log(results)
			var unsold = results;

			for(var i = 0; i < unsold.length; i++){
				if(unsold[i].thestatus == 1 && unsold[i].intAuctionID == req.body.intAuctionID && unsold[i].intConsignmentConsignorID == req.session.consignor.intConsignorID && unsold[i].intBidlistBidderID == 0){
				{   
					console.log('lolunsold')
					var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARDAuctionResultID, booType) VALUES (?, ?, ?, ?)`
					db.query(insertQuery, [unsold[i].jsonOtherSpecifications, unsold[i].strItemID, req.body.intAuctionResultID, 3], (err, results, field) => {
						if(err) return console.log(err);

					})
				}        
				if(i == unsold.length -1){
					res.send({indicator: true, unsold: unsold});
					res.end();
				}
			}
		}
		}
		else{
			res.send({indicator: true})
		}
 });
})

routerConsignor.post('/cancelled', (req, res) => {
 var cancelledQuery = `SELECT *
     FROM tbl_consignment_item
     JOIN tbl_consignment
      ON intCIConsignment = intConsignmentID
     JOIN tbl_catalog
      ON strCatalogItemID = strItemID
     JOIN tbl_auction
      ON intAuctionID = intCatalogAuctionID
     JOIN tbl_bidlist
      ON intCatalogID = intBidlistCatalogID
     JOIN tbl_sales_invoice_details
      ON intBidlistID = intRDBidlistID
     JOIN tbl_sales_invoice
      ON intSIDSalesInvoiceID = intSalesInvoiceID`
 db.query(cancelledQuery, [req.session.consignor.intConsignorID, req.body.intAuctionID ], (err, results, field) => {
    if(err) return console.log(err);
    if(results.length > 0){
      console.log('=====cancelled====')
      console.log(results)
      var cancelled = results;
      for(var i = 0; i < cancelled.length; i++){
        if(cancelled[i].booSIStatus == 4 && cancelled[i].intAuctionID == req.body.intAuctionID && cancelled[i].intConsignmentConsignorID == req.session.consignor.intConsignorID && cancelled[i].intBidlistBidderID != 0){
        {
          console.log('caaaancelled')
          var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARDAuctionResultID, booType, intARQTY) VALUES (?, ?, ?, ?, ?)`
          db.query(insertQuery, [cancelled[i].jsonOtherSpecifications, cancelled[i].strItemID, req.body.intAuctionResultID, 2, cancelled[i].intSIDQty], (err, results, field) => {
            if(err) return console.log(err);

          })
        }
        if(i == cancelled.length -1){
          res.send({indicator: true, cancelled: cancelled});
          res.end();
        }
      }
      }
    }
    else{
      res.send({indicator: true})
    }
  })
})

// routerConsignor.post('/payable', (req, res) => {

//   var fuckQuery = `SELECT *
//      FROM tbl_consignment_item
//      JOIN tbl_consignment
//       ON intCIConsignment = intConsignmentID
//      JOIN tbl_catalog
//       ON strCatalogItemID = strItemID
//      JOIN tbl_auction
//       ON intAuctionID = intCatalogAuctionID
//      JOIN tbl_bidlist
//       ON intCatalogID = intBidlistCatalogID
//      JOIN tbl_sales_invoice_details
//       ON intBidlistID = intRDBidlistID
//      JOIN tbl_sales_invoice
//       ON intSIDSalesInvoiceID = intSalesInvoiceID`;
//  db.query(fuckQuery, [req.session.consignor.intConsignorID, req.body.intAuctionID ], (err, results, field) => {
//     if(err) return console.log(err);
//     if(results.length > 0){
//       console.log('=====payable====')
//       console.log(results);
//       var payable = results

//       for(var i = 0; i < payable.length; i++){
//         if(payable[i].booSIStatus != 4 && payable[i].booSIStatus != 0 && payable[i].intAuctionID == req.body.intAuctionID && payable[i].intConsignmentConsignorID == req.session.consignor.intConsignorID && payable[i].intBidlistBidderID != 0){
//           console.log('YES')
//           var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARReceiptID, dblCommission, dblHammerPrice, intARDAuctionResultID, booType, intARQTY) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
//           db.query(insertQuery, [payable[i].jsonOtherSpecifications, payable[i].strItemID, payable[i].intOrderID, payable[i].intComission, payable[i].dblSIDBidPrice, req.body.intAuctionResultID, 1, payable[i].intSIDQty], (err, results, field) => {
//             if(err) return console.log(err);

//           })
//         }
//         if(i == payable.length -1){
//           res.send({indicator: true, payable: payable});
//           res.end();
//         }
//       }
//     }
//     else{
//       res.send({indicator: true})
//     }
// })
// })
routerConsignor.get('/auctionresults', (req, res) => {
  var auctQuery = `SELECT * FROM tbl_auction WHERE datDateEnd IS NOT NULL;`
  db.query(auctQuery, (err, results, field) => {
    if(err) console.log(err);
    if(results.length > 0){
      var auctions = results
      var utilitiesQuery = `SELECT * FROM tbl_utilities`
        db.query(utilitiesQuery, (err, results, field) => {
          if(err) console.log(err);
          if(results.length > 0){
            console.log('==============')
            req.session.utilities = results[0];
            console.log(req.session.utilities)
            for(var i = 0; i < auctions.length; i++){
              auctions[i].datDateEnd = moment(auctions[i].datDateEnd).format('MMMM DD, YYYY hh:mm:ss a')
              var datShouldPay = moment(auctions[i].datDateEnd.toString()).add(3, 'days')
              auctions[i].datShouldPay = moment(datShouldPay).format('MMMM DD, YYYY hh:mm:ss a')
              if(i == auctions.length - 1){
                console.log(auctions);
                res.render('consignor/views/auctionresults', {session: req.session, auctions: auctions});
              }
            }
          }
        })
    }
  })
})

routerConsignor.post('/checkauctionresult', (req, res) => {
  var auctQuery = `SELECT * FROM tbl_auctionresult WHERE intARConsignorID = ? AND intARAuctionID = ?;`
  db.query(auctQuery, [req.session.consignor.intConsignorID, req.body.intAuctionID], (err, results, field) => {
    if(err) console.log(err);
    console.log(results)
    if(results.length > 0){
      res.send({indicator: true, auction: results[0]})
    }
    else{
      res.send({indicator: false, auctionID: req.body.intAuctionID})      
    }
  })
  
})

routerConsignor.get('/auctionresult/:intAuctionID', (req, res) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  var auctionQuery = `SELECT * FROM tbl_auction WHERE intAuctionID = ?`
  db.query(auctionQuery, [req.params.intAuctionID], (err, results, field) => {
    if(err) console.log(err)

    if(results.length > 0){

      var arQuery = `INSERT INTO tbl_auctionresult (intARConsignorID, intARAuctionID, strARCode, booARStatus) VALUES (?, ?, ?, ?)`
      db.query(arQuery, [req.session.consignor.intConsignorID, req.params.intAuctionID, text, 0], (err, results, field) => {
        if(err){
          if(err.errno == 1062){
            var findQuery =  `SELECT * FROM tbl_auctionresult JOIN tbl_ar_detail ON intAuctionResultID = intARDAuctionResultID WHERE intARConsignorID = ? AND intARAuctionID = ?`;
            db.query(findQuery, [req.session.consignor.intConsignorID, req.params.intAuctionID], (err, results, field) => {
              if(err) return console.log(err);
              if(results.length > 0){
                console.log(results)
                console.log('^^^^^^^^^^^^')
                for(var i = 0; i < results.length; i++){
                  console.log('tangina ano na')
                  if(results[i].strARItemID.charAt(0) == 'I'){
                      results[i].strARJson = JSON.parse(results[i].strARJson)
                      console.log(results[i].strARJson)
                    }
                  if(i == results.length - 1){
                    res.render('consignor/views/auctionresult', {consignor: req.session.consignor, intAuctionID: req.params.intAuctionID, util: req.session.utilities, insertId: results[0].intAuctionResultID, consignor: req.session.consignor, code: results[0].strARCode, sign: 0, dataRes: results, intARConsignorID: req.body.intConsignorID})
                  }
                }
              }
              else{
                res.redirect('/consignorhome')
              }
            })
          }
        }
        else{
          insertId = results.insertId;



          async function firstFunct(req, insertId){
            await issue(req, insertId)
            console.log(1)
            await payableSingle(req, insertId)
            console.log(1)
            await payableBundle(req, insertId)
            console.log(2)            
            await cancelledSingle(req, insertId)
            console.log(3)            
            await cancelledBundle(req, insertId)
            console.log(4)            
            await unsoldSingle(req, insertId)
            console.log(5)            
            await unsoldBundle(req, insertId)
            console.log(6)            
            await pullOut(req, insertId)

            return Promise.resolve(1);
          }

          async function mainFunct(req, insertId){
            await firstFunct(req, insertId);
            console.log('----hayip----')

            setTimeout(function(){
              var findQuery =  `SELECT * FROM tbl_auctionresult JOIN tbl_ar_detail ON intAuctionResultID = intARDAuctionResultID WHERE intARConsignorID = ? AND intARAuctionID = ?`;
              db.query(findQuery, [req.session.consignor.intConsignorID, req.params.intAuctionID], (err, results, field) => {
                if(err) return console.log(err);
                if(results.length > 0){
                  console.log(results)
                  console.log('^^^^^^^^^^^^')
                  for(var i = 0; i < results.length; i++){
                    if(results[i].strARItemID.charAt(0) == 'I'){
                      results[i].strARJson = JSON.parse(results[i].strARJson)
                    }
                    if(i == results.length - 1){
                      res.render('consignor/views/auctionresult', {consignor: req.session.consignor, intAuctionID: req.params.intAuctionID, util: req.session.utilities, insertId: results[0].intAuctionResultID, code: results[0].strARCode, sign: 0, dataRes: results, intARConsignorID: req.body.intConsignorID})
                    }
                  }

                }
                else{
                  res.redirect('/consignorhome')
                }
              })
            },5000)

          }

          mainFunct(req, insertId);


          

          
          
          // res.render('consignor/views/auctionresult', {intAuctionID: req.params.intAuctionID, util: req.session.utilities, insertId: insertId, code: text, sign: 1, intARConsignorID: req.body.intConsignorID})
        }
      })
    }
    else{
        res.redirect('/consignorhome')

    }
  })
})

//machine Learning
routerConsignor
			.post('/preset/next', (req, res) => {//category
				console.log('eow')
				var itemQuery = `SELECT * FROM tbl_preset WHERE `+req.body.query;
				console.log(req.body.credential)
				db.query(itemQuery, eval(req.body.credential), function (err, results, fields) {
					if(err) return console.log(err);
					if(results){
						pushSuggestion(results, res, req)
						res.end();
					}//results if
				});
			})
//function
function pushSuggestion(results, res, req){
  if(req.body.category == 'Furniture' && req.body.find == 'jsonAttributes.Brand')
    var item = ['Custom-made'];
  else
    var item = [];
  console.log(item)
  for(var i = 0; i < results.length; i++){
    var jsonAttributes = JSON.parse(results[i].jsonAttributes);
    console.log(eval(req.body.find))

    if(item.includes(eval(req.body.find))){
      console.log('Duplicate')
    }
    else if(!item.includes(eval(req.body.find))){
      item.push(eval(req.body.find));
    }

    if(i == results.length-1){
      console.log(item);
      return res.send({indicator: 'success', item: item})

    }
  }// for first
}

function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
}
routerConsignor.get('/consignment/monitor/:consignmentId', (req, res) => {
	req.io.on('connect', (socket) => {
		socket.room = 'monitor'+req.params.consignmentId
		console.log(socket.room)
	});
	db.query('SELECT * FROM tbl_consignment WHERE intConsignmentID = ?', [req.params.consignmentId], (err, results, fields) => {
		if(err) console.log(err)

		if(results[0] && results[0].intConsignmentConsignorID == req.session.consignor.intConsignorID){
			db.query('SELECT * FROM tbl_consignment_item WHERE intCIConsignment = ?', [req.params.consignmentId], (err, results, fields) => {
				if(err) console.log(err)
		
				res.render('consignor/views/monitorConsignment', {items: results, id: req.params.consignmentId, hostname:req.hostname, port: req.port, session: req.session});
			})
		}
		else{
			res.redirect('/consignorhome/consignment');
		}
	})
})

routerConsignor.post('/getinfo/consignor', (req,res) => {
  console.log('wtf')
		let consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
		
		db.query(consignorQuery, [req.body.intConsignorID], (err, results, field) => {
      if(err) return console.log(err)
        console.log('PUTA GIGIL')
			if(results.length > 0){
				
				res.send({indicator: true, info: results[0]})

      }
      else{
        res.send({indicator: false});
      }
		})
	})
routerConsignor.get('/profile',(req, res) => {//view consignor data
	console.log(req.session)
	var editQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
	db.query(editQuery, [req.session.consignor.intConsignorID], (err, results, fields) => {
		if(err) return console.log(err);
		results[0].datDateRegistered = moment(results[0].datDateRegistered).format('lll');
		res.render('consignor/views/profile', {consignorData: results[0], session: req.session});
	});
})
routerConsignor.post('/consignor/logs/:consignorAccountId', (req, res) => {
	db.query('SELECT * FROM tbl_consignor_account_logs WHERE intCALogCAID = ? ORDER BY datDateLogin DESC', [req.params.consignorAccountId], (err, results, fields) =>{
		if(err) console.log(err)

		if(results.length>0){
			for(var y=0; y<results.length; y++){
				results[y].datDateLogin = moment(results[y].datDateLogin).format('YYYY-MM-DD hh:mm A')
			}
		}
		res.send(results)
	})
})


//  *
//         FROM tbl_consignment_item
//         JOIN tbl_consignment
// 					ON intCIConsignment = intConsignmentID
// 				JOIN tbl_items_in_bundle
// 					ON intIIBItemID = strItemID
// 				JOIN 

//-------FOR PULLOUT------//


async function issue(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT *, tbl_issues.intQTY AS quanty
        FROM tbl_consignment_item
        JOIN tbl_consignment
          ON intCIConsignment = intConsignmentID
        JOIN tbl_issues
          ON intIssueConsignmentItemID = intConsignmentItemID
        JOIN tbl_reserved_price
          ON intRPConsignmentItemID = intConsignmentItemID
				WHERE booIssueStatus = 0 AND tbl_consignment.intConsignmentConsignorID = ?;`;
        conn.query(fuckQuery, [req.session.consignor.intConsignorID],(err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====Issue====')
              console.log('=====Issue Results====')
              console.log('=====Issue Results====')
              var issues = results;
              loopIssue(issues, conn, req, insertId);
              console.log('=====Issue====')
            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopIssue(issues, conn, req, insertId){
  for(var issue of issues){
    console.log('--subIssue results--');
    await subIssue(issue, conn, req, insertId)
    console.log('--subIssue results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subIssue(issue, conn, req, insertId){
		console.log('YES')
		var insertQuery = `INSERT INTO tbl_ar_detail (intARQTY, strARJson, strARItemID, intARDAuctionResultID, booType, dblHammerPrice, dblCommission) VALUES (?, ?, ?, ?, ? ,?, ?)`
		conn.query(insertQuery, [issue.quanty, issue.jsonOtherSpecifications, issue.strItemID, insertId, 4, issue.dblReservePrice, 0], (err, results, field) => {
				if(err) return console.log(err);
		})
		return Promise.resolve(1)
}





async function pullOut(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT *
        FROM tbl_consignment_item
        JOIN tbl_consignment
          ON intCIConsignment = intConsignmentID
				WHERE booItemStatus = 3 AND tbl_consignment.intConsignmentConsignorID = ?;`;
        conn.query(fuckQuery, [req.session.consignor.intConsignorID],(err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====Pullout====')
              console.log('=====Pullout Results====')
              console.log('=====Pullout Results====')
              var pullouts = results;
              loopPullout(pullouts, conn, req, insertId);
              console.log('=====Pullout====')
            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopPullout(pullouts, conn, req, insertId){
  for(var pullout of pullouts){
    console.log('--subPullOut results--');
    await subPullOut(pullout, conn, req, insertId)
    console.log('--subPullOut results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subPullOut(pullout, conn, req, insertId){
		console.log('YES')
		var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARDAuctionResultID, booType) VALUES (?, ?, ?, ?)`
		conn.query(insertQuery, [pullout.jsonOtherSpecifications, pullout.strItemID, insertId, 5], (err, results, field) => {
				if(err) return console.log(err);
		})
		return Promise.resolve(1)
}
//-------For PULLOUT------//


//-------Unsold------//
async function unsoldSingle(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT *
        FROM tbl_consignment_item
        JOIN tbl_consignment
          ON intCIConsignment = intConsignmentID
        JOIN tbl_catalog
          ON strCatalogItemID = strItemID
        JOIN tbl_auction
          ON intAuctionID = intCatalogAuctionID
        JOIN tbl_bidlist
          ON intCatalogID = intBidlistCatalogID
				WHERE tbl_bidlist.booStatus = 1 AND tbl_bidlist.intBidlistBidderID = 0 AND tbl_auction.intAuctionID = ? AND tbl_consignment.intConsignmentConsignorID = ?;`;
        conn.query(fuckQuery, [req.params.intAuctionID, req.session.consignor.intConsignorID],(err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====Unsold====')
              console.log('=====Unsold Results====')
              console.log('=====Unsold Results====')
              var unsolds = results;
              loopUnsold(unsolds, conn, req, insertId);
              console.log('=====Unsold====')
            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopUnsold(unsolds, conn, req, insertId){
  for(var unsold of unsolds){
    console.log('--subUnsold results--');
    await subUnsold(unsold, conn, req, insertId)
    console.log('--subUnsold results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subUnsold(unsold, conn, req, insertId){
		console.log('YES')
		var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARDAuctionResultID, booType) VALUES (?, ?, ?, ?)`
		conn.query(insertQuery, [unsold.jsonOtherSpecifications, unsold.strItemID, insertId, 3], (err, results, field) => {
				if(err) return console.log(err);
		})
		return Promise.resolve(1)
}



async function unsoldBundle(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `
          SELECT * FROM tbl_consignment JOIN tbl_bundle ON intBundleConsignmentID = intConsignmentID
          JOIN tbl_catalog
            ON strCatalogItemID = intBundleID
          JOIN tbl_auction
            ON intAuctionID = intCatalogAuctionID
          JOIN tbl_bidlist
            ON intCatalogID = intBidlistCatalogID
          WHERE tbl_bidlist.booStatus = 1 AND tbl_bidlist.intBidlistBidderID = 0 AND tbl_auction.intAuctionID = ? AND intConsignmentConsignorID = ?;`;
        conn.query(fuckQuery, [req.params.intAuctionID, req.session.consignor.intConsignorID],(err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====Unsold====')
              console.log('=====Unsold Results====')
              console.log('=====Unsold Results====')
              var unsolds = results;
              loopUnsoldBundle(unsolds, conn, req, insertId);
              console.log('=====Unsold====')
            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopUnsoldBundle(unsolds, conn, req, insertId){
  for(var unsold of unsolds){
    console.log('--subUnsold results--');
    await subUnsoldBundle(unsold, conn, req, insertId)
    console.log('--subUnsold results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subUnsoldBundle(unsold, conn, req, insertId){
		console.log('YES')
		var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARDAuctionResultID, booType) VALUES (?, ?, ?, ?)`
		conn.query(insertQuery, [unsold.strBundleTitle, unsold.intBundleID, insertId, 3], (err, results, field) => {
				if(err) return console.log(err);
		})
		return Promise.resolve(1)
}
//-------Unsold------//


//--------Cancelled--------//

async function cancelledBundle(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT * FROM tbl_consignment JOIN tbl_bundle ON intBundleConsignmentID = intConsignmentID
        JOIN tbl_catalog
          ON strCatalogItemID = intBundleID
        JOIN tbl_auction
          ON intAuctionID = intCatalogAuctionID
        JOIN tbl_bidlist
          ON intCatalogID = intBidlistCatalogID
        JOIN tbl_sales_invoice_details
          ON intBidlistID = intRDBidlistID
        JOIN tbl_sales_invoice
					ON intSIDSalesInvoiceID = intSalesInvoiceID`;
        conn.query(fuckQuery, (err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====Cancelled====')
              console.log('=====Cancelled Results====')
              console.log('=====Cancelled Results====')
              var cancelleds = results;

              loopCancelledBundle(cancelleds, conn, req, insertId);

              console.log('=====payable====')


            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopCancelledBundle(cancelleds, conn, req, insertId){
  for(var cancelled of cancelleds){
    console.log('--subcancelled results--');
    await subCancelledBundle(cancelled, conn, req, insertId)
    console.log('--subcancelled results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subCancelledBundle(cancelled, conn, req, insertId){

    if(cancelled.booSIStatus == 4 && cancelled.intAuctionID == req.params.intAuctionID && cancelled.intConsignmentConsignorID == req.session.consignor.intConsignorID && cancelled.intBidlistBidderID != 0){
      console.log('YES')
      var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARReceiptID, dblCommission, dblHammerPrice, intARDAuctionResultID, booType, intARQTY) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      conn.query(insertQuery, [cancelled.strBundleTitle, cancelled.intBundleID, cancelled.intOrderID, cancelled.intComission, cancelled.dblSIDBidPrice, insertId, 2, cancelled.intSIDQty], (err, results, field) => {
        if(err) return console.log(err);
      })
      return Promise.resolve(1)
    }

}



async function cancelledSingle(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT *
        FROM tbl_consignment_item
        JOIN tbl_consignment
          ON intCIConsignment = intConsignmentID
        JOIN tbl_catalog
          ON strCatalogItemID = strItemID
        JOIN tbl_auction
          ON intAuctionID = intCatalogAuctionID
        JOIN tbl_bidlist
          ON intCatalogID = intBidlistCatalogID
        JOIN tbl_sales_invoice_details
          ON intBidlistID = intRDBidlistID
        JOIN tbl_sales_invoice
          ON intSIDSalesInvoiceID = intSalesInvoiceID`;
        conn.query(fuckQuery, (err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====Cancelled====')
              console.log('=====Cancelled Results====')
              console.log('=====Cancelled Results====')
              var cancelleds = results;

              loopCancelled(cancelleds, conn, req, insertId);

              console.log('=====Cancelled====')


            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopCancelled(cancelleds, conn, req, insertId){
  for(var cancelled of cancelleds){
    console.log('--subcancelled results--');
    await subCancelled(cancelled, conn, req, insertId)
    console.log('--subcancelled results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subCancelled(cancelled, conn, req, insertId){

    if(cancelled.booSIStatus == 4 && cancelled.intAuctionID == req.params.intAuctionID && cancelled.intConsignmentConsignorID == req.session.consignor.intConsignorID && cancelled.intBidlistBidderID != 0){
      console.log('YES')
      var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARReceiptID, dblCommission, dblHammerPrice, intARDAuctionResultID, booType, intARQTY) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      conn.query(insertQuery, [cancelled.jsonOtherSpecifications, cancelled.strItemID, cancelled.intOrderID, cancelled.intComission, cancelled.dblSIDBidPrice, insertId, 2, cancelled.intSIDQty], (err, results, field) => {
	        if(err) return console.log(err);
      })
      return Promise.resolve(1)
    }

}
//--------Cancelled--------//


//------Payable Bundle------//
async function payableBundle(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT * FROM tbl_consignment JOIN tbl_bundle ON intBundleConsignmentID = intConsignmentID 
        JOIN tbl_catalog
          ON strCatalogItemID = intBundleID
        JOIN tbl_auction
          ON intAuctionID = intCatalogAuctionID
        JOIN tbl_bidlist
          ON intCatalogID = intBidlistCatalogID
        JOIN tbl_sales_invoice_details
          ON intBidlistID = intRDBidlistID
        JOIN tbl_sales_invoice
					ON intSIDSalesInvoiceID = intSalesInvoiceID`;
        conn.query(fuckQuery, (err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====payable====')
              console.log('=====Payable Results====')
              console.log('=====Payable Results====')
              var payables = results;

              loopPayableBundle(payables, conn, req, insertId);

              console.log('=====payable====')


            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopPayableBundle(payables, conn, req, insertId){
  for(var payable of payables){
    console.log('--subpayable results--');
    await subPayableBundle(payable, conn, req, insertId)
    console.log('--subpayable results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subPayableBundle(payable, conn, req, insertId){
    if(payable.booSIStatus != 4 && payable.booSIStatus != 0 && payable.intAuctionID == req.params.intAuctionID && payable.intConsignmentConsignorID == req.session.consignor.intConsignorID && payable.intBidlistBidderID != 0){
      console.log('===Payable Bundle===')
      console.log(payable);
      console.log('===Payable Bundle===')

      var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARReceiptID, dblCommission, dblHammerPrice, intARDAuctionResultID, booType, intARQTY) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      conn.query(insertQuery, [payable.strBundleTitle, payable.intBundleID, payable.intOrderID, payable.intComission, payable.dblSIDBidPrice, insertId, 1, payable.intSIDQty], (err, results, field) => {
        if(err) return console.log(err);
      })
      return Promise.resolve(1)
    }

}
					

//------Payable Bundle------//



 // -----------------Functions -----------------//
async function payableSingle(req, insertId){

  db.getConnection(function(err, conn) {
    conn.beginTransaction((err) => {
      if(err){
        throw err;
      }
      else{
        var fuckQuery = `SELECT *
        FROM tbl_consignment_item
        JOIN tbl_consignment
          ON intCIConsignment = intConsignmentID
        JOIN tbl_catalog
          ON strCatalogItemID = strItemID
        JOIN tbl_auction
          ON intAuctionID = intCatalogAuctionID
        JOIN tbl_bidlist
          ON intCatalogID = intBidlistCatalogID
        JOIN tbl_sales_invoice_details
          ON intBidlistID = intRDBidlistID
        JOIN tbl_sales_invoice
          ON intSIDSalesInvoiceID = intSalesInvoiceID`;
        conn.query(fuckQuery, (err, results, field) => {
          if (err) {
            return conn.rollback(function() {
              throw err;
            });
          }
          else{
            if(results.length > 0){
              console.log('=====payable====')
              console.log('=====Payable Results====')
              console.log('=====Payable Results====')
              var payables = results;

              loopPayable(payables, conn, req, insertId);

              console.log('=====payable====')


            }
            else{
              return Promise.resolve(1);
            }
          }//else
        }); // conn query
      }//else
    })//begintransa
  })//getconn
}//function

async function loopPayable(payables, conn, req, insertId){
  for(var payable of payables){
    console.log('--subpayable results--');
    await subPayable(payable, conn, req, insertId)
    console.log('--subpayable results--');
  }

  conn.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    console.log('success!');
  });
}

function subPayable(payable, conn, req, insertId){

    if(payable.booSIStatus != 4 && payable.booSIStatus != 0 && payable.intAuctionID == req.params.intAuctionID && payable.intConsignmentConsignorID == req.session.consignor.intConsignorID && payable.intBidlistBidderID != 0){
      console.log('YES')
      var insertQuery = `INSERT INTO tbl_ar_detail (strARJson, strARItemID, intARReceiptID, dblCommission, dblHammerPrice, intARDAuctionResultID, booType, intARQTY) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      conn.query(insertQuery, [payable.jsonOtherSpecifications, payable.strItemID, payable.intOrderID, payable.intComission, payable.dblSIDBidPrice, insertId, 1, payable.intSIDQty], (err, results, field) => {
        if(err) return console.log(err);
      })
      return Promise.resolve(1)
    }

}
// -----------------Functions -----------------//






//reports consignor
routerConsignor.post('/reports/consignment/counter', (req, res) => {
  console.log('===Consignment Counter Accessed===');
  console.log(req.session.consignor.intConsignorID)
var revenueQuery = `SELECT COUNT(*) as consignmentCount FROM tbl_consignment WHERE intConsignmentConsignorID = ? AND MONTH(datDateReceived) = MONTH(CURDATE()) AND booStatus = 1;
                    SELECT COUNT(*) as consignmentCount FROM tbl_consignment WHERE intConsignmentConsignorID = ? AND MONTH(datDateReceived) = MONTH(CURDATE())-1 AND booStatus = 1;`
	db.query(revenueQuery, [req.session.consignor.intConsignorID, req.session.consignor.intConsignorID],(err, results, field) => {
    if(err) console.log(err);
    console.log(results)
		var current = results[0][0].consignmentCount;
		var prev = results[1][0].consignmentCount;
		var percentage;
		if(current == 0 && prev == 0){
			percentage = 0;
		}
		else if(current == 0 && prev != 0){
			percentage = -100
		}
		else if(current != 0 && prev == 0){
			percentage = 100
		}
		else if(prev>current){//loss
			percentage = (((prev - current) / prev) * 100) - 100;
		}
		else if(prev<current){//gain
			percentage = (prev / current) * 100;
		}
		else if(prev==current){//gain
			percentage = 0
		}
		console.log(percentage)

		res.send({indicator: true, consignmentCount: results[0][0].consignmentCount, percentage: percentage})
	})
})



routerConsignor.post('/reports/netincome/currentmonth', (req, res) => {
	

	console.log('===Consignment Counter Accessed===');
	var netIncomeQuery = `SELECT SUM(dblHammerPrice - dblCommission) AS netIncome FROM tbl_auctionresult JOIn tbl_ar_detail ON intARDAuctionResultID = intAuctionResultID WHERE intARConsignorID = ? AND booARStatus = 1 AND MONTH(datDateClaimed) = MONTH(CURDATE()); SELECT SUM(dblHammerPrice - dblCommission) AS netIncome FROM tbl_auctionresult JOIn tbl_ar_detail ON intARDAuctionResultID = intAuctionResultID WHERE intARConsignorID = ? AND booARStatus = 1 AND MONTH(datDateClaimed) = MONTH(CURDATE())-1;`
	db.query(netIncomeQuery, [req.session.consignor.intConsignorID, req.session.consignor.intConsignorID], (err, results, field) => {
		if(err) console.log(err);
		var current, prev;
		if(results[0][0].netIncome != null)
			current = results[0][0].netIncome;
		else current = 0 

		if(results[1][0].netIncome != null)
			prev = results[1][0].netIncome;
		else prev = 0
		console.log(current, prev)
		var percentage;
		if(current == 0 && prev == 0){
			percentage = 0;
		}
		else if(current == 0 && prev != 0){
			percentage = -100
		}
		else if(current != 0 && prev == 0){
			percentage = 100
		}
		else if(prev>current){//loss
			percentage = (((prev - current) / prev) * 100) - 100;
		}
		else if(prev<current){//gain
			percentage = (prev / current) * 100;
		}
		else if(prev==current){//gain
			percentage = 0
		}
		console.log(percentage)

		res.send({indicator: true, netIncome: results[0][0].netIncome, percentage: percentage})
	})
})

routerConsignor.post('/reports/categories/timeseries', (req, res) => {
	console.log('=======================================TIMESERIES==========================================')
	function sorter(jsoner){

		for(i = 0; i < jsoner.length; i++){
			for(x = 0; x < jsoner.length; x++){
				var countFirst = jsoner[i].predict;
				var countNext = jsoner[x].predict;
				if(countFirst > countNext){
					var temp = jsoner[i]
					jsoner[i] = jsoner[x]
					jsoner[x] = temp;
					
				}
			}
			if(i == jsoner.length - 1){
				return jsoner;
			}
		}
	}

	var checkDateQuery = `SELECT * FROM tbl_timeseries_category GROUP BY datTSCDate ORDER BY datTSCDate DESC LIMIT 1;`
	db.query(checkDateQuery, (err, results, field) => {
		if(err) console.log(err);

		var lastDate = moment(results[0].datTSCDate).format('MM-DD-YYYY');
		var todayDate = moment().format('MM-DD-YYYY');
		if(moment(todayDate).isAfter(lastDate, 'month')){
			console.log('yes');


			var a = moment(lastDate);
			var b = moment(todayDate);
			var c = b.diff(a, 'months')
			if(c > 0){
				console.log('access')
				for(var i = 1; i <= c; i++){
					var endDate = moment(a.add(i, 'months')).format('YYYY-MM-DD');
					var startDate = moment(moment(a.diff(i, 'months')).add(1, 'days')).format('YYYY-MM-DD');
					var selectBentaQuery = `SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Appliances' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Bags' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Furniture' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Camera' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Mobile' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Shoes' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Computer Machine' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Toys' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Television' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;SELECT SUM(intSIDQty) AS counterSum, strCategory FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID JOIN tbl_consignment_item ON strItemID = strAwardID JOIN tbl_consignment ON intCIConsignment = intConsignmentID WHERE booSIStatus = 3 AND strCategory = 'Generic Gadget' AND tbl_sales_invoice.datDate BETWEEN ? AND ?;`
					db.query(selectBentaQuery, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate], (err, results, field) => {
						if(err) console.log(err);
						if(results.length > 0){
							var categories = ['Appliances', 'Bags', 'Furniture', 'Camera', 'Mobile', 'Shoes', 'Computer Machine', 'Toys', 'Television', 'Generic Gadget']
							var insertData = `INSERT INTO tbl_timeseries_category (datTSCDate, strTSCCategory, intTSCCount) VALUES (?,?,?)`
							for(var i = 0; i < results.length; i++){
								if(results[i][0].counterSum == null){
									results[i][0].counterSum = 0;
								}
								db.query(insertData, [endDate, categories[i], results[i][0].counterSum], (err, results, field) => {
									if(err) console.log(err);
								})
								if(i == results.length - 1){
									var timeseriesQuery = `SELECT * FROM tbl_timeseries_category ORDER BY strTSCCategory;`
									db.query(timeseriesQuery, (err, results, field) => {
										if(err) console.log(err);
										if(results.length > 0){
											var tempCat = results[0].strTSCCategory;
											console.log(tempCat)
											var timeInterval = 5 * 60 * 2000; // 5 minutes
											var ma = MA(timeInterval);
											var forecast = []
											for(var i = 0; i < results.length; i++){
												if(results[i].strTSCCategory == tempCat){
													ma.push(new Date(results[i].datTSCDate), results[i].intTSCCount);
												}
												else{
													console.log('forecast is', ma.forecast());
													forecast.push({category: tempCat, predict: ma.forecast()})
													ma = MA(timeInterval);
													tempCat = results[i].strTSCCategory;
													ma.push(new Date(results[i].datTSCDate), results[i].intTSCCount);	
												}
												if(i == results.length - 1){
													console.log('forecast is', ma.forecast());
													ma.push(new Date(results[i].datTSCDate), results[i].intTSCCount);	
													forecast.push({category: tempCat, predict: ma.forecast()})
													console.log(forecast);
													console.log(sorter(forecast));
													res.send({indicator: true, forecast: sorter(forecast)});
													res.end()
													
												}
											}
										}
									})
								}
							}
						}
					})
				}
			}
			else{

				var timeseriesQuery = `SELECT * FROM tbl_timeseries_category ORDER BY strTSCCategory;`
				db.query(timeseriesQuery, (err, results, field) => {
					if(err) console.log(err);
					if(results.length > 0){
						var tempCat = results[0].strTSCCategory;
						console.log(tempCat)
						var timeInterval = 5 * 60 * 2000; // 5 minutes
						var ma = MA(timeInterval);
						var forecast = []
						for(var i = 0; i < results.length; i++){
							if(results[i].strTSCCategory == tempCat){
								ma.push(new Date(results[i].datTSCDate), results[i].intTSCCount);
							}
							else{
								console.log('forecast is', ma.forecast());
								forecast.push({category: tempCat, predict: ma.forecast()})
								ma = MA(timeInterval);
								tempCat = results[i].strTSCCategory;
								ma.push(new Date(results[i].datTSCDate), results[i].intTSCCount);	
							}
							if(i == results.length - 1){
								console.log('forecast is', ma.forecast());
								ma.push(new Date(results[i].datTSCDate), results[i].intTSCCount);	
								forecast.push({category: tempCat, predict: ma.forecast()})
								console.log(forecast);

								console.log(sorter(forecast));
								res.send({indicator: true, forecast: sorter(forecast)});
								res.end()

							}
						}
					}
				})
			}
		}
	})


})
routerConsignor.post('/uom/query', (req, res) => {
  db.query('SELECT * FROM tbl_unit_of_measurement WHERE booStatus = 0', (err, results, fields) => {
    if(err) console.log(err)

      if(results.length > 0){
        return res.send({valid: true, data: results})
      }
      else{
        return res.send({valid: false})
      }
  })
})

exports.consignorportal = router
exports.consignorhome = routerConsignor
