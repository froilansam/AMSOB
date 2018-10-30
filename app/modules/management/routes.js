const express = require('express');
const router = express.Router();
const db = require('../../lib/database')();
const nodemailer = require('nodemailer');
const multer = require('multer');
const moment = require('moment');
var MA = require('moving-average');
var timeseries = require("timeseries-analysis");
var brain = require('brain.js');

var storage = multer.diskStorage({
destination: function (req, file, cb) {
	cb(null, 'public/assets/uploads')
},
filename: function (req, file, cb) {
	cb(null, file.fieldname + '-' + Date.now()+'.jpg')
}
})
var upload = multer({storage: storage})
var middleware = require('../auth/middlewares/auth');
var renameKeys = require('rename-keys');
var ip = require('ip');
var publicIp = require('public-ip');
var MLR = require('ml-regression-multivariate-linear');
var intConsignorID = ''
var arr = []
var arrJSON = []
var arrPosh = ''

router.get('/', middleware.employeeLoggedIn, (req, res) => {
	
	res.render('management/views/index', {session: req.session, hostname: req.hostname, port: req.port})
});



router
	.get('/login', (req, res) =>{
		
		res.render('management/views/login', {reqQuery: req.query});
	})
	.post('/login', (req, res) =>{
		var localIp = ip.address();
		var ipPublic;
		// publicIp.v4().then(ipv4 =>{
		// 	ipPublic = ipv4;
		// })
		db.query(`SELECT * FROM tbl_employee JOIN tbl_job_title ON intJobType = intJobTitleID WHERE strUsername = ? AND strPassword = ?`,[req.body.username, req.body.password], (err, results, fields) => {
			if(err) console.log(err)
			if(results.length>0){
				var dateNow = moment().format('YYYY-MM-DD HH:mm');
				req.session.user = results[0];
				// db.query('INSERT INTO tbl_employee_logs(intEmployeeID, datDateLogin, strLocalIP, strPublicIP) VALUES(?, ?, ?, ?)',[results[0].intEmployeeID, dateNow, localIp, ipPublic], (err, results, fields) => {
				// 	if(err) console.log(err)
				// })
				db.query(`SELECT * FROM tbl_utilities`, (err, results, fields) =>{
					if(err) console.log(err);
			
					req.session.utilities = results[0];
					res.send({done:true})
				})
			}
			else res.send({done:false})
		})
	});
router.get('/logout', (req, res) => {
	
	req.session.destroy(err => {
		if (err) throw err;
		res.redirect('/login');
	});
});
//Consignment Router
router
	.get('/consignment', middleware.employeeLoggedIn, middleware.acquisitionQualified, (req, res) => {
		
		// - erase session
		delete req.session.receive
		arr = []
		arrJSON = []
		//- erase session ends



		let consignmentQuery = `SELECT * FROM tbl_consignment WHERE booStatus = 0`
		db.query(consignmentQuery, (err, results, fields) => {
			if(err) return console.log(err);
			if(results.length > 0){
				for(var i = 0; i < results.length; i++){
					results[i].datDateCreated = moment(results[i].datDateCreated).format('LL')
					delete results[i].strConsignmentCode;
					if(i == results.length -1){
						res.render('management/views/consignment', {consignments: results, session: req.session})						
					}
				}
			}
			else
				res.render('management/views/consignment', {consignments: results, session: req.session})
		})
	})
	.get('/consignment/maintenance', middleware.employeeLoggedIn, middleware.acquisitionQualified, (req, res) => {
		
		let consignmentQuery = `SELECT * FROM tbl_consignment WHERE booStatus != 0`
		db.query(consignmentQuery, (err, results, fields) => {
			if(err) return console.log(err);
			if(results.length > 0){
				for(var i = 0; i < results.length; i++){
					results[i].datDateCreated = moment(results[i].datDateCreated).format('LL')
					results[i].datDateReceived = moment(results[i].datDateReceived).format('LL')
					delete results[i].strConsignmentCode;
					if(i == results.length -1){
						res.render('management/views/consignmentmaintenance', {consignments: results, session: req.session})						
					}
				}
			}
			else
				res.render('management/views/consignmentmaintenance', {consignments: results, session: req.session})
		})		
	})	
	.post('/identityrequest', middleware.employeeLoggedIn, (req, res) => {//identity request
		let identityQuery = `SELECT * FROM (tbl_consignor JOIN tbl_consignor_accounts ON intCSConsignorID = intConsignorID) JOIN tbl_consignment ON intConsignorID = intConsignmentConsignorID WHERE strConsignmentCode = ? AND tbl_consignor_accounts.booStatus = 0 AND tbl_consignment.booStatus = 0`
		db.query(identityQuery, [req.body.strConsignmentCode], (err, results, fields) => {
			if(err) return console.log(err)
			if(results.length > 0){
				results[0].datDateRegistered = moment(results[0].datDateRegistered).format('LL')
				res.send({identity: results[0]})
			}
			else{
				res.send('none')
			}
		})		
	})
	.post('/identityrequest/auction', middleware.employeeLoggedIn, (req, res) => {//identity request
		let identityQuery = `SELECT * FROM (tbl_consignor JOIN tbl_consignor_accounts ON intCSConsignorID = intConsignorID) JOIN tbl_auctionresult ON intConsignorID = intARConsignorID WHERE strARCode = ? AND tbl_consignor_accounts.booStatus = 0 AND booARStatus = 0`
		db.query(identityQuery, [req.body.strConsignmentCode], (err, results, fields) => {
			if(err) return console.log(err)
			if(results.length > 0){
				results[0].datDateRegistered = moment(results[0].datDateRegistered).format('LL')
				res.send({identity: results[0]})
			}
			else{
				res.send('none')
			}
		})		
	})
	.get('/consignor/auctionresult', middleware.employeeLoggedIn, middleware.auctionQualified, middleware.acquisitionQualified, middleware.inventoryQualified, (req, res) => {
		
		var paymentQuery = `SELECT * FROM tbl_auctionresult WHERE booARStatus = 0`
		db.query(paymentQuery, (err, results, fields) => {
			if(err) return console.log(err);
			res.render('management/views/payment', {voucher: results, session: req.session})
		})
	})
	.post('/payment/details', middleware.employeeLoggedIn, (req,res) => {
		var paymentQuery = `SELECT * FROM tbl_auctionresult JOIN tbl_ar_detail ON intAuctionResultID = intARDAuctionResultID WHERE strARCode = ?;`
		db.query(paymentQuery, [req.body.strARCode], (err, results, field) => {
			if(err) return console.log(err)
			if(results.length > 0){
				console.log(results)
				console.log('^^^^^^^^^^^^')
				for(var i = 0; i < results.length; i++){
				if(results[i].strARItemID.charAt(0) == 'I'){
						results[i].strARJson = JSON.parse(results[i].strARJson)
					}
				if(i == results.length - 1){
					res.render('management/views/claiming', {intAuctionID: results[0].intARAuctionID, util: req.session.utilities, insertId: results[0].intAuctionResultID, code: results[0].strARCode, sign: 0, dataRes: results, admin: req.session.user, session: req.session})
				}
				}

			}
			else{
				res.redirect('/consignor/auctionresult');
			}
		})
	})
	.get('/maintenance/auctionresults', middleware.employeeLoggedIn, (req,res) => {
		var arQuery = `SELECT * FROM tbl_auctionresult;`
		db.query(arQuery, (err, results, field) => {
			if(err) return console.log(err)
			if(results.length > 0){
				console.log(results);
				for(var i = 0; i < results.length; i++){
					results[i].datDateClaimed = moment(results[i].datDateClaimed).format('MMMM DD, YYYY hh:mm:ss a');
					if(i == results.length - 1){
						res.render('management/views/auctionresultmain', {session: req.session, ars: results})
					}
				}

			}
			else{
				res.redirect('/');
			}
		})
	})

	.get('/maintenance/auctionresult/:intAuctionResultID', middleware.employeeLoggedIn, (req,res) => {
		var paymentQuery = `SELECT * FROM tbl_auctionresult JOIN tbl_ar_detail ON intAuctionResultID = intARDAuctionResultID WHERE booARStatus = 1 AND intAuctionResultID = ?;`
		db.query(paymentQuery, [req.params.intAuctionResultID], (err, results, field) => {
			if(err) return console.log(err)
			if(results.length > 0){
				console.log(results)
				console.log('^^^^^^^^^^^^')
				for(var i = 0; i < results.length; i++){
				if(results[i].strARItemID.charAt(0) == 'I'){
						results[i].strARJson = JSON.parse(results[i].strARJson)
					}
				if(i == results.length - 1){
					res.render('management/views/detailedar', {intAuctionID: results[0].intARAuctionID, util: req.session.utilities, insertId: results[0].intAuctionResultID, code: results[0].strARCode, sign: 0, dataRes: results, admin: req.session.user, session: req.session})
				}
				}

			}
			else{
				res.redirect('/consignor/auctionresult');
			}
		})
	})

	.post('/getinfo/consignor', middleware.employeeLoggedIn, (req,res) => {
		let consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
		
		db.query(consignorQuery, [req.body.intConsignorID], (err, results, field) => {
			if(err) return console.log(err)
			if(results.length > 0){
				
				res.send({indicator: true, info: results[0]})

			}
			else{
				res.send({indicator: false});
			}
		})
	})
	.post('/auctionresult/submit', (req, res) => {
		var resultQuery = 'UPDATE tbl_auctionresult SET booARStatus = 1, strSignatureCon = ?, strSignatureAdm = ?, datDateClaimed = ? WHERE intAuctionResultID = ?;'
		db.query(resultQuery, [req.body.signatureConsignor, req.body.signatureAdmin, new Date, req.body.intAuctionResultID], (err, results, field)=>{
			if(err) console.log(err)
			var updateQuery = `SELECT * FROM tbl_ar_detail WHERE booType = 5 AND intARDAuctionResultID = ?; SELECT * FROM tbl_ar_detail WHERE booType = 4 AND intARDAuctionResultID = ?;`
			db.query(updateQuery, [req.body.intAuctionResultID, req.body.intAuctionResultID], (err, results, field)=>{
				if(err) console.log(err);
				console.log(results[1])
				if(results[0].length > 0){
					var pullouts = results[0];
					for(var i = 0; i < pullouts.length; i++){
						var pullOutQuery = `UPDATE tbl_consignment_item SET booItemStatus = 4 WHERE intConsignmentItemID = ?`
						db.query(pullOutQuery, [pullouts[i].strARItemID], (err, results, field) => {
							if(err) console.log(err);
							console.log('Updated Pull Out');
						})
					}

				}
				if(results[1].length > 0){
					var issues = results[1];
					for(var i = 0; i < issues.length; i++){
						var issueQuery = `UPDATE tbl_issues JOIN tbl_consignment_item ON intIssueConsignmentItemID = intConsignmentItemID SET booIssueStatus = 1 WHERE strItemID = ?`
						db.query(issueQuery, [issues[i].strARItemID], (err, results, field) => {
							if(err) console.log(err);
							console.log('Updated Issue');
						})
					}

				}
				res.send({indicator: true});
			})
		})
	})
	
	
	.get('/consignment/receive', middleware.employeeLoggedIn,middleware.acquisitionQualified, (req, res) => {
		
		delete req.session.appraise;
		appraise = [];
		req.session.appraise = []
		if(req.session.receive && intConsignorID != ''){
			let consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
			db.query(consignorQuery, [intConsignorID], (err, results, fields) => {
					if(err) return console.log(err);
				req.session.manaCon = results[0];
				res.render('management/views/receive', {consignor: req.session.manaCon, asset: req.session.receive, session: req.session})
			});
			
		}
		else{
			res.redirect('/consignment');
		}
	})
	.post('/consignment/receive', middleware.employeeLoggedIn, (req, res) => {//identity request

		if(req.body.strConsignmentCode != ''){
			if(req.body.strConsignmentCode != null){
				req.session.consignmentcode = req.body.strConsignmentCode;
				console.log(req.session.consignmentcode);
				let codeQuery = `SELECT * FROM tbl_consignment JOIN tbl_consignment_item ON intConsignmentID = intCIConsignment WHERE strConsignmentCode = ?`
				db.query(codeQuery, [req.session.consignmentcode], (err, results, fields) => {
					if(err) return console.log(err);
					req.session.consignmentid = results[0].intConsignmentID;
					console.log(results, req.session.consignmentcode);
					if(results.length < 0) return res.redirect('/consignment');
					var assetReceive =[]
					for(var i = 0; i < results.length; i++){
						var receive = {}
						receive.price = results[i].booPrice;
						receive.UOM = results[i].strUOM;
						receive.id = results[i].intConsignmentItemID;
						
						for(var x = 0;x < Object.keys(JSON.parse(results[i].jsonOtherSpecifications)).length; x++){
							receive[((Object.keys(JSON.parse(results[i].jsonOtherSpecifications))[x]).toString()).capitalize()] = Object.values(JSON.parse(results[i].jsonOtherSpecifications))[x]
							if(x == Object.keys(JSON.parse(results[i].jsonOtherSpecifications)).length - 1){
								receive.category =  results[i].strCategory;
								receive.quantity =  results[i].intQTY;
								console.log('puta ka',typeof results[i].description)
								if(typeof results[i].description == 'undefined')
									receive.description =  '';
								else
									receive.description = results[i].strDescription
							}
						}
						assetReceive.push(receive)
						console.log(assetReceive)
						if(i == results.length - 1){
							for(var y = 0; y < assetReceive.length; y++){
								var quantity =parseInt(assetReceive[y].quantity)
								var description =assetReceive[y].description
								var id =assetReceive[y].id
								delete assetReceive[y].quantity;
								delete assetReceive[y].description;
								delete assetReceive[y].id;
								console.log('quan', quantity)
								if(arr.includes(JSON.stringify(assetReceive[y]))){
								console.log('Item has already been added');
								}
								else{
								asset = assetReceive[y]
								arr.push(JSON.stringify(asset));
								console.log(arr);
								console.log('obrigado', req.session.receive)
								
								asset['quantity'] = quantity;
								asset['description'] = description;
								asset['id'] = id;
								arrJSON.push(asset)
								req.session.receive = arrJSON;
								console.log(arrJSON);
								console.log('-----')
								console.log(req.session.receive);
								intConsignorID = results[0].intConsignmentConsignorID
								}
							}
							res.redirect('/consignment/receive')
							res.end();
						}

							
					}
					
				});
			}
		}	
	})

	.get('/assets', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
		
		var assetQuery = `SELECT * FROM tbl_preset;`
		db.query(assetQuery, (err, results, fields) => {
			if(err) return console.log(err);
			for(var i = 0; i < results.length; i++){
				results[i].jsonAttributes = JSON.parse(results[i].jsonAttributes);
				if(i == results.length - 1){
					res.render('management/views/assets', {asset: results, user: req.session.user, session: req.session})
				}
			}

		});
		
	})

	.post('/assets/add', middleware.employeeLoggedIn, (req, res) => {
		console.log('/assets/add', req.body)
		req.body.asset = renameKeys(req.body.asset, function(key, val) {
			return capitalizeFirstLetter(key)
		});

		
		var Ogprice = req.body.asset.OGprice
		var YearReleased = req.body.asset.YearReleased
		var Category = req.body.asset.Category
		console.log('category', Category)
		delete req.body.asset.OGprice;
		delete req.body.asset.YearReleased;
		delete req.body.asset.Category;
		delete req.body.asset.Description;

		var addQuery = `INSERT INTO tbl_preset (strCategory, jsonAttributes, dblOGPrice, datYearReleased) VALUES (?,?,?,?)`
		db.query(addQuery, [Category, JSON.stringify(req.body.asset), Ogprice, YearReleased],(err, results, fields) => {
			if(err) return console.log(err);
			var insertId = results.insertId;


			res.send({indicator: 'success', Category: Category, asset: req.body.asset, id: insertId, OGprice: Ogprice, YearReleased: YearReleased})
			res.end();
		});
			
			
			



	})
	.post('/assets/edit/save', middleware.employeeLoggedIn, (req, res) => {
		console.log('/assets/add', req.body)
		req.body.asset = renameKeys(req.body.asset, function(key, val) {
			return capitalizeFirstLetter(key)
		});

		
		var Ogprice = req.body.asset.OGprice
		var YearReleased = req.body.asset.YearReleased
		var Category = req.body.asset.Category
		console.log('category', Category)
		delete req.body.asset.OGprice;
		delete req.body.asset.YearReleased;
		delete req.body.asset.Category;
		delete req.body.asset.Description;

		var addQuery = `UPDATE tbl_preset SET strCategory = ?, jsonAttributes = ?, dblOGPrice = ?, datYearReleased = ? WHERE intMachineLearningID = ?;`
		db.query(addQuery, [Category, JSON.stringify(req.body.asset), Ogprice, YearReleased, req.body.assetId],(err, results, fields) => {
			if(err) return console.log(err);


			res.send({indicator: true, Category: Category, asset: req.body.asset, id: req.body.assetId, OGprice: Ogprice, YearReleased: YearReleased})
			res.end();
		});
			
			
			



	})

	.post('/assets/delete', middleware.employeeLoggedIn, (req, res) => {
		console.log('/assets/delete', req.body)

		

		var deleteQuery = `DELETE FROM tbl_preset WHERE intMachineLearningID = ?;`
		db.query(deleteQuery, [req.body.assetId],(err, results, fields) => {
			if(err) return console.log(err);


			res.send({indicator: true, id: req.body.assetId})
			res.end();
		});
			
			
			



	})

	.post('/delete/consignment', middleware.employeeLoggedIn, (req, res) => {//delete consignment
		console.log('/delete/consignment', req.body)
		var deleteQuery = `DELETE FROM tbl_consignment WHERE intConsignmentID = ?;`
		db.query(deleteQuery, [req.body.consignmentid],(err, results, fields) => {
			if(err) return console.log(err);
			res.send({indicator: true, id: req.body.consignmentid})
			res.end();
		});
	})
	
	.post('/condition', (req, res) => {
		var conQuery = `SELECT * FROM tbl_utilities;`
		db.query(conQuery, (err, results, fields) => {
			if(err) return console.log(err);
			var condition = eval(`results[0].${req.body.condition}`)
			res.send({condition: condition});
		})
		
	})
	.post('/depreciation', (req, res) => {
		var salvageQuery = `SELECT * FROM tbl_utilities;`
		db.query(salvageQuery, (err, results, fields) => {
			if(err) return console.log(err);
			var salvagePrice = results[0].dblSalvagePrice;
			for(var i = 0; i < req.session.receive.length; i++){
				if(req.session.receive[i].id == req.body.assetID){
					var lifeQuery = `SELECT * FROM tbl_category WHERE strCategoryName = ?`
					db.query(lifeQuery, [req.session.receive[i].category], (err, results, fields) => {
						if(err) return console.log(err);
						res.send({salvagePrice: salvagePrice, life: results[0].intLife});
					})					
				}
			}
		})
		
	})

	.post('/depreciation/presetcheck', (req, res) => {
		var pushie = {}
		var posh = []
		var arrPosh = ''
		for(var i = 0; i < req.session.receive.length; i++){
			if(req.session.receive[i].id == req.body.assetID){
				for(var x = 0; x < Object.keys(req.session.receive[i]).length; x++){
					if(Object.keys(req.session.receive[i])[x] != 'price'){
						if(Object.keys(req.session.receive[i])[x] != 'new'){
							if(Object.keys(req.session.receive[i])[x] != 'UOM'){
								if(Object.keys(req.session.receive[i])[x] != 'category'){
									if(Object.keys(req.session.receive[i])[x] != 'id'){
										if(Object.keys(req.session.receive[i])[x] != 'quantity'){
											if(Object.keys(req.session.receive[i])[x] != 'description'){
												pushie[capitalizeFirstLetter(Object.keys(req.session.receive[i])[x])] = Object.values(req.session.receive[i])[x]
												posh.push(`JSON_EXTRACT(jsonAttributes, "$.${capitalizeFirstLetter(Object.keys(req.session.receive[i])[x])}") = '${Object.values(req.session.receive[i])[x]}' `)
											}	
										}	
									}	
								}	
							}					
						}
					}
				}
			}
			if(i == req.session.receive.length - 1){

				for(var x = 0; x < Object.keys(pushie).length; x++){
					if(x == 0)
						arrPosh = arrPosh + posh[x];
					else if(x != 0){
						arrPosh = arrPosh +'AND '+ posh[x];	
					}
					

					if(x == Object.keys(pushie).length - 1){
						console.log(arrPosh)
						var checkQuery = `SELECT * FROM tbl_preset WHERE ${arrPosh}`
						console.log(checkQuery)
						db.query(checkQuery, (err, results, fields) => {
							if(err) return console.log(err);
							console.log(results[0]);
							if(results.length > 0){
								OGprice = results[0].dblOGPrice;
								YearReleased = results[0].datYearReleased;
								res.send({OGprice: OGprice, YearReleased: YearReleased, indicator: 'success'});
								res.end();					
							}
							else{
								res.send({indicator: 'fail'});
								res.end();
							}
						}) 
					}
				}
			}
		}
		
		
	})

	.post('/appraise', (req, res) => {
		var cat = '';
		var froilan = {};

		for(var b = 0; b < req.session.receive.length; b++){
			if(req.session.receive[b].id == req.body.assetID){
				console.log(req.session.receive[b]);
				cat = req.session.receive[b].category;

				for(var xb = 0; xb < Object.keys(req.session.receive[b]).length; xb++){
					if(req.session.receive[b].hasOwnProperty('wattage')){
						var watt = req.session.receive[b].wattage.split(' ');
						req.session.receive[b].wattage = watt[0];
					}
					if(Object.keys(req.session.receive[b])[xb] != 'description'){
						if(Object.keys(req.session.receive[b])[xb] != 'price'){
							if(Object.keys(req.session.receive[b])[xb] != 'category'){
								if(Object.keys(req.session.receive[b])[xb] != 'quantity'){
									if(Object.keys(req.session.receive[b])[xb] != 'UOM'){
										if(Object.keys(req.session.receive[b])[xb] != 'id'){
											if(Object.keys(req.session.receive[b])[xb] != 'new'){
												froilan[capitalizeFirstLetter(Object.keys(req.session.receive[b])[xb])] = req.session.receive[b][Object.keys(req.session.receive[b])[xb]];
												console.log('froilan', froilan);
											}										
										}
									}								
								}							
							}						
						}						
					}
				}
			}
		
			if(b == req.session.receive.length -1){
				var xxx = []
				var yyy = []		
				var arrAsset = []			
				var query = `SELECT * FROM tbl_category JOIN tbl_historical_data ON strCategoryName = strCategory WHERE strCategory = ?;`
				db.query(query, [cat], (err, results, fields) => {
					if(err) console.log(err);			
					var duplicator = []
					if(results.length == 0){
						res.send(null);
						res.end();
					}
					console.log(results)
					for(var i = 0; i < results.length; i++){//numbering
						var json = JSON.parse(results[i].jsonAttributes)
						for(var x = 0; x < Object.keys(json).length; x++){
							if(!duplicator.includes(Object.keys(json)[x]+' '+json[Object.keys(json)[x]])){
								var assetjson = {}
								duplicator.push(Object.keys(json)[x]+' '+json[Object.keys(json)[x]])
								assetjson['num'] = arrAsset.length + 1;
								assetjson['name'] = Object.keys(json)[x];
								assetjson['val'] = json[Object.keys(json)[x]];
								arrAsset.push(assetjson);
							}
						}
						if(i == results.length - 1){
							for(var y = 0; y < results.length; y++){
								var arrayReg = []
								arrayReg.push(results[y].intYears)
								arrayReg.push(results[y].booCondition)
								var json2 = JSON.parse(results[y].jsonAttributes)
								for(var o = 0; o < Object.keys(json2).length; o++){
									for(var c = 0; c < arrAsset.length; c++){
										if(Object.keys(json2)[o] == arrAsset[c].name && json2[Object.keys(json2)[o]] == arrAsset[c].val){
											console.log('num', arrAsset[c].val);
											arrayReg.push(arrAsset[c].num)
										}
									}
									if(o == Object.keys(json2).length - 1){
										console.log('aa', arrayReg)
										console.log('bb', results[y].dblAssessment)
										xxx.push(arrayReg);
										yyy.push([results[y].dblAssessment])
									}
								}

								//Find out
								if( y == results.length - 1){
									
									console.log('------FROILAN---------')
									var arrayReg2 = []
									presetFunc(froilan)
									console.log(arrPosh)
									db.query(`SELECT * FROM tbl_preset WHERE ${arrPosh}`, function (err, results, fields) {
										if(err) console.log(err);
										if(results.length > 0){
											OGprice = results[0].dblOGPrice;
											YearReleased = moment(new Date(results[0].datYearReleased+'-01-01')).format('MM/DD/YY h:mm:ss a');
											console.log('~~~~~~~~Year Released~~~~~~~~')
											
											var today = moment();
											var diffe = today.diff(YearReleased, 'years');


											arrayReg2.push(diffe)
											arrayReg2.push(parseInt(req.body.condition))

											for(var o = 0; o < Object.keys(froilan).length; o++){
												for(var c = 0; c < arrAsset.length; c++){
													if(Object.keys(froilan)[o] == arrAsset[c].name && froilan[Object.keys(froilan)[o]] == arrAsset[c].val){
														console.log('num', arrAsset[c].val);
														arrayReg2.push(arrAsset[c].num)
													}
												}
												if(o == Object.keys(froilan).length - 1){
													console.log(arrayReg2)
													const mlr = new MLR(xxx, yyy);
													console.log(mlr.predict(arrayReg2));
													var amount = mlr.predict(arrayReg2);
													res.send({amount: amount[0]});
													res.end();							
												}
											}
																
										}
										else{
											arrayReg2.push(1)
											arrayReg2.push(parseInt(req.body.condition))

											for(var o = 0; o < Object.keys(froilan).length; o++){
												for(var c = 0; c < arrAsset.length; c++){
													if(Object.keys(froilan)[o] == arrAsset[c].name && froilan[Object.keys(froilan)[o]] == arrAsset[c].val){
														console.log('num', arrAsset[c].val);
														arrayReg2.push(arrAsset[c].num)
													}
												}
												if(o == Object.keys(froilan).length - 1){
													console.log(arrayReg2)
													const mlr = new MLR(xxx, yyy);
													console.log(mlr.predict(arrayReg2));
													var amount = mlr.predict(arrayReg2);
													res.send({amount: amount[0]});
													res.end();							
												}
											}
										}
									});
									
								}
							}
							console.log(duplicator)
							console.log(arrAsset);
							
							
						}
					}
				});
			}
		}


		
		
	})
	.post('/assets/edit', middleware.employeeLoggedIn, (req, res) => {
		console.log(req.body);
		var assetQuery = `SELECT * FROM tbl_preset WHERE intMachineLearningID	 = ?;`
		db.query(assetQuery, [req.body.assetId], function (err, results, fields) {
			if(err) return console.log(err);

			var jsonAsset = JSON.parse(results[0].jsonAttributes)
			var asset = {};
			for(var x = 0; x < Object.keys(jsonAsset).length; x++){
				asset[(Object.keys(jsonAsset)[x].toString()).capitalize()] = Object.values(jsonAsset)[x]
				if(x == Object.keys(jsonAsset).length -1){
					asset['category'] = results[0].strCategory;
					asset['ogprice'] = results[0].dblOGPrice;
					asset['YearReleased'] = results[0].datYearReleased;
					console.log('assets', asset);
					res.send({asset: asset});
					res.end();
				}
			}
		});
		
	})

	//function for preset

	function presetFunc(asset){
		var database = db;
		var pushie = {}
		var posh = []
		arrPosh = ''
		for(var x = 0; x < Object.keys(asset).length; x++){
			if(Object.keys(asset)[x] != 'price'){
				if(Object.keys(asset)[x] != 'new'){
					if(Object.keys(asset)[x] != 'UOM'){
						if(Object.keys(asset)[x] != 'category'){
							if(Object.keys(asset)[x] != 'id'){
								if(Object.keys(asset)[x] != 'quantity'){
									if(Object.keys(asset)[x] != 'description'){
										pushie[capitalizeFirstLetter(Object.keys(asset)[x])] = Object.values(asset)[x]
										posh.push(`JSON_EXTRACT(jsonAttributes, "$.${capitalizeFirstLetter(Object.keys(asset)[x])}") = '${Object.values(asset)[x]}' `)
									}	
								}	
							}	
						}	
					}					
				}
			}

			if(x == Object.keys(asset).length - 1){
				for(var i = 0; i < Object.keys(pushie).length; i++){
					if(i == 0)
						arrPosh = arrPosh + posh[i];
					else if(i != 0){
						arrPosh = arrPosh +'AND '+ posh[i];	
					}
				}
			}
		}

			
	}

	

	//- bidder

router.get('/bidder/evaluate', middleware.employeeLoggedIn, middleware.auctionQualified, (req, res) => {
			
		console.log(req.body);
		var bidderQuery = `SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID WHERE booStatus = 0;`
		db.query(bidderQuery, function (err, results, fields) {
			if(err) return console.log(err);

			res.render('management/views/biddereval', {bidderData: results, user: req.session.user, session: req.session})

			
		});
		
	})
	.post('/bidder/evaluate', middleware.employeeLoggedIn, (req, res) => {
		console.log(req.body);
		var bidderQuery = `SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID WHERE booStatus = 0 AND intBidderID = ?;`
		db.query(bidderQuery, [req.body.intBidderID], function (err, results, fields) {
			if(err) return console.log(err);

			res.send({indicator: true, bidder: results[0]});
			res.end();
			
		});
		
	})

	

	//-- edit asset from consignor router import
router.get('/consignment/create/count', middleware.employeeLoggedIn, middleware.acquisitionQualified, (req, res) => {//dashboard
	
	if(req.session.receive){

		res.send({count: req.session.receive.length})
	}
	else{
		res.send({count: 0})    
	}
});
router.post('/consignment/savechanges', (req, res) => {//dashboard
		console.log('-==============savechanges==============-')
		console.log(req.body)
		console.log('-==============savechanges==============-')
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
		console.log('obrigado', req.session.receive)
		asset['id'] = req.body.assetId;
		asset['quantity'] = quantity;
		asset['description'] = description;
		arrJSON.push(asset)
		req.session.receive = arrJSON;
		console.log(arrJSON);
		console.log('-----')
		console.log(req.session.receive);
		res.send({indicator: 'success', asset: asset})
		res.end();
		}
	})

router.post('/consignment/create', (req, res) => {//dashboard
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
		console.log('obrigado', req.session.receive)
		if(req.session.receive){
			if(req.session.receive.length > 0){
			var highest = parseInt(req.session.receive[0].id)
			for(var i = 0; i < req.session.receive.length; i++){
				if(highest < parseInt(req.session.receive[i].id)){
				highest = parseInt(req.session.receive[i].id)
				}

				if(i == req.session.receive.length-1){
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
		req.session.receive = arrJSON;
		console.log(arrJSON);
		console.log('-----')
		console.log(req.session.receive);
		res.send({indicator: 'success', asset: asset})
		res.end();
		}
	})
router.post('/consignment/edit', (req, res) => {//edit asset
		console.log(req.session.receive)
		for(var i = 0; i < req.session.receive.length; i++){
		if(req.body.assetId == req.session.receive[i].id){
			console.log(req.session.receive[i])
			res.send({asset: req.session.receive[i]})
			res.end();
		}
		}
	})
router.post('/consignment/delete', (req, res) => {//edit asset
		console.log(req.body.assetId)
		for(var i = 0; i < req.session.receive.length; i++){
		if(req.session.receive[i].id == req.body.assetId ){
			
			req.session.receive.splice(i, 1)
			arr.splice(i, 1)
			arrJSON.splice(i, 1)
			console.log('The results are in:')
			console.log(req.session.receive)
			console.log('-------')
			console.log(arr);
			console.log('-------')
			console.log(arrJSON);
			res.send({indic: 'success'})
			res.end()
		}
		}
	})
router.post('/consignment/delete/appraise', (req, res) => {//edit asset
		if(req.session.appraise.length > 0){
			console.log('accessed delete route', req.body.assetId)
			for(var i = 0; i < req.session.appraise.length; i++){
				if(req.session.appraise[i].AssetID == req.body.assetId ){
					req.session.picture = req.session.appraise[i].strPicture;
					req.session.appraise.splice(i, 1)
					appraise.splice(i, 1)
					console.log('The results are in:')
					console.log(req.session.appraise)
					console.log('-------')
					console.log(appraise);
					res.send(true)
					res.end()
				}
				else{
					res.send(true)
					res.end()
				}
			}
		}
		else{
			res.send(true)
			res.end()
		}
});
router.get('/consignment/monitor/:consignmentId', middleware.employeeLoggedIn, middleware.acquisitionOrInventoryQualified, (req, res) => {
	
	console.log(req.params)
	req.io.on('connect', (socket) => {
		socket.room = 'monitor'+req.params.consignmentId
		console.log(socket.room)
	});
	db.query('SELECT * FROM tbl_consignment_item WHERE intCIConsignment = ?', [req.params.consignmentId], (err, results, fields) => {
		if(err) console.log(err)

		res.render('management/views/monitorConsignment', {items: results, id: req.params.consignmentId, hostname:req.hostname, port: req.port, session: req.session});
	})
})
.get('/consignment/print/:intConsignmentID', middleware.employeeLoggedIn, middleware.acquisitionQualified, (req, res) => {//dashboard
	
	let printQuery = `SELECT * FROM tbl_consignment JOIN tbl_consignment_item ON intCIConsignment = intConsignmentID WHERE intConsignmentID = ?`
	db.query(printQuery, [req.params.intConsignmentID], function (err, results, fields) {
		if(err) return console.log(err);
		var asset = results
		var rp = [];
		if(results.length == 0) return res.redirect('/consignment/maintenance')
		
		console.log(req.session.user)
		for(var i = 0; i < asset.length; i++){
		asset[i].jsonOtherSpecifications = JSON.parse(asset[i].jsonOtherSpecifications)
		asset[i].datDateCreated = moment(asset[i].datDateCreated).format('LL')
		asset[i].datDateReceived = moment(asset[i].datDateReceived).format('LL')
		var y = i;
		var priceQuery = `SELECT * FROM tbl_reserved_price WHERE intRPConsignmentItemID = ? ORDER BY intReservedPriceID ASC`;
		db.query(priceQuery, [asset[i].intConsignmentItemID], function (err, results, fields) {
			if(err) console.log(err);
			rp.push(results[0])
		});
		if(i == asset.length - 1){
			var consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = "${asset[0].intConsignmentConsignorID}" AND booStatus != 2`
			db.query(consignorQuery, function (err, results, fields) {
				if(err) console.log(err);
				console.log('rp', rp);
				res.render('management/views/assetlist', {consignor: results[0], asset: asset, rp: rp, user: req.session.user, session: req.session})
			});
		}
		}
	})
}); 
router.post('/consignment/submit', (req, res) => {//edit asset
		
		for(var i = 0; i < req.session.receive.length; i++){
		req.session.receive[i] = renameKeys(req.session.receive[i], function(key, val) {
			return capitalizeFirstLetter(key)
		});
		console.log(req.session.receive[i]);
		if(i == req.session.receive.length - 1){
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 8; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			

			var submitQuery = `UPDATE tbl_consignment SET strSignatureAdmin = ?, strSignatureConsignor = ?, datDateReceived = now(), booStatus = 1 WHERE strConsignmentCode = ?;`
			db.query(submitQuery, [req.body.signatureAdmin, req.body.signatureConsignor, req.session.consignmentcode], function (err, results, fields) {
				if(err) return console.log(err);
				var insertId = req.session.consignmentid;
				var deleteAll = `DELETE FROM tbl_consignment_item WHERE intCIConsignment = ?;`
				db.query(deleteAll, [insertId], (err, results, field) => {
					if(err) console.log(err);
					for(var c = 0; c < req.session.receive.length; c++){
						var description = req.session.receive[c].Description
						var price = req.session.receive[c].Price
						var category = req.session.receive[c].Category
						var quantity = req.session.receive[c].Quantity
						var UOM = req.session.receive[c].UOM
						var ID = req.session.receive[c].Id
						delete req.session.receive[c].Description
						delete req.session.receive[c].Price
						delete req.session.receive[c].Category
						delete req.session.receive[c].Quantity
						delete req.session.receive[c].UOM
						delete req.session.receive[c].Id
						delete req.session.receive[c].New; 
						console.log("req.session", req.session.receive[c])
						var assetQuery = `INSERT INTO tbl_consignment_item (intCIConsignment, strItemDescription, booPrice, strCategory, booItemStatus, strUOM, jsonOtherSpecifications, intQTY, booIsReceived, booIsBundled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
						
						insertDeadlock(insertId, description, price, category, UOM, req.session.receive[c], quantity, ID);

						function insertDeadlock(insertId, description, price, category, UOM, asset, quantity, ID){
							db.query(assetQuery, [insertId, description, price, category, 0, UOM, JSON.stringify(asset), quantity, 1, 0], function (err, results, fields) {
								if(err){
									console.log(err)
									if(err.errno == 1213 || err.errno == 1062){
										insertDeadlock(insertId, description, price, category, UOM, asset, quantity, ID);
									}
									else{
										insertDeadlock(insertId, description, price, category, UOM, asset, quantity, ID);
									}
								}
								else{
									var insertId2 = results.insertId;
									var colorQuery = `INSERT INTO tbl_color (intColorConsignmentItemID, strColor, intQTY) VALUES (?,?,?);`
									var reserveQuery = `INSERT INTO tbl_reserved_price (intRPConsignmentItemID, dblReservePrice) VALUES (?,?);`
									var conditionQuery = `UPDATE tbl_consignment_item SET booCondition = ?, intStorage = ?, intQTY = ? WHERE intConsignmentItemID = ?`
									var pictureQuery =  `INSERT INTO tbl_consignment_item_pictures (intCIPConsignmentItemID, strPicture) VALUES (?, ?);`
									for(var x = 0; x < req.session.appraise.length; x++){
										console.log('===============================xxx=================');
										
										console.log('===============================xxx=================');
									
										if(req.session.appraise[x].AssetID == ID){
											console.log('===============================appraise==================');
											console.log(req.session.appraise[x]);
											console.log(ID);
											console.log('===============================appraise==================');
											db.query(reserveQuery, [insertId2, parseFloat(req.session.appraise[x].ReservedPrice)], function (err, results, fields) {
												if(err) return console.log(err);
											});
											db.query(colorQuery, [insertId2, req.session.appraise[x].Color, quantity], function (err, results, fields) {
												if(err) return console.log(err);
											});
											db.query(conditionQuery, [parseInt(req.session.appraise[x].Condition), parseInt(req.session.appraise[x].Size), quantity, insertId2], function (err, results, fields) {
												if(err) return console.log(err);
												console.log('consition')
											});
											for(var k = 0; k < req.session.appraise[x].strPicture.length; k++){
												console.log('picture', req.session.appraise[x].strPicture[k])
												db.query(pictureQuery, [insertId2, req.session.appraise[x].strPicture[k]], function (err, results, fields) {
													if (err) console.log(err);
												});
											}
										}
									}
								}
							});
						}
						
						if(c == req.session.receive.length-1){
							res.send({indicator: 'success', intConsignmentID: req.session.consignmentid})
						}//-if
					}
				});
			});        

		}
		}
	})
var appraise = [];
router.get('/consignment/appraisal', middleware.employeeLoggedIn, middleware.acquisitionQualified, (req, res) => {//edit asset
		
	if(!req.session.receive) return res.redirect('/consignment')
	else{
		var reservedAsset = []
		for(var i = 0; i < req.session.receive.length; i++){
			
			reservedAsset.push(req.session.receive[i]);
			

			if(i == req.session.receive.length - 1){
				console.log('reserve', reservedAsset)
				res.render('management/views/appraisal', {admin: req.session.user, asset: reservedAsset, consignor: req.session.manaCon, appraisal: req.session.appraise, session:req.session})
			}
		}
	}
})
	
	.post('/consignment/appraisal', middleware.employeeLoggedIn, upload.any(), (req, res) => {//identity request
		let data = {};
		let image = [];
		
		console.log(req.body);
		console.log(req.files.length);
		if(req.files.length > 0){
			for(var i = 0; i < req.files.length; i++){
				image.push(req.files[i].filename);
				if(i == req.files.length - 1){
					data['AssetID'] = req.body.AssetID;
					data['Color'] = req.body.Color;
					data['Size'] = req.body.Size;
					data['Condition'] = req.body.Condition;
					data['ReservedPrice'] = req.body.ReservedPrice;
					data['strPicture'] = image;
					appraise.push(data);
					req.session.appraise = appraise;
					console.log(req.session.appraise)
					res.send('success')
					image = [];
					res.end()	
				}
			}
		}
		else{
			console.log('no file')
			data['AssetID'] = req.body.AssetID;
			data['Color'] = req.body.Color;
			data['Size'] = req.body.Size;
			data['Condition'] = req.body.Condition;
			data['ReservedPrice'] = req.body.ReservedPrice;
			data['strPicture'] = req.session.picture;
			appraise.push(data);
			req.session.appraise = appraise;
			console.log(req.session.appraise)
			res.send('success')
			image = [];
			res.end()	
		}
		
	})
	.post('/consignment/appraisal/edit', middleware.employeeLoggedIn, (req, res) => {//identity request
		console.log(req.body);
		
		for(var i = 0; i < req.session.appraise.length; i++){
			console.log(req.session.appraise[i]);
			if(req.session.appraise[i].AssetID == req.body.AssetID){
				console.log('yes')
				res.send({indicator: 'success', appraise: req.session.appraise[i]});
				res.end();
			}

			if(i == req.session.appraise.length - 1){
				res.end()
			}
		}
		
	})

//machine Learning
router
	.post('/preset/next', (req, res) => {//category
		console.log('eow')
		console.log('body', req.body)
		var itemQuery = `SELECT * FROM tbl_preset WHERE `+req.body.query;
		console.log('itemQUery',itemQuery)
		console.log(req.body.credential)
		db.query(itemQuery, eval(req.body.credential), function (err, results, fields) {
		if(err) return console.log(err);
		console.log('results', results)
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


	
router.get('/multilinear', (req, res) => {
	

	// var regression = new smr.Regression({ numX: 1, numY: 1 })

	// // regression.push({ x: [10], y: [2] })
	// // regression.push({ x: [5], y: [1] })
	// // regression.push({ x: [5], y: [1] })
	// // regression.push({ x: [5], y: [1] })
	// // regression.push({ x: [5], y: [1] })
	// // regression.push({ x: [10], y: [1] })
	
	// // console.log(regression.hypothesize({ x: [78] })) // Returns [20.93]
	// var timeInterval = 5 * 60 * 1000; // 5 minutes

	// var ma = MA(timeInterval);


	// ma.push(new Date('8-31-18'), 5000);		
	// ma.push(new Date('9-31-18'), 5000);
	// ma.push(new Date('10-31-18'), 1000);
	// ma.push(new Date('11-31-18'), 5000);
	// ma.push(new Date('12-31-18'), 1000);

	// ma.push(new Date('1-31-19'), 1000);	
	// ma.push(new Date('2-31-19'), 5000);
	// ma.push(new Date('3-31-19'), 1000);
	// ma.push(new Date('4-31-19'), 5000);
	// ma.push(new Date('5-31-19'), 5000);		
	// ma.push(new Date('6-31-19'), 5000);
	// ma.push(new Date('7-31-19'), 100200);
	// ma.push(new Date('8-31-19'), 500000);
	// ma.push(new Date('9-31-19'), 10000);
	
	
	
	// console.log('moving average now is', ma.movingAverage());
	// console.log('moving variance now is', ma.variance());
	// console.log('moving deviation now is', ma.deviation());
	// console.log('forecast is', ma.forecast());
	// res.end()
	
})
//Consignor Router
router
	.get('/consignor', middleware.employeeLoggedIn, (req, res) => {//list of consignors
		
		var consignorQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE booStatus != 2`
		db.query(consignorQuery, (err, results, fields) => {
			if(err) return console.log(err);
			res.render('management/views/consignor', {consignorData: results, session: req.session})		
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
	.get('/consignor/:intConsignorID', middleware.employeeLoggedIn, (req, res) => {//view consignor data
		
		var editQuery = `SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorID = ?`
		db.query(editQuery, [req.params.intConsignorID], (err, results, fields) => {
			if(err) return console.log(err);
			if(results.length == 0) return res.render('management/views/404')
			results[0].datDateRegistered = moment(results[0].datDateRegistered).format('lll');
			res.render('management/views/editconsignor', {consignorData: results[0], session: req.session});
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
	.post('/consignor/update/:intConsignorID', middleware.employeeLoggedIn, (req, res) => {//- edit information
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

//Auction
router.get('/auction', middleware.employeeLoggedIn, middleware.auctionQualified, (req, res) => {
	
	var queryString = `SELECT * FROM tbl_auction`;
	var events = [];
	var dateNow = moment().format('YYYY-MM-DD HH:mm');
	db.query(queryString, (err, results, fields) =>{
		if(err) console.log(err)
		// console.log(results);
		var unscheduledEvents = results;

		for(var i=0;i<results.length;i++){
			if(results[i].booAuctionStatus != 0 && results[i].booAuctionStatus != 4){
				results[i].jsonDuration = JSON.parse(results[i].jsonDuration)
				if(results[i].booAuctionStatus != 3){
					var dateEndNow = moment(results[i].datDateStart).add('d',results[i].jsonDuration.days).add('h',results[i].jsonDuration.hours).add('m',results[i].jsonDuration.minutes).format('YYYY-MM-DD HH:mm');
					if(moment(dateNow).isSameOrAfter(dateEndNow) && results[i].booAuctionStatus == 2){
						updateStatus(results[i].intAuctionID);
					}
				}
				var event = {};
				event.id = results[i].intAuctionID;
				event.title = ''+results[i].strAuctionName+' - Auction #'+results[i].intAuctionID;
				event.start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
				var endDate = moment(event.start).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').add(results[i].jsonDuration.minutes, 'm').format('YYYY-MM-DD HH:mm');
				event.end = endDate;
				if(results[i].booAuctionStatus == 1){
					event.color = '#591212'
					event.editable = true;
				}
				else if (results[i].booAuctionStatus == 2){
					event.color = '#125559'
					event.editable = false;
				}
				else if (results[i].booAuctionStatus == 3){
					event.color = '#125913'
					event.editable = false;
				}
				else if (results[i].booAuctionStatus == 5){
					event.color = '#630860'
				}
				events.push(event);

			}
		}
		unscheduledEvents = unscheduledEvents.filter(item => item.booAuctionStatus == 0);
		// console.log('\nNASA CATALOG\n');
		// console.log(unscheduledEvents)
		return res.render('management/views/auctionSchedule', {auctionSched: events, unscheduled: unscheduledEvents, session: req.session});
	});
	function updateStatus(id){
		db.query(`UPDATE tbl_auction SET booAuctionStatus = 3 WHERE intAuctionID = ${id}`, (err, results, fields) =>{
			if(err) console.log(err)
			console.log(id+' AUCTION STATUS UPDATED');
		})
	}
});

router.post('/auction/create', middleware.employeeLoggedIn, upload.single('auctionBanner'), (req, res) => {
	console.log(req.file);
	console.log(req.body);
	var dateCreated = moment().format('YYYY-MM-DD HH:mm');
	var queryString = `INSERT INTO tbl_auction(jsonDuration, booAuctionType, strAuctionName, strDescription, datDateCreated, strBanner) VALUES (?, ?, ?, ?, ?, ?)`;
	var auctionName = req.body.auctionName;
	var auctionDescription = req.body.auctionDescription;
	var auctionType = req.body.auctionType;
	delete req.body.auctionType;
	delete req.body.auctionName;
	delete req.body.auctionDescription;
	var jsonInsert;
	if(auctionType == 1){
		var temp = JSON.parse(req.session.utilities.jsonDefaultLiveAuctionDuration);
		console.log(temp)
		jsonInsert = JSON.stringify({days: 0, hours: temp.hours, minutes: temp.minutes, startingTime: req.session.utilities.strLiveAuctionStartTime});
	}
	else{
		jsonInsert = JSON.stringify(req.body);
	}
	console.log(jsonInsert);

	if(typeof req.file == 'undefined'){
		db.query(queryString,[jsonInsert, auctionType, auctionName, auctionDescription, dateCreated, ''], (err, results, fields) =>{
			if(err) console.log(err)
	
			res.redirect('/auction');
		});
	}
	else{
		db.query(queryString,[jsonInsert, auctionType, auctionName, auctionDescription, dateCreated, req.file.filename], (err, results, fields) =>{
			if(err) console.log(err)
			res.redirect('/auction');
		});
	}
});
router.post('/auction/publish', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'SELECT strCatalogItemID FROM tbl_catalog WHERE intCatalogAuctionID = ?';
	var queryString2 = `UPDATE tbl_consignment_item SET booItemStatus = 1 WHERE strItemID = ?;
	SELECT intConsignmentItemID, intCIConsignment FROM tbl_consignment_item WHERE strItemID = ?`;
	var queryString3 = 'UPDATE tbl_bundle SET booBundleStatus = 1 WHERE intBundleID = ?';
	var queryString4 = `UPDATE tbl_consignment_item SET booItemStatus = 1 WHERE intConsignmentItemID = ?;
	SELECT intConsignmentItemID, intCIConsignment FROM tbl_consignment_item WHERE intConsignmentItemID = ?`;
	db.query(queryString, [req.body.auctionId], (err, results, fields) => {
		if(err) console.log(err)

		if(results.length == 0){
			return res.send({done:false})
		}
		else{
			for(var e=0;e<results.length;e++){
				if(results[e].strCatalogItemID[0] == 'I'){
					db.query(queryString2,[results[e].strCatalogItemID, results[e].strCatalogItemID], (err, results, fields) => {
						if(err) console.log(err)

						var itemNow = results[1][0]
						console.log(itemNow)
						console.log('item published');
						console.log(req.port)
						var socket = require('socket.io-client')(`http://${req.hostname}:${req.port}`)
						
						socket.emit('monitoring', itemNow.intConsignmentItemID, 1, itemNow.intCIConsignment, function(){
							console.log('updated sa consignor side')
						});
					})
				}
				else{
					var bundleId = results[e].strCatalogItemID;
					db.query(queryString3,[bundleId], (err, results, fields) => {
						if(err) console.log(err)
						db.query('SELECT intIIBItemID FROM tbl_items_in_bundle WHERE strIIBBundleID = ?', bundleId, (err, results, fields) => {
							if(err) console.log(err)

							var itemsInBundle = results;
							for(var o = 0; o< itemsInBundle.length; o++){
								db.query(queryString4,[itemsInBundle[o].intIIBItemID, itemsInBundle[o].intIIBItemID], (err, results, fields) => {
									if(err) console.log(err)
			
									var itemNow = results[1][0]
									console.log(itemNow)
									console.log('item published');
									var socket = require('socket.io-client')(`http://${req.hostname}:${req.port}`)
									
									socket.emit('monitoring', itemNow.intConsignmentItemID, 1, itemNow.intCIConsignment, function(){
										console.log('updated sa consignor side')
									});
								})
							}
						})
						console.log('bundle published');
					})
				}
				if( e == (results.length-1) ){
					db.query('UPDATE tbl_auction set booAuctionStatus = 5 WHERE intAuctionID = ?', [req.body.auctionId], (err, results, fields) => {
						if(err) console.log(err)
						res.send({done:true})
					})
				}
			}
		}
	})
});
router.post('/auction/cancel', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'SELECT strCatalogItemID FROM tbl_catalog WHERE intCatalogAuctionID = ?';
	var queryString2 = `UPDATE tbl_consignment_item SET booItemStatus = 0 WHERE strItemID = ?;
	SELECT intConsignmentItemID, intCIConsignment FROM tbl_consignment_item WHERE strItemID = ?`
	var queryString3 = 'UPDATE tbl_bundle SET booBundleStatus = 0 WHERE intBundleID = ?';
	var queryString4 = `UPDATE tbl_consignment_item SET booItemStatus = 0 WHERE intConsignmentItemID = ?;
	SELECT intConsignmentItemID, intCIConsignment FROM tbl_consignment_item WHERE intConsignmentItemID = ?`;
	var socket = require('socket.io-client')(`http://${req.hostname}:${req.port}`)
	db.query(queryString, [req.body.auctionId], (err, results, fields) => {
		if(err) console.log(err)

		if(!results){
			return res.send({done:false})
		}
		else{
			for(var e=0;e<results.length;e++){
				if(results[e].strCatalogItemID[0] == 'I'){
					db.query(queryString2,[results[e].strCatalogItemID, results[e].strCatalogItemID], (err, results, fields) => {
						if(err) console.log(err)

						console.log('item available again');
						var itemNow = results[1][0]
						socket.emit('monitoring', itemNow.intConsignmentItemID, 0, itemNow.intCIConsignment, function(){
							console.log('updated sa consignor side')
						});
					})
				}
				else{
					var bundleId = results[e].strCatalogItemID;
					db.query(queryString3,[bundleId], (err, results, fields) => {
						if(err) console.log(err)
						db.query('SELECT intIIBItemID FROM tbl_items_in_bundle WHERE strIIBBundleID = ?', bundleId, (err, results, fields) => {
							if(err) console.log(err)

							var itemsInBundle = results;
							for(var o = 0; o< itemsInBundle.length; o++){
								db.query(queryString4,[itemsInBundle[o].intIIBItemID, itemsInBundle[o].intIIBItemID], (err, results, fields) => {
									if(err) console.log(err)
			
									var itemNow = results[1][0]
									socket.emit('monitoring', itemNow.intConsignmentItemID, 0, itemNow.intCIConsignment, function(){
										console.log('updated sa consignor side')
									});
								})
							}
						})
						console.log('bundle available again');
					})
					db.query(queryString3,[results[e].strCatalogItemID], (err, results, fields) => {
						if(err) console.log(err)

					})
				}
				if( e == (results.length-1) ){
					db.query('UPDATE tbl_auction set booAuctionStatus = 1 WHERE intAuctionID = ?', [req.body.auctionId], (err, results, fields) => {
						if(err) console.log(err)
						res.send({done:true})
					})
				}
			}
		}
	})
});

//fritz		
router.post('/idavailability/', middleware.employeeLoggedIn, (req, res) => {//Check if username is 
	console.log(req.body)
	var usernameQuery = `SELECT * FROM tbl_live_bidder WHERE strIDType = ? And strIDNumber = ?`;
	db.query(usernameQuery, [req.body.idType, req.body.IDNumber], function (err, results, fields) {
		if (err) return console.log(err);
		console.log(results)
		console.log('aaa')
		if(results.length > 0){
			console.log('ID and ID Number is Existing')
			res.send({ "ID": false });
		}
		else{
			console.log('ID and ID Number is Available')
			res.send({ "ID": true });
		}
	})
})
router.get('/pos/bidder', middleware.employeeLoggedIn, (req, res) => {
	
	console.log('hello')
	var queryString = `SELECT intAuctionID, datDateStart, booAuctionStatus FROM tbl_auction WHERE booAuctionType = 1`;
	db.query(queryString, (err, results, fields)=> {
		for(var i=0;i<results.length;i++){
			if(results[i].booAuctionStatus != 0){
			results[i].datDateStart = moment(results[i].datDateStart).format('lll');
			}
		}
		console.log(results);
		return res.render('management/views/pos', {AuctionList:results, session: req.session});
	});
});
router.post('/pos/bidder', middleware.employeeLoggedIn, (req, res) => {
	console.log('hello')
	var queryString = `INSERT INTO tbl_live_bidder (intLBAuctionID, strName, strAddress, strIDType, strIDNumber, strContact, strTelephone, strBidderNumber, intLBConsignorID) VALUES (?, ?, ?, ?, ?, ?, ?)`
	db.query(queryString, [2 ,req.body.firstname +' '+ req.body.middlename +' '+ req.body.lastname, req.body.address, req.body.idtype, req.body.idnumber, req.body.phone, req.body.telephone, req.body.biddernumber, req.body.consignorid], (err, results, fields) =>{
		if(err) return console.log(err);
		res.send({indicator: 'success'})	
		res.end()
	});
});

//Live Bidder
router.get('/pos/livebidder/:intAuctionID', middleware.employeeLoggedIn, (req, res) => {
	
	console.log('hello')
	var queryString = `SELECT * FROM tbl_live_bidder WHERE intLBAuctionID = ?`;
	db.query(queryString, [req.params.intAuctionID], (err, results, fields)=> {
		console.log(results);
		return res.render('management/views/LiveBidder', {bidderList:results, intAuctionID: req.params.intAuctionID, session: req.session});
	})
});
router.post('/pos/livebidder/:intAuctionID', middleware.employeeLoggedIn, (req, res) =>{
	console.log('hi.post')
	var queryString = `INSERT INTO tbl_live_bidder (intLBAuctionID, strName, strAddress, strIDType, strIDNumber, strContact, strTelephone, strBidderNumber, intLBConsignorID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	db.query(queryString, [req.params.intAuctionID ,req.body.firstname +' '+ req.body.middlename +' '+ req.body.lastname, req.body.address, req.body.idtype, req.body.idnumber, req.body.phone,  req.body.telephone, req.body.biddernumber, req.body.consignorid], (err, results, fields) =>{
		if(err) return console.log(err);
		res.send({indicator: 'success', bidder: req.body})	
		res.end()
	});
})
router.post('/pos/livebidder', middleware.employeeLoggedIn, (req, res) => {
	db.query('SELECT * FROM tbl_live_bidder WHERE intLBAuctionID = ?', [req.body.id], (err, results, fields) => {
		if(err) console.log(err)
		console.log(results);
		res.send(results);
	})
});

//AJAX 
router.post('/eventdetails', middleware.employeeLoggedIn, (req, res) => {
	db.query('SELECT * FROM tbl_auction WHERE intAuctionID = ?', [req.body.auctionId], (err, results, fields) =>{
		res.send(results[0]);
	});
})

router.post('/auction/schedule', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body);
	db.query('UPDATE tbl_auction SET datDateStart=?, booAuctionStatus=? WHERE intAuctionID=?', [req.body.datDateStart, 1, req.body.id], (err, results, fields) =>{
		if(err) console.log(err)
		return res.send(true)
	});
});

/* editType
1 - update inside details including datDateStart(TIME)
2 - datDateStart(DATE)
3 - update duration (eventResize)
*/
router.post('/auction/edit', middleware.employeeLoggedIn, (req, res) => {
	var queryString;
	console.log(req.body)
	if(req.body.editType == 1){
		if(req.body.datDateStart){
			queryString = `UPDATE tbl_auction SET datDateStart=?, booAuctionType=?, jsonDuration=?, strAuctionName=?, strDescription=? WHERE intAuctionID=?`;
			if(req.body.booAuctionType == 1){
				req.body.datDateStart = moment(req.body.datDateStart).format('YYYY-MM-DD');
				req.body.datDateStart = ''+req.body.datDateStart+' 00:00';
				req.body.jsonDuration = JSON.stringify({days: 0, hours: 23, minutes:59, startingTime:'00:00'});
				db.query(queryString,[req.body.datDateStart,req.body.booAuctionType,req.body.jsonDuration,req.body.strAuctionName,req.body.strDescription,req.body.intAuctionID], (err, results, fields) => {
					if(err) console.log(err)
		
					return res.send(true)
				});
			}
			else{
				db.query(queryString,[req.body.datDateStart,req.body.booAuctionType,req.body.jsonDuration,req.body.strAuctionName,req.body.strDescription,req.body.intAuctionID], (err, results, fields) => {
					if(err) console.log(err)
		
					return res.send(true)
				});
			}
		}
		else{
			queryString = `UPDATE tbl_auction SET booAuctionType=?, jsonDuration=?, strAuctionName=?, strDescription=? WHERE intAuctionID=?`;
			if(req.body.booAuctionType == 1){
				req.body.jsonDuration = JSON.stringify({days: 0, hours: 23, minutes:59, startingTime:'00:00'});
				db.query(queryString,[req.body.booAuctionType,req.body.jsonDuration,req.body.strAuctionName,req.body.strDescription,req.body.intAuctionID], (err, results, fields) => {
					if(err) console.log(err)
		
					return res.send(true)
				});
			}
			else{
				db.query(queryString,[req.body.booAuctionType,req.body.jsonDuration,req.body.strAuctionName,req.body.strDescription,req.body.intAuctionID], (err, results, fields) => {
					if(err) console.log(err)
		
					return res.send(true)
				});	
			}
		}
	}
	if(req.body.editType == 2){
		queryString = `UPDATE tbl_auction SET datDateStart=? WHERE intAuctionID=?`;
		db.query(queryString, [req.body.datDateStart, req.body.intAuctionID], (err, results, fields) => {
			if(err) console.log(err)

			return res.send(true)
		})
	}
	if(req.body.editType == 3){
		req.body.jsonDuration = JSON.stringify(req.body.jsonDuration);
		console.log(req.body);
		queryString = `UPDATE tbl_auction SET jsonDuration = ? WHERE intAuctionID = ?`;
		db.query(queryString, [req.body.jsonDuration, req.body.intAuctionID], (err, results, fields) => {
			if(err) console.log(err)

			console.log(results);
			return res.send(true)
		});
	}
});
// banner edit separate post request
router.post('/auction/banner', middleware.employeeLoggedIn, upload.single('strBanner'), (req, res)=> {
	console.log(req.file)
	console.log('ID '+req.body.intAuctionID)
	if(typeof req.file == 'undefined'){
		db.query('UPDATE tbl_auction SET strBanner = "" WHERE intAuctionID = ?', [req.body.intAuctionID], (err, results, fields) =>{
			console.log('hello')
			if (err) console.log(err)
	
			return res.send(true);
		});
	}
	else{
		db.query('UPDATE tbl_auction SET strBanner = ? WHERE intAuctionID = ?', [req.file.filename, req.body.intAuctionID], (err, results, fields) =>{
			if (err) console.log(err)
	
			return res.send(true);
		});
	}
});
router.post('/auction/delete', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_auction SET booAuctionStatus = 4 WHERE intAuctionID = ?';
	var queryString2 = 'SELECT strCatalogItemID FROM tbl_catalog WHERE intCatalogAuctionID = ?';
	var queryString3 = 'DELETE FROM tbl_catalog WHERE intCatalogAuctionID = ?';
	var updateItem = 'UPDATE tbl_consignment_item SET booItemStatus = 0 WHERE strItemID = ?';
	var updateBundle = 'UPDATE tbl_bundle SET booBundleStatus = 0 WHERE intBundleID = ?';

	db.query(queryString2,[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		if(results.length>0){
			for(var a=0;a<results.length;a++){
				updateStatus(results[a].strCatalogItem);
				if(a == results.length - 1){
					db.query(queryString3,[req.body.id], (err, results, fields) => {
						if(err) console.log(err)
	
						db.query(queryString,[req.body.id], (err, results, fields) => {
							if(err) console.log(err)
	
							res.send({done:true});
						});
					});
				}
			}
		}
		else{
			db.query(queryString,[req.body.id], (err, results, fields) => {
				if(err) console.log(err)

				res.send({done:true});
			});
		}
	});

	function updateStatus(itemId){
		var query;
		if(typeof itemId == 'undefined') return
		else if(itemId[0] == 'I'){
			query = updateItem;
		}
		else if(itemId[0] == 'B'){
			query = updateBundle;
		}
		db.query(query,[itemId], (err, results, fields) => {
			if(err) console.log(err)

			console.log('updated');
		})
	}
});

router.post('/auction/refetch', middleware.employeeLoggedIn, (req, res) => {
	var events = [];
	db.query('SELECT * FROM tbl_auction WHERE booAuctionStatus != 0 AND booAuctionStatus != 4', (err, results, fields) => {
		if(err) console.log(err)

		for(var i=0;i<results.length;i++){
			results[i].jsonDuration = JSON.parse(results[i].jsonDuration)
			events.push({});
			events[i].id = results[i].intAuctionID;
			events[i].title = ''+results[i].strAuctionName+' - Auction #'+results[i].intAuctionID;
			events[i].start = moment(results[i].datDateStart).format('YYYY-MM-DD HH:mm');
			var endDate = moment(events[i].start).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').add(results[i].jsonDuration.minutes, 'm').format('YYYY-MM-DD HH:mm');
			events[i].end = endDate;
			if(results[i].booAuctionStatus == 1){
				events[i].color = '#591212'
				events[i].editable = true;
			}
			else if (results[i].booAuctionStatus == 2){
				events[i].color = '#125559'
				events[i].editable = false;
			}
			else if (results[i].booAuctionStatus == 3){
				events[i].color = '#125913'
				events[i].editable = false;
			}
			else if (results[i].booAuctionStatus == 5){
				events[i].color = '#630860'
			}
		}

		console.log(events)
		return res.send(events);
	});
});

router.post('/auction/schedule/validate', middleware.employeeLoggedIn, (req, res) =>{
	//var queryString = `SELECT * FROM tbl_auction WHERE DATE(datDateStart) BETWEEN ? AND ? AND booAuctionType = ? AND intAuctionID != ? AND booAuctionStatus!=4`;
	var testQueryString = `SELECT * FROM tbl_auction WHERE booAuctionStatus !=4`;
	// req.body.validateDateStart = moment(req.body.validateDateStart).format('YYYY-MM-DD');
	// req.body.validateDateEnd = moment(req.body.validateDateEnd).format('YYYY-MM-DD');
	// db.query(queryString,[req.body.validateDateStart, req.body.validateDateEnd, req.body.validateAuctionType, req.body.validateId], (err, results, fields) =>{
	// 	if(err) console.log(err)

	// 	console.log(results)

	// 	if(results.length==0){
	// 		return res.send({validity: 'valid'});
	// 	}
	// 	else return res.send({validity: 'invalid'});
	// });
	var valid = 0;
	db.query(testQueryString, (err, results, fields) =>{
		if(err) console.log(err);

		results.forEach(dbRecord => {
			if(dbRecord.intAuctionID == req.body.validateId) return;

			var recordJson = JSON.parse(dbRecord.jsonDuration);
			var recordDateStart = moment(dbRecord.datDateStart).format('YYYY-MM-DD');
			recordDateStart = recordDateStart +' '+recordJson.startingTime
			var recordDateEnd = moment(recordDateStart).add(recordJson.days, 'd').add(recordJson.hours, 'h').add(recordJson.minutes, 'm').format('YYYY-MM-DD HH:mm');

			// console.log((req.body.validateDateStart>=recordDateStart && req.body.validateDateStart<=recordDateEnd) +' una')
			// console.log((recordDateStart>=req.body.validateDateStart && recordDateStart<=req.body.validateDateEnd) +' pangalawa');
			// console.log((dbRecord.booAuctionType == req.body.validateAuctionType)+' pangatlo')
			// if( ((req.body.validateDateStart>=recordDateStart && req.body.validateDateStart<=recordDateEnd) || (recordDateStart>=req.body.validateDateStart && recordDateStart<=req.body.validateDateEnd)) && (dbRecord.booAuctionType == req.body.validateAuctionType) ){
			// 	console.log(''+req.body.validateDateStart+'>= '+recordDateStart+' && '+req.body.validateDateStart+'<= '+recordDateEnd+' || '+recordDateStart+'>= '+req.body.validateDateStart+' && '+recordDateStart+'<= '+req.body.validateDateEnd+' && '+dbRecord.booAuctionType+' == '+req.body.validateAuctionType);
			// 	valid++;
			// 	return;
			// }
			if( ((moment(req.body.validateDateStart).isSameOrAfter(recordDateStart) && moment(req.body.validateDateStart).isSameOrBefore(recordDateEnd)) || (moment(recordDateStart).isSameOrAfter(req.body.validateDateStart) && moment(recordDateStart).isSameOrBefore(req.body.validateDateEnd))) && (dbRecord.booAuctionType == req.body.validateAuctionType) ){
				console.log(''+req.body.validateDateStart+'>= '+recordDateStart+' && '+req.body.validateDateStart+'<= '+recordDateEnd+' || '+recordDateStart+'>= '+req.body.validateDateStart+' && '+recordDateStart+'<= '+req.body.validateDateEnd+' && '+dbRecord.booAuctionType+' == '+req.body.validateAuctionType);
				valid++;
				return;
			}
			else{
				return;
			}
		});

		if(valid==0){
			return res.send({validity: 'valid'});
		}
		else return res.send({validity: 'invalid'});
	});
});
router.get('/evaluation/consignor', middleware.employeeLoggedIn, middleware.acquisitionOrInventoryQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE booStatus = 2', (err, results, fields) => {
		if(err) console.log(err)
		console.log(results);
		res.render('management/views/consignorEvaluation',{session: req.session, consignors:results});
	})
});
router.post('/evaluation/consignor', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body);
	var queryString;
	var mailOptions;
	if(req.body.request == 'decline'){
		queryString = 'UPDATE tbl_consignor_accounts SET booStatus = 1 WHERE intConsignorAccountsID = ?';
		mailOptions = {
			from: '"AMSOB Team" <contact@amsob.com>', // sender address
			to: '', // list of receivers
			subject: `You can now consign with us!`, // Subject line
			html: 'Hi'
		};

	}
	else if(req.body.request == 'accept'){
		queryString = 'UPDATE tbl_consignor_accounts SET booStatus = 0 WHERE intConsignorAccountsID = ?'
		mailOptions = {
			from: '"AMSOB Team" <contact@amsob.com>', // sender address
			to: '', // list of receivers
			subject: `Hey, ${req.body.name}, your application have been approved.`, // Subject line
			html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
						<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
						<head>
							<!--[if gte mso 9]>
							<xml>
								<o:OfficeDocumentSettings>
									<o:AllowPNG/>
									<o:PixelsPerInch>96</o:PixelsPerInch>
								</o:OfficeDocumentSettings>
							</xml>
							<![endif]-->
							<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
							<meta name="viewport" content="width=device-width">
							<!--[if !mso]><!-->
							<meta http-equiv="X-UA-Compatible" content="IE=edge">
							<!--<![endif]-->
							<title>BF-ecommerce-template</title>
							<!--[if !mso]><!-- -->
							<link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css">
							<!--<![endif]-->
							<style type="text/css" id="media-query">
								body {
								margin: 0;
								padding: 0; }
								table, tr, td {
								vertical-align: top;
								border-collapse: collapse; }
								.ie-browser table, .mso-container table {
								table-layout: fixed; }
								* {
								line-height: inherit; }
								a[x-apple-data-detectors=true] {
								color: inherit !important;
								text-decoration: none !important; }
								[owa] .img-container div, [owa] .img-container button {
								display: block !important; }
								[owa] .fullwidth button {
								width: 100% !important; }
								[owa] .block-grid .col {
								display: table-cell;
								float: none !important;
								vertical-align: top; }
								.ie-browser .num12, .ie-browser .block-grid, [owa] .num12, [owa] .block-grid {
								width: 745px !important; }
								.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
								line-height: 100%; }
								.ie-browser .mixed-two-up .num4, [owa] .mixed-two-up .num4 {
								width: 248px !important; }
								.ie-browser .mixed-two-up .num8, [owa] .mixed-two-up .num8 {
								width: 496px !important; }
								.ie-browser .block-grid.two-up .col, [owa] .block-grid.two-up .col {
								width: 372px !important; }
								.ie-browser .block-grid.three-up .col, [owa] .block-grid.three-up .col {
								width: 248px !important; }
								.ie-browser .block-grid.four-up .col, [owa] .block-grid.four-up .col {
								width: 186px !important; }
								.ie-browser .block-grid.five-up .col, [owa] .block-grid.five-up .col {
								width: 149px !important; }
								.ie-browser .block-grid.six-up .col, [owa] .block-grid.six-up .col {
								width: 124px !important; }
								.ie-browser .block-grid.seven-up .col, [owa] .block-grid.seven-up .col {
								width: 106px !important; }
								.ie-browser .block-grid.eight-up .col, [owa] .block-grid.eight-up .col {
								width: 93px !important; }
								.ie-browser .block-grid.nine-up .col, [owa] .block-grid.nine-up .col {
								width: 82px !important; }
								.ie-browser .block-grid.ten-up .col, [owa] .block-grid.ten-up .col {
								width: 74px !important; }
								.ie-browser .block-grid.eleven-up .col, [owa] .block-grid.eleven-up .col {
								width: 67px !important; }
								.ie-browser .block-grid.twelve-up .col, [owa] .block-grid.twelve-up .col {
								width: 62px !important; }
								@media only screen and (min-width: 765px) {
								.block-grid {
								width: 745px !important; }
								.block-grid .col {
								vertical-align: top; }
								.block-grid .col.num12 {
								width: 745px !important; }
								.block-grid.mixed-two-up .col.num4 {
								width: 248px !important; }
								.block-grid.mixed-two-up .col.num8 {
								width: 496px !important; }
								.block-grid.two-up .col {
								width: 372px !important; }
								.block-grid.three-up .col {
								width: 248px !important; }
								.block-grid.four-up .col {
								width: 186px !important; }
								.block-grid.five-up .col {
								width: 149px !important; }
								.block-grid.six-up .col {
								width: 124px !important; }
								.block-grid.seven-up .col {
								width: 106px !important; }
								.block-grid.eight-up .col {
								width: 93px !important; }
								.block-grid.nine-up .col {
								width: 82px !important; }
								.block-grid.ten-up .col {
								width: 74px !important; }
								.block-grid.eleven-up .col {
								width: 67px !important; }
								.block-grid.twelve-up .col {
								width: 62px !important; } }
								@media (max-width: 765px) {
								.block-grid, .col {
								min-width: 320px !important;
								max-width: 100% !important;
								display: block !important; }
								.block-grid {
								width: calc(100% - 40px) !important; }
								.col {
								width: 100% !important; }
								.col > div {
								margin: 0 auto; }
								img.fullwidth, img.fullwidthOnMobile {
								max-width: 100% !important; }
								.no-stack .col {
								min-width: 0 !important;
								display: table-cell !important; }
								.no-stack.two-up .col {
								width: 50% !important; }
								.no-stack.mixed-two-up .col.num4 {
								width: 33% !important; }
								.no-stack.mixed-two-up .col.num8 {
								width: 66% !important; }
								.no-stack.three-up .col.num4 {
								width: 33% !important; }
								.no-stack.four-up .col.num3 {
								width: 25% !important; }
								.mobile_hide {
								min-height: 0px;
								max-height: 0px;
								max-width: 0px;
								display: none;
								overflow: hidden;
								font-size: 0px; } }
							</style>
						</head>
						<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF">
							<style type="text/css" id="media-query-bodytag">
								@media (max-width: 520px) {
								.block-grid {
								min-width: 320px!important;
								max-width: 100%!important;
								width: 100%!important;
								display: block!important;
								}
								.col {
								min-width: 320px!important;
								max-width: 100%!important;
								width: 100%!important;
								display: block!important;
								}
								.col > div {
								margin: 0 auto;
								}
								img.fullwidth {
								max-width: 100%!important;
								}
								img.fullwidthOnMobile {
								max-width: 100%!important;
								}
								.no-stack .col {
								min-width: 0!important;
								display: table-cell!important;
								}
								.no-stack.two-up .col {
								width: 50%!important;
								}
								.no-stack.mixed-two-up .col.num4 {
								width: 33%!important;
								}
								.no-stack.mixed-two-up .col.num8 {
								width: 66%!important;
								}
								.no-stack.three-up .col.num4 {
								width: 33%!important;
								}
								.no-stack.four-up .col.num3 {
								width: 25%!important;
								}
								.mobile_hide {
								min-height: 0px!important;
								max-height: 0px!important;
								max-width: 0px!important;
								display: none!important;
								overflow: hidden!important;
								font-size: 0px!important;
								}
								}
							</style>
							<!--[if IE]>
							<div class="ie-browser">
							<![endif]-->
							<!--[if mso]>
							<div class="mso-container">
								<![endif]-->
								<table class="nl-container" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #FFFFFF;width: 100%" cellpadding="0" cellspacing="0">
									<tbody>
									<tr style="vertical-align: top">
										<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
											<!--[if (mso)|(IE)]>
											<table width="100%" cellpadding="0" cellspacing="0" border="0">
												<tr>
												<td align="center" style="background-color: #FFFFFF;">
													<![endif]-->
													<div style="background-color:#E1607E;">
														<div style="Margin: 0 auto;min-width: 320px;max-width: 745px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="block-grid two-up ">
															<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
															<!--[if (mso)|(IE)]>
															<table width="100%" cellpadding="0" cellspacing="0" border="0">
																<tr>
																	<td style="background-color:#E1607E;" align="center">
																		<table cellpadding="0" cellspacing="0" border="0" style="width: 745px;">
																		<tr class="layout-full-width" style="background-color:transparent;">
																			<![endif]-->
																			<!--[if (mso)|(IE)]>
																			<td align="center" width="372" style=" width:372px; padding-right: 0px; padding-left: 0px; padding-top:30px; padding-bottom:25px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top">
																				<![endif]-->
																				<div class="col num6" style="min-width: 320px;max-width: 372px;display: table-cell;vertical-align: top;">
																					<div style="background-color: transparent; width: 100% !important;">
																					<!--[if (!mso)&(!IE)]><!-->
																					<div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:30px; padding-bottom:25px; padding-right: 0px; padding-left: 0px;">
																						<!--<![endif]-->
																						<div align="left" class="img-container left fixedwidth " style="padding-right: 0px;  padding-left: 0px;">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr style="line-height:0px;line-height:0px;">
																								<td style="padding-right: 0px; padding-left: 0px;" align="left">
																									<![endif]-->
																									<div style="line-height:5px;font-size:1px">&#160;</div>
																									<a href="https://beefree.io" target="_blank">
																									<img class="left fixedwidth" align="left" border="0" src="https://cdn1.imggmi.com/uploads/2018/10/15/2e1cd27262379e75b64f11ed075420e1-full.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;width: 100%;max-width: 372.5px" width="372.5">
																									</a>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<!--[if (!mso)&(!IE)]><!-->
																					</div>
																					<!--<![endif]-->
																					</div>
																				</div>
																				<!--[if (mso)|(IE)]>
																			</td>
																			<td align="center" width="372" style=" width:372px; padding-right: 0px; padding-left: 0px; padding-top:20px; padding-bottom:20px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top">
																				<![endif]-->
																				<div class="col num6" style="min-width: 320px;max-width: 372px;display: table-cell;vertical-align: top;">
																					<div style="background-color: transparent; width: 100% !important;">
																					<!--[if (!mso)&(!IE)]><!-->
																					<div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:20px; padding-bottom:20px; padding-right: 0px; padding-left: 0px;">
																						<!--<![endif]-->
																						<div class="">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr>
																								<td style="padding-right: 10px; padding-left: 10px; padding-top: 53px; padding-bottom: 15px;">
																									<![endif]-->
																									<div style="color:#FFFFFF;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:150%; padding-right: 10px; padding-left: 10px; padding-top: 53px; padding-bottom: 15px;">
																										<div style="font-family:Montserrat, 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:12px;line-height:18px;color:#FFFFFF;text-align:left;">
																											<div style="line-height:18px; font-size:12px; text-align: right;"><span style="font-size: 18px; line-height: 27px;"><strong><span style="line-height: 27px; font-size: 18px;">Consign your assets, make it money!</span></strong></span></div>
																										</div>
																									</div>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<!--[if (!mso)&(!IE)]><!-->
																					</div>
																					<!--<![endif]-->
																					</div>
																				</div>
																				<!--[if (mso)|(IE)]>
																			</td>
																		</tr>
																		</table>
																	</td>
																</tr>
															</table>
															<![endif]-->
															</div>
														</div>
													</div>
													<div style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/113/Schermata_2018-07-06_alle_15.10.11.png');background-position:top left;background-repeat:no-repeat;;background-color:#CF49FD">
														<div style="Margin: 0 auto;min-width: 320px;max-width: 745px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="block-grid ">
															<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
															<!--[if (mso)|(IE)]>
															<table width="100%" cellpadding="0" cellspacing="0" border="0">
																<tr>
																	<td style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/113/Schermata_2018-07-06_alle_15.10.11.png');background-position:top left;background-repeat:no-repeat;;background-color:#CF49FD" align="center">
																		<table cellpadding="0" cellspacing="0" border="0" style="width: 745px;">
																		<tr class="layout-full-width" style="background-color:transparent;">
																			<![endif]-->
																			<!--[if (mso)|(IE)]>
																			<td align="center" width="745" style=" width:745px; padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:60px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top">
																				<![endif]-->
																				<div class="col num12" style="min-width: 320px;max-width: 745px;display: table-cell;vertical-align: top;">
																					<div style="background-color: transparent; width: 100% !important;">
																					<!--[if (!mso)&(!IE)]><!-->
																					<div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:0px; padding-bottom:60px; padding-right: 0px; padding-left: 0px;">
																						<!--<![endif]-->
																						<table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																							<tbody>
																								<tr style="vertical-align: top">
																								<td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																									<table class="divider_content" height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 10px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																										<tbody>
																											<tr style="vertical-align: top">
																											<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																												<span>&#160;</span>
																											</td>
																											</tr>
																										</tbody>
																									</table>
																								</td>
																								</tr>
																							</tbody>
																						</table>
																						<div class="">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr>
																								<td style="padding-right: 0px; padding-left: 0px; padding-top: 30px; padding-bottom: 0px;">
																									<![endif]-->
																									<div style="color:#ffffff;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:120%; padding-right: 0px; padding-left: 0px; padding-top: 30px; padding-bottom: 0px;">
																										<div style="font-size:12px;line-height:14px;font-family:Montserrat, 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;color:#ffffff;text-align:left;">
																											<p style="margin: 0;font-size: 14px;line-height: 17px;text-align: center"><span style="font-size: 28px; line-height: 33px;">WELCOME, ${req.body.name}, TO<strong>&#160;</strong><br></span><span style="font-size: 80px; line-height: 96px;"><span style="line-height: 96px; font-size: 80px;">APPTRADE INC</span></span></p>
																										</div>
																									</div>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																							<tbody>
																								<tr style="vertical-align: top">
																								<td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 0px;padding-left: 0px;padding-top: 0px;padding-bottom: 0px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																									<table class="divider_content" height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 10px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																										<tbody>
																											<tr style="vertical-align: top">
																											<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																												<span>&#160;</span>
																											</td>
																											</tr>
																										</tbody>
																									</table>
																								</td>
																								</tr>
																							</tbody>
																						</table>
																						<div align="center" class="img-container center fixedwidth " style="padding-right: 0px;  padding-left: 0px;">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr style="line-height:0px;line-height:0px;">
																								<td style="padding-right: 0px; padding-left: 0px;" align="center">
																									<![endif]-->
																									<a href="https://beefree.io" target="_blank">
																									<img class="center fixedwidth" align="center" border="0" src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/113/rocket-color.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;width: 100%;max-width: 409.75px" width="409.75">
																									</a>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<!--[if (!mso)&(!IE)]><!-->
																					</div>
																					<!--<![endif]-->
																					</div>
																				</div>
																				<!--[if (mso)|(IE)]>
																			</td>
																		</tr>
																		</table>
																	</td>
																</tr>
															</table>
															<![endif]-->
															</div>
														</div>
													</div>
													<div style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/113/gradient-pink_1.png');background-position:top center;background-repeat:no-repeat;;background-color:transparent">
														<div style="Margin: 0 auto;min-width: 320px;max-width: 745px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="block-grid ">
															<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
															<!--[if (mso)|(IE)]>
															<table width="100%" cellpadding="0" cellspacing="0" border="0">
																<tr>
																	<td style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/113/gradient-pink_1.png');background-position:top center;background-repeat:no-repeat;;background-color:transparent" align="center">
																		<table cellpadding="0" cellspacing="0" border="0" style="width: 745px;">
																		<tr class="layout-full-width" style="background-color:transparent;">
																			<![endif]-->
																			<!--[if (mso)|(IE)]>
																			<td align="center" width="745" style=" width:745px; padding-right: 0px; padding-left: 0px; padding-top:30px; padding-bottom:30px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top">
																				<![endif]-->
																				<div class="col num12" style="min-width: 320px;max-width: 745px;display: table-cell;vertical-align: top;">
																					<div style="background-color: transparent; width: 100% !important;">
																					<!--[if (!mso)&(!IE)]><!-->
																					<div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:30px; padding-bottom:30px; padding-right: 0px; padding-left: 0px;">
																						<!--<![endif]-->
																						<div class="">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr>
																								<td style="padding-right: 10px; padding-left: 10px; padding-top: 35px; padding-bottom: 10px;">
																									<![endif]-->
																									<div style="color:#C72E8E;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 35px; padding-bottom: 10px;">
																										<div style="font-family:Montserrat, 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:14px;font-size:12px;color:#C72E8E;text-align:left;">
																											<p style="margin: 0;line-height: 14px;text-align: center;font-size: 12px"><span style="font-size: 34px; line-height: 40px;">Start Consigning!</span></p>
																										</div>
																									</div>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<div class="">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr>
																								<td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 30px;">
																									<![endif]-->
																									<div style="color:#555555;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 30px;">
																										<div style="line-height:14px;font-family:Montserrat, 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:12px;color:#555555;text-align:left;">
																											<p style="margin: 0;line-height: 14px;text-align: center;font-size: 12px"><span style="font-size: 18px; line-height: 21px;">Have items you want to consign? With a bigger value?</span></p>
																										</div>
																									</div>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<div align="center" class="button-container center " style="padding-right: 10px; padding-left: 10px; padding-top:15px; padding-bottom:10px;">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
																								<tr>
																								<td style="padding-right: 10px; padding-left: 10px; padding-top:15px; padding-bottom:10px;" align="center">
																									<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:34pt; v-text-anchor:middle; width:194pt;" arcsize="55%" strokecolor="#C72E8E" fillcolor="#C72E8E">
																										<w:anchorlock/>
																										<v:textbox inset="0,0,0,0">
																											<center style="color:#ffffff; font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; font-size:18px;">
																											<![endif]-->
																											<div style="color: #ffffff; background-color: #C72E8E; border-radius: 25px; -webkit-border-radius: 25px; -moz-border-radius: 25px; max-width: 705px; width: 35%; border-top: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent; border-left: 0px solid transparent; padding-top: 5px; padding-right: 20px; padding-bottom: 5px; padding-left: 20px; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; text-align: center; mso-border-alt: none;">
																												<span style="font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:16px;line-height:32px;"><span style="font-size: 18px; line-height: 28px;"><a href="http://${req.hostname}:${req.port}/consignorportal">Consign Now</a></span></span>
																											</div>
																											<!--[if mso]>
																											</center>
																										</v:textbox>
																									</v:roundrect>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																							<tbody>
																								<tr style="vertical-align: top">
																								<td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																									<table class="divider_content" height="15px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																										<tbody>
																											<tr style="vertical-align: top">
																											<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 15px;line-height: 15px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
																												<span>&#160;</span>
																											</td>
																											</tr>
																										</tbody>
																									</table>
																								</td>
																								</tr>
																							</tbody>
																						</table>
																						<!--[if (!mso)&(!IE)]><!-->
																					</div>
																					<!--<![endif]-->
																					</div>
																				</div>
																				<!--[if (mso)|(IE)]>
																			</td>
																		</tr>
																		</table>
																	</td>
																</tr>
															</table>
															<![endif]-->
															</div>
														</div>
													</div>
													<div style="background-color:#F0F0F0;">
														<div style="Margin: 0 auto;min-width: 320px;max-width: 745px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="block-grid ">
															<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
															<!--[if (mso)|(IE)]>
															<table width="100%" cellpadding="0" cellspacing="0" border="0">
																<tr>
																	<td style="background-color:#F0F0F0;" align="center">
																		<table cellpadding="0" cellspacing="0" border="0" style="width: 745px;">
																		<tr class="layout-full-width" style="background-color:transparent;">
																			<![endif]-->
																			<!--[if (mso)|(IE)]>
																			<td align="center" width="745" style=" width:745px; padding-right: 0px; padding-left: 0px; padding-top:30px; padding-bottom:30px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top">
																				<![endif]-->
																				<div class="col num12" style="min-width: 320px;max-width: 745px;display: table-cell;vertical-align: top;">
																					<div style="background-color: transparent; width: 100% !important;">
																					<!--[if (!mso)&(!IE)]><!-->
																					<div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:30px; padding-bottom:30px; padding-right: 0px; padding-left: 0px;">
																						<!--<![endif]-->
																						<div align="center" style="padding-right: 10px; padding-left: 10px; padding-bottom: 10px;" class="">
																							<div style="line-height:10px;font-size:1px">&#160;</div>
																							<div style="display: table; max-width:151px;">
																								<!--[if (mso)|(IE)]>
																								<table width="131" cellpadding="0" cellspacing="0" border="0">
																								<tr>
																									<td style="border-collapse:collapse; padding-right: 10px; padding-left: 10px; padding-bottom: 10px;"  align="center">
																										<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:131px;">
																											<tr>
																											<td width="32" style="width:32px; padding-right: 5px;" valign="top">
																												<![endif]-->
																												<table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;Margin-right: 5px">
																													<tbody>
																														<tr style="vertical-align: top">
																														<td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
																															<a href="https://www.facebook.com/" title="Facebook" target="_blank">
																															<img src="https://scontent.fmnl2-1.fna.fbcdn.net/v/t1.0-9/44057243_10212747182334235_3309398380332974080_n.jpg?_nc_cat=107&oh=cdb58f5e22c0632e67055877433ce176&oe=5C4BEA44" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
																															</a>
																															<div style="line-height:5px;font-size:1px">&#160;</div>
																														</td>
																														</tr>
																													</tbody>
																												</table>
																												<!--[if (mso)|(IE)]>
																											</td>
																											<td width="32" style="width:32px; padding-right: 5px;" valign="top">
																												<![endif]-->
																												<table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;Margin-right: 5px">
																													<tbody>
																														<tr style="vertical-align: top">
																														<td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
																															<a href="http://twitter.com/" title="Twitter" target="_blank">
																															<img src="https://scontent.fmnl2-1.fna.fbcdn.net/v/t1.0-9/44091737_10212747182814247_8391217196927287296_n.jpg?_nc_cat=109&oh=9b6fec2e983a0fba6e5dd7c6c3b354e5&oe=5C4CAC34" alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
																															</a>
																															<div style="line-height:5px;font-size:1px">&#160;</div>
																														</td>
																														</tr>
																													</tbody>
																												</table>
																												<!--[if (mso)|(IE)]>
																											</td>
																											<td width="32" style="width:32px; padding-right: 0;" valign="top">
																												<![endif]-->
																												<table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;Margin-right: 0">
																													<tbody>
																														<tr style="vertical-align: top">
																														<td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
																															<a href="http://plus.google.com/" title="Google+" target="_blank">
																															<img src="https://scontent.fmnl2-1.fna.fbcdn.net/v/t1.0-9/44125442_10212747182254233_6167821565338583040_n.jpg?_nc_cat=104&oh=03a928f82c8f6b1e9662b176c47523f8&oe=5C539C4C" alt="Google+" title="Google+" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
																															</a>
																															<div style="line-height:5px;font-size:1px">&#160;</div>
																														</td>
																														</tr>
																													</tbody>
																												</table>
																												<!--[if (mso)|(IE)]>
																											</td>
																											</tr>
																										</table>
																									</td>
																								</tr>
																								</table>
																								<![endif]-->
																							</div>
																						</div>
																						<div class="">
																							<!--[if mso]>
																							<table width="100%" cellpadding="0" cellspacing="0" border="0">
																								<tr>
																								<td style="padding-right: 10px; padding-left: 10px; padding-top: 15px; padding-bottom: 10px;">
																									<![endif]-->
																									<div style="color:#959595;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:150%; padding-right: 10px; padding-left: 10px; padding-top: 15px; padding-bottom: 10px;">
																										<div style="font-size:12px;line-height:18px;font-family:Montserrat, 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;color:#959595;text-align:left;">
																											<p style="margin: 0;font-size: 14px;line-height: 21px;text-align: center">APPTRADE INC © All rights reserved</p>
																										</div>
																									</div>
																									<!--[if mso]>
																								</td>
																								</tr>
																							</table>
																							<![endif]-->
																						</div>
																						<!--[if (!mso)&(!IE)]><!-->
																					</div>
																					<!--<![endif]-->
																					</div>
																				</div>
																				<!--[if (mso)|(IE)]>
																			</td>
																		</tr>
																		</table>
																	</td>
																</tr>
															</table>
															<![endif]-->
															</div>
														</div>
													</div>
													<!--[if (mso)|(IE)]>
												</td>
												</tr>
											</table>
											<![endif]-->
										</td>
									</tr>
									</tbody>
								</table>
								<!--[if (mso)|(IE)]>
							</div>
							<![endif]-->
						</body>
						</html>`,
		};
	}
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		db.query('SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE booStatus = 2; SELECT * FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID WHERE intConsignorAccountsID = ?', [req.body.id],(err, results, fields) => {
			if(err) console.log(err)
			
			mailOptions.to = results[1][0].strEmail;
			//Nodemailer
			nodemailer.createTestAccount((err, account) => {

					// create reusable transporter object using the default SMTP transport
				let transporter = nodemailer.createTransport({
					host: 'smtp.gmail.com.',
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: 'suyoteam@gmail.com',
						pass: 'froyefritzkobisherwin'
					}
				});

				// send mail with defined transport object
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						return console.log(error);
					}
					console.log('Message sent: %s', info.messageId);
					// Preview only available when sending through an Ethereal account
					console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
					// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
					// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
				});
			});
			//Nodemailer
			console.log('what wehow')
			res.send({response:'updated', refetch:results[0]})
			res.end();
		})
	});
});
router.get('/evaluation/bidder', middleware.employeeLoggedIn, middleware.auctionQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBABidderID=intBidderID WHERE booStatus = 0', (err, results, fields) => {
		if(err) console.log(err)
		
		res.render('management/views/bidderEvaluation', {bidders: results, session:req.session});
	})
})
router.post('/evaluation/bidder', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body);
	var queryString;
	if(req.body.request = 'accept'){
		queryString = 'UPDATE tbl_bidder_accounts SET booStatus = 2 WHERE intBABidderID = ?';
	}
	// else if(req.body.request = 'decline'){
	// 	queryString = 'UPDATE tbl_consignor_accounts SET booStatus = 1 WHERE intConsignorAccountsID = ?'
	// }
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		db.query('SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBABidderID=intBidderID WHERE booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
			
			res.send({response:'updated', refetch:results})
			res.end();
		})
	});
});
router.get('/verify/bidder', middleware.employeeLoggedIn, middleware.acquisitionOrAuctionQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBABidderID=intBidderID WHERE booStatus = 2 AND strBankReferenceNo != "NULL" AND strReferencePicture != "NULL"', (err, results, fields) => {
		if(err) console.log(err)
		
		res.render('management/views/bidderVerification', {bidders: results, session:req.session});
	})
});
router.post('/verify/bidder', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body);
	var queryString;
	if(req.body.request = 'accept'){
		queryString = 'UPDATE tbl_bidder_accounts SET booStatus = 1 WHERE intBABidderID = ?';
	}
	else if(req.body.request = 'decline'){
		queryString = 'UPDATE tbl_bidder SET strBankReferenceNo = NULL, strReferencePicture = NULL WHERE intBidderID = ?'
	}
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		db.query('SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBABidderID=intBidderID WHERE booStatus = 2 AND strBankReferenceNo != "NULL" AND strReferencePicture != "NULL"', (err, results, fields) => {
			if(err) console.log(err)
			
			res.send({response:'updated', refetch:results})
			res.end();
		})
	});
});
router.get('/uom', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_unit_of_measurement WHERE booStatus = 0', (err, results, fields) => {
		if(err) console.log(err)

		res.render('management/views/uom', {uoms: results, session:req.session})
	})
});
router.post('/uom', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'INSERT INTO tbl_unit_of_measurement (strUOMDesc) VALUES (?)';
	db.query(queryString, [req.body.description], (err, results, fields) => {
		if(err) console.log(err)

		res.send({id: results.insertId, desc: req.body.description});
		res.end();
	});
});
router.post('/uom/delete', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_unit_of_measurement SET booStatus = 1 WHERE intUOMID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err);

		db.query('SELECT * FROM tbl_unit_of_measurement WHERE booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
			res.send({uoms: results})
			res.end();
		})
	});
});
router.post('/uom/view', middleware.employeeLoggedIn, (req, res) => {
	console.log("aaaaa")
	var queryString = 'SELECT strUOMDesc FROM tbl_unit_of_measurement WHERE intUOMID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err);
		console.log(results)	
			res.send({uoms: results[0]})
			res.end();
	})
});

router.post('/uom/edit', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_unit_of_measurement SET strUOMDesc = ? WHERE intUOMID = ?';
	db.query(queryString,[req.body.description,req.body.id], (err, results, fields) => {
		if(err) console.log(err);
		db.query('SELECT * FROM tbl_unit_of_measurement WHERE booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
	
			res.send({uoms: results, check : 'true'})
			res.end();
		})
	});
});
router.get('/jobtitle', middleware.employeeLoggedIn, middleware.acquisitionQualified, middleware.inventoryQualified, middleware.auctionQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_job_title WHERE booStatus = 1', (err, results, fields) => {
		if(err) console.log(err)

		res.render('management/views/jobtitle', {jobTitles: results, session:req.session})
	})
});

router.post('/jobtitle', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'INSERT INTO tbl_job_title (strJobTitle) VALUES (?)';
	db.query(queryString, [req.body.description], (err, results, fields) => {
		if(err) console.log(err)
		console.log(results)

		res.send({id: results.insertId, desc: req.body.description});
		res.end();
	});
});
router.post('/jobtitle/view', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'SELECT strJobTitle FROM tbl_job_title WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err);
		console.log(results)	
			res.send({jobtitle: results[0]})
			res.end();
	})
});
router.post('/jobtitle/edit', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET strJobTitle = ? WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.description,req.body.id], (err, results, fields) => {
		if(err) console.log(err);
		db.query('SELECT * FROM tbl_job_title WHERE booStatus = 1', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
	
			res.send({jobs: results, check : 'true'})
			res.end();
		})
	});
});
router.post('/jobtitle/acquisition/checked', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booAcquisition = 1 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.jobId], (err, results, fields) => {	
		if(err) console.log(err)
	})
});
router.post('/jobtitle/acquisition/unchecked', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booAcquisition = 0 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.jobId], (err, results, fields) => {	
		if(err) console.log(err)
	})
});
router.post('/jobtitle/inventory/checked', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booInventory = 1 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.jobId], (err, results, fields) => {	
		if(err) console.log(err)
		console.log("inventory")
	})
});
router.post('/jobtitle/inventory/unchecked', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booInventory = 0 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.jobId], (err, results, fields) => {	
		if(err) console.log(err)
	})
});
router.post('/jobtitle/auction/checked', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booAuction = 1 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.jobId], (err, results, fields) => {	
		if(err) console.log(err)
	})
});
router.post('/jobtitle/auction/unchecked', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booAuction = 0 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.jobId], (err, results, fields) => {	
		if(err) console.log(err)
	})
});
router.post('/jobtitle/delete', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_job_title SET booStatus = 0 WHERE intJobTitleID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err);

		db.query('SELECT * FROM tbl_job_title WHERE booStatus = 1', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
			res.send({jobs: results})
			res.end();
		})
	});
});
router.get('/idtypes', middleware.employeeLoggedIn, middleware.acquisitionQualified, middleware.inventoryQualified, middleware.auctionQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_id_types WHERE booStatus = 0', (err, results, fields) => {
		if(err) console.log(err)

		res.render('management/views/idtypes', {idtypes: results, session:req.session})
	})
});
router.post('/idtypes/view', middleware.employeeLoggedIn, (req, res) => {
	console.log('eyy')
	var queryString = 'SELECT * FROM tbl_id_types WHERE intIDtypeID = ?';
	db.query(queryString, [req.body.id], (err, results, fields)=>{
		if(err) console.log(err)
		console.log(results)

		res.send({idtypes: results[0]})
		res.end()
	})
});
router.post('/idtypes/edit', middleware.employeeLoggedIn, (req, res) => {
	console.log('eyys')
	console.log(req.body.id)
	var queryString = 'UPDATE tbl_id_types SET strIDTypeDesc = ?, strIDTypeFormat = ? WHERE intIDtypeID = ?';
	db.query(queryString, [req.body.desc,req.body.format,req.body.id], (err, results, fields)=>{
		if(err) console.log(err)
		console.log(results)
		db.query('SELECT * FROM tbl_id_types WHERE booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
	
			res.send({idtypes: results})
			res.end();
		})	
	})
});
router.post('/idtypes', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'INSERT INTO tbl_id_types (strIDTypeDesc, strIDTypeFormat) VALUES (?,?)';
	db.query(queryString, [req.body.desc, req.body.format], (err, results, fields) => {
		if(err) console.log(err)
		console.log(results)

		res.send({id: results.insertId});
		res.end();
	});
});
router.post('/idtypes/delete', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_id_types SET booStatus = 1 WHERE intIDTypeID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err);

		db.query('SELECT * FROM tbl_id_types WHERE booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
	
			res.send({idtypes: results})
			res.end();
		})
	});
});
router.get('/employee', middleware.employeeLoggedIn, middleware.acquisitionQualified, middleware.inventoryQualified, middleware.auctionQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_employee JOIN tbl_job_title ON intJobType = intJobTitleID  WHERE tbl_employee.booStatus = 0', (err, results, fields) => {
		if(err) console.log(err)
		console.log(results)	
	
		res.render('management/views/employee', {employeeList: results, session:req.session})
	})
});
router.post('/jobgroup', middleware.employeeLoggedIn, (req, res) => {
	db.query('SELECT intJobTitleID, strJobTitle FROM tbl_job_title WHERE booStatus = 1', (err, results, fields) => {
		if(err) console.log(err)
		console.log(results)

		res.send({job: results})
		res.end();
	})
});

router.post('/employee', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `INSERT INTO tbl_employee (strEmployeeFirstName,strEmployeeLastName, strEmployeeMiddleName, intJobType, strEmailAddress, strContactNumber, strUsername, strPassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	var queryString1 = `SELECT strJobTitle FROM tbl_job_title WHERE intJobTitleID = ?`
	db.query(queryString, [req.body.firstname, req.body.lastname, req.body.middlename, req.body.Job, req.body.Email, req.body.Contact, req.body.Username, req.body.Password], (err, results, fields) =>{
		if(err) return console.log(err);
		var id = results.insertId	
		db.query(queryString1,[req.body.Job], (err, results, fields) => {
			if(err) return console.log(err)
			console.log(results)
			res.send({jfind: results[0], indicator : 'success', id: id})
			res.end()
		})
	});	
});
router.post('/employee/delete', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_employee SET booStatus = 1 WHERE intEmployeeID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err);
		console.log(results)
		db.query('SELECT * FROM tbl_employee JOIN tbl_job_title ON intJobType = intJobTitleID  WHERE tbl_employee.booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
			res.send({employee: results})
			res.end();
		})
	});
});
router.post('/employee/view', middleware.employeeLoggedIn, (req, res) => {
	console.log('eyy')
	var queryString = 'SELECT * FROM tbl_employee JOIN tbl_job_title ON intJobType = intJobTitleID  WHERE tbl_employee.booStatus = 0';
	db.query(queryString, [req.body.id], (err, results, fields)=>{
		if(err) console.log(err)
		console.log(results)

		res.send({employee: results[0]})
		res.end()
	})
});

router.post('/employee/edit', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'UPDATE tbl_employee SET strEmployeeFirstName = ?, strEmployeeMiddleName = ?, strEmployeeLastName = ?, strEmailAddress = ?, strContactNumber = ?, intJobType = ?, strUsername = ?, strPassword = ? WHERE intEmployeeID = ?';
	db.query(queryString, [req.body.firstname, req.body.middlename, req.body.lastname, req.body.Email, req.body.Contact, req.body.Job, req.body.Username, req.body.Password, req.body.id], (err, results, fields)=>{
		if(err) console.log(err)
		console.log(results)
		db.query('SELECT * FROM tbl_employee JOIN tbl_job_title ON intJobType = intJobTitleID  WHERE tbl_employee.booStatus = 0', (err, results, fields) => {
			if(err) console.log(err)
			console.log(results)
	
			res.send({employee: results, indicator: 'success'})
			res.end();
		})	
	})
});
router.post('/catalog/fetch/items/:auctionId', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT intConsignmentItemID,intCIConsignment,strItemDescription,strCategory,booItemStatus,strUOM,jsonOtherSpecifications,intQTY,booIsReceived,booIsBundled,booPrice,strName,strItemID FROM tbl_consignment_item
	JOIN tbl_consignment ON intCIConsignment=intConsignmentID
	JOIN tbl_consignor ON intConsignmentConsignorID=intConsignorID
	WHERE booIsReceived = 1 AND booIsBundled = 0 AND booItemStatus = 0`;
	var queryString2 = 'SELECT intCatalogAuctionID FROM tbl_catalog WHERE strCatalogItemID = ?'
	var queryString3 = `SELECT intBundleID,dblBundlePrice,strBundleTitle,booBundleStatus,intBundleConsignmentID,strName FROM tbl_bundle
	JOIN tbl_consignment ON intBundleConsignmentID=intConsignmentID
	JOIN tbl_consignor ON intConsignmentConsignorID=intConsignorID
	WHERE booBundleStatus = 0`;
	var auctionItems = [];
	var notAuctionItems = [];
	var totalItems = 0;
	var totalItems2 = 0
	var counter = 0
	var toggle = true;

	db.query(queryString, (err, results, fields) => {
		if(err) console.log(err)
		
		if(results.length<=0){
			db.query(queryString3, (err, results, fields) => {
				if(err) console.log(err)
		
				totalItems2 = totalItems2 + results.length
				if(results.length == 0) return setTimeout(done,1000)
				else{
					for(var o=0;o<results.length;o++){
						getAuctionId(results[o],1, function(){
							console.log('bundle')
						});
						if(results.length-1 == o){
							counter+=results.length
							return setTimeout(done,1000)
						}
					}
				}
			});
		}
		else{
			totalItems = totalItems + results.length
			for(var r=0;r<results.length;r++){
				getAuctionId(results[r],0, function(){
					console.log('item')
				});
				if(results.length-1 == r){
					counter+=results.length
					db.query(queryString3, (err, results, fields) => {
						if(err) console.log(err)
				
						totalItems2 = totalItems2 + results.length
						if(results.length == 0) return setTimeout(done,1000)
						else{
							for(var o=0;o<results.length;o++){
								getAuctionId(results[o],1, function(){
									console.log('bundle')
								});
								if(results.length-1 == o){
									counter+=results.length
									return setTimeout(done,1000)
								}
							}
						}
					});
				}
			}
		}
		
	});
	function getAuctionId(item, type, callback){
		if(type == 0){
			db.query(queryString2,[item.strItemID], (err, results, fields) => {
				if(err) console.log(err)
				if(results[0]){
					console.log(item)
					if(results[0].intCatalogAuctionID != req.params.auctionId){
						console.log('not')
						notAuctionItems.push(item)
					}
					else{
						auctionItems.push(item)
					}
				}
				else{
					notAuctionItems.push(item)
				}
				return callback();
			});
		}
		else if(type == 1){
			db.query(queryString2,[item.intBundleID], (err, results, fields) => {
				if(err) console.log(err)
				if(results[0]){
					console.log(item)
					if(results[0].intCatalogAuctionID != req.params.auctionId){
						console.log('not')
						notAuctionItems.push(item)
					}
					else{
						auctionItems.push(item)
					}
				}
				else{
					notAuctionItems.push(item)
				}
				return callback();
			});
		}
	}
	function done(){
		console.log('done is '+counter)
		if(toggle){
			if( (totalItems+totalItems2) == counter){
				toggle = false;
				return res.send({catalog:auctionItems, available: notAuctionItems});
			}
		}
	}
});
router.get('/auction/catalog/:auctionId', middleware.employeeLoggedIn, middleware.auctionQualified, (req, res) => {
	
	delete req.session.bundles;
	delete req.session.bundleCount;
	delete req.session.removeFromCatalog;
	res.render('management/views/catalog', {session: req.session, auctionId: req.params.auctionId});
});
router.post('/auction/catalog/:auctionId', middleware.employeeLoggedIn, (req, res) => {
	function removeItemFromCatalog(remove){
		db.query(queryString7,[remove.itemId, remove.auctionId], (err, results, fields) => {
			if(err) console.log(err)
			console.log('Removed');
		});
	}
	function getConsignmentId(bundle, itemId){
		db.query(queryString5,[itemId], (err, results, fields) => {
			if(err) console.log(err)
			return insertBundle(bundle, results[0].intCIConsignment)
		});
	}
	function insertBundle(bundle, consignmentId){
		db.query(queryString4,[bundle.bundleDesc, consignmentId], (err, results, fields) => {
			if(err){
				if(err.errno == 1213){
					return insertBundle(bundle, consignmentId);
				}
				else{
					console.log(err)
				}
			}
			else{
				var insertId = results.insertId
				db.query(queryString3,[insertId], (err, results, fields) => {
					if(err) console.log(err)
	
					var smartId = results[0].intBundleID;
					smartIds.push(smartId);
					console.log('Loob SmartIDs Now: '+smartIds)
					for(var h=0; h<bundle.itemIds.length; h++){
						db.query(queryString2,[bundle.itemIds[h], smartId], (err, results, fields) => {
							if(err) console.log(err)
	
							console.log('INSERTED ITEM TO BUNDLE')
						});
						if(h == (bundle.itemIds.length)-1 ){
							bundleLoopPoints+=1;
							console.log('Labas SmartIDs Now: '+smartIds)
							return catalogFunction();
						}
					}
				});
			}
		});
	}
	function catalogFunction(){
		if(bundleLoopPoints==req.session.bundles.length){
			console.log('Final Smart IDs '+smartIds.length);
			for(var k=0; k<smartIds.length;k++){
				db.query(queryString6,[req.params.auctionId, smartIds[k]], (err, results, fields) =>{
					if(err) console.log(err)
					console.log(smartIds[k])
					doneLoopPoints+=1;
					doneFunction()
				})
			}
		}
	}
	function doneFunction(){
		console.log('loop points now: '+doneLoopPoints)
		if(doneLoopPoints==done){
			console.log('redirect na')
			delete req.session.bundles;
			delete req.session.bundleCount;
			delete req.session.removeFromCatalog
			res.send({done: true});
		}
	}
	console.log(req.body.items);
	console.log(req.session);

	var bundleLoopPoints=0;
	var doneLoopPoints=0;
	var smartIdsCount;
	var done;
	var smartIds = [];
	var queryString1 = `UPDATE tbl_consignment_item SET booIsBundled = 1 WHERE intConsignmentItemID = ?`
	var queryString2 = 'INSERT INTO tbl_items_in_bundle (intIIBItemID, strIIBBundleID) VALUES(?, ?)'
	var queryString3 = 'SELECT intBundleID FROM tbl_bundle WHERE intBundleUnique = ?'
	var queryString4 = `INSERT INTO tbl_bundle (dblBundlePrice, strBundleTitle, intBundleConsignmentID) VALUES (100, ?, ?)`
	var queryString5 = 'SELECT intCIConsignment FROM tbl_consignment_item WHERE intConsignmentItemID = ?'
	var queryString6 = 'INSERT INTO tbl_catalog (intCatalogAuctionID, strCatalogItemID) VALUES (?, ?)'
	var queryString7 = 'DELETE FROM tbl_catalog WHERE strCatalogItemID = ? AND intCatalogAuctionID = ?'
	if(typeof req.session.removeFromCatalog != 'undefined'){
		for(var r=0; r<req.session.removeFromCatalog.length; r++){
			removeItemFromCatalog(req.session.removeFromCatalog[r])
		}
	}
	if(typeof req.session.bundles != 'undefined'){
		smartIdsCount=req.session.bundles.length;
	}
	else{
		smartIdsCount=0;
	}
	if(typeof req.body.items == 'undefined'){
		done = smartIdsCount;
		console.log('Done is '+done)
	}
	else{
		done = smartIdsCount + req.body.items.length;
		console.log('Done is '+done)
	}
	if(typeof req.body.bundles != 'undefined'){
		done = smartIdsCount + req.body.bundles.length;
	}
	if(done > 0){
		if(typeof req.body.items != 'undefined'){
			for(var j=0;j<req.body.items.length;j++){
				db.query('SELECT strItemID FROM tbl_consignment_item WHERE intConsignmentItemID = ?', [req.body.items[j]], (err, results, fields) => {
					if(err) console.log(err)
					var strItemId = results[0].strItemID;
					db.query(queryString6, [req.params.auctionId, strItemId], (err, results, fields) => {
						if(err) console.log(err)
						doneLoopPoints+=1;
						doneFunction()
					})
				});
				if(j == (req.body.items.length)-1 ){
					if(typeof req.session.bundles != 'undefined'){
						for(var i=0;i<req.session.bundles.length;i++){
							for(var x=0; x<req.session.bundles[i].itemIds.length; x++){
								db.query(queryString1,[req.session.bundles[i].itemIds[x]], (err, results, fields) => {
									if(err) console.log(err)
									console.log('UPDATED booIsBundled');
								});
							}
						}
						for(var y=0;y<req.session.bundles.length;y++){
							getConsignmentId(req.session.bundles[y], req.session.bundles[y].itemIds[0]);
						}
					}
				}
			}
		}
		if(typeof req.body.bundles != 'undefined'){
			for(var r=0;r<req.body.bundles.length;r++){
				db.query(queryString6,[req.params.auctionId, req.body.bundles[r] ], (err, results, fields) => {
					if(err) console.log(err)
					doneLoopPoints+=1;
					doneFunction()
				})
			}
		}
	}
	else{
		var errorString = `Hello?! You did nothing. Please use the toggle buttons to include in the catalog. If you want to bundle just click the bundle button`
		res.send({done:false, error:errorString});
	}
});
router.post('/bundle', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body);
	if(req.session.bundles){
		req.session.bundleCount+=1;
		var toBePushed = {bundleNumber:req.session.bundleCount, bundleDesc: req.body.bundleDesc, itemIds: req.body.itemIds}
		req.session.bundles.push(toBePushed);
		res.send({bundleNumberNow:req.session.bundleCount});
	}
	else{
		req.session.bundles = [];
		req.session.bundleCount = 1;
		var toBePushed = {bundleNumber:req.session.bundleCount, bundleDesc: req.body.bundleDesc, itemIds: req.body.itemIds}
		req.session.bundles.push(toBePushed);
		res.send({bundleNumberNow:req.session.bundleCount});
	}
	res.end()
});
router.post('/bundle/delete', middleware.employeeLoggedIn, (req, res) => {
	for(var i=0;i<req.session.bundles.length;i++){
		if(req.session.bundles[i].bundleNumber == req.body.id){
			req.session.bundles.splice(i,1);
		}
	}
	console.log(req.session.bundles);
	console.log(req.session.bundles.length);
	res.end();
});
router.post('/catalog/validate', middleware.employeeLoggedIn, (req, res) => {
	db.query('SELECT intCatalogAuctionID FROM tbl_catalog JOIN tbl_auction ON intAuctionID = intCatalogAuctionID WHERE strCatalogItemID = ? AND booAuctionStatus != 3 AND booAuctionStatus != 2 AND booAuctionStatus != 4', [req.body.itemId], (err, results, fields) => {
		if(err) console.log(err)

		if(results[0]){
			return res.send({
				warning: `This item/bundle is currently selected in the catalog of Auction #${results[0].intCatalogAuctionID}. If you submit this, the item will be removed from that auction.`,
				confirm: {
					auctionId : results[0].intCatalogAuctionID,
					itemId: req.body.itemId
				},
				valid:false
			})
		}
		else{
			return res.send({valid:true})
		}
	});
});
router.post('/catalog/remove/item', middleware.employeeLoggedIn, (req, res) => {
	if(!req.session.removeFromCatalog){
		req.session.removeFromCatalog = [];
		req.session.removeFromCatalog.push(req.body.obj);
	}
	else{
		req.session.removeFromCatalog.push(req.body.obj);
	}
	console.log(req.session.removeFromCatalog);

	res.end();
});
router.post('/catalog/revert/item', middleware.employeeLoggedIn, (req, res) => {
	if(typeof req.session.removeFromCatalog != 'undefined'){
		for(var s=0; s<req.session.removeFromCatalog.length; s++){
			if(req.session.removeFromCatalog[s].itemId == req.body.itemId){
				req.session.removeFromCatalog.splice(s,1)
				return res.end()
			}
		}
	}
	else{
		return res.end()
	}
});

router.post('/catalog', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT intConsignmentItemID,intCIConsignment,strItemDescription,strCategory,strUOM,jsonOtherSpecifications,intQTY,booPrice,strName,strItemID FROM tbl_consignment_item
	JOIN tbl_consignment ON intCIConsignment=intConsignmentID
	JOIN tbl_consignor ON intConsignmentConsignorID=intConsignorID
	JOIN tbl_catalog ON strItemID=strCatalogItemID
	WHERE intCatalogAuctionID = ?`;
	var queryString2 = `SELECT intBundleID,dblBundlePrice,strBundleTitle,booBundleStatus,intBundleConsignmentID,strName FROM tbl_bundle
	JOIN tbl_consignment ON intBundleConsignmentID=intConsignmentID
	JOIN tbl_consignor ON intConsignmentConsignorID=intConsignorID
	JOIN tbl_catalog ON intBundleID=strCatalogItemID
	WHERE intCatalogAuctionID = ?`;
	var catalog = [];

	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		if(results.length>0){
			for(var i=0; i<results.length; i++){
				catalog.push(results[i]);
			}
		}

		db.query(queryString2,[req.body.id], (err, results, fields) => {
			if(err) console.log(err)

			if(results.length > 0){
				for(var j=0; j< results.length; j++){
					catalog.push(results[j]);
				}
			}

			res.send({items: catalog});
		});
	});
});
router.post('/bundle/view', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT intConsignmentItemID, intCIConsignment, strCategory, strItemDescription, strUOM, intQTY, jsonOtherSpecifications, booPrice
	FROM tbl_consignment_item
	JOIN tbl_items_in_bundle ON intIIBItemID=intConsignmentItemID
	WHERE strIIBBundleID = ?`

	db.query(queryString,[req.body.bundleId], (err, results, fields) => {
		if(err) console.log(err)

		res.send({items:results}).end();
	})
});
router.post('/bundle/details', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT * FROM tbl_bundle WHERE intBundleID = ?`
	
	db.query(queryString, [req.body.bundleId], (err, results, fields) => {
		if(err) console.log(err)

		res.send({bundleDetails:results[0]}).end()
	})
});
router.post('/catalog/unlist/item', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body.id)
	var queryString = 'DELETE FROM tbl_catalog WHERE strCatalogItemID = ?';
	db.query(queryString,[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		console.log(results)
		res.end();
	})
});
router.post('/catalog/item/count', middleware.employeeLoggedIn, (req, res) => {
	db.query('SELECT COUNT(strCatalogItemID) AS itemCount FROM tbl_catalog WHERE intCatalogAuctionID = ?', [req.body.id], (err, results, fields) => {
		if(err) console.log(err)
		if(results[0]){
			var currentItems = results[0].itemCount;
		}
		else{
			var currentItems = 0
		}
		if(typeof req.body.bundles != 'undefined'){
			res.send({itemCount:currentItems, bundleNowLength:req.body.bundles.length})
		}
		else{
			res.send({itemCount:currentItems, bundleNowLength:0})
		}
	});
})
router.get('/bundle', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
	
	delete req.session.removeFromCatalog;
	db.query('SELECT * FROM tbl_bundle', (err, results, fields) => {
		if(err) console.log(err)
		
		res.render('management/views/bundle', {bundles:results, session: req.session})
	})
});
router.post('/bundle/item/query', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT intConsignmentItemID,intCIConsignment,strItemDescription,strCategory,booItemStatus,strUOM,jsonOtherSpecifications,intQTY,booIsReceived,booIsBundled,booPrice,strName,strItemID FROM tbl_consignment_item
	JOIN tbl_consignment ON intCIConsignment=intConsignmentID
	JOIN tbl_consignor ON intConsignmentConsignorID=intConsignorID
	WHERE booIsReceived = 1 AND booIsBundled = 0 AND booPrice = 0 AND booItemStatus = 0`;

	db.query(queryString, (err, results, fields) => {
		if(err) console.log(err)

		if(results){
			for(var i=0;i<results.length;i++){
				results[i].jsonOtherSpecifications = JSON.parse(results[i].jsonOtherSpecifications)
			}
		}
		res.send({items: results})
		res.end()
	})
});
router.post('/bundle/item/query/:consignmentId', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT intConsignmentItemID,intCIConsignment,strItemDescription,strCategory,booItemStatus,strUOM,jsonOtherSpecifications,intQTY,booIsReceived,booIsBundled,booPrice,strName,strItemID FROM tbl_consignment_item
	JOIN tbl_consignment ON intCIConsignment=intConsignmentID
	JOIN tbl_consignor ON intConsignmentConsignorID=intConsignorID
	WHERE booIsReceived = 1 AND booIsBundled = 0 AND booPrice = 0 AND booItemStatus = 0 AND intCIConsignment = ${req.params.consignmentId}`;

	db.query(queryString, (err, results, fields) => {
		if(err) console.log(err)

		if(results){
			for(var i=0;i<results.length;i++){
				results[i].jsonOtherSpecifications = JSON.parse(results[i].jsonOtherSpecifications)
			}
		}
		res.send({items: results})
		res.end()
	})
});
router.post('/bundle/submit', middleware.employeeLoggedIn, upload.single('bundlePicture'), (req, res) => {
	req.body.items = JSON.parse(req.body.items);
	function removeItemFromCatalog(remove){
		db.query(queryString1,[remove.itemId, remove.auctionId], (err, results, fields) => {
			if(err) console.log(err)
			console.log('Removed');
		});
	}
	function updateItem(item){
		db.query(queryString2,[item.itemId], (err, results, fields) => {
			if(err) console.log(err)
			console.log('item updated');
		});
	}
	function insertItemToBundle(item, bundleId, callback){
		db.query(queryString5,[item.itemId, bundleId], (err, results, fields) => {
			if(err) console.log(err)
			console.log('item bundled');
			done++;
			return callback()
		});
	}
	var done = 0;
	var queryString1 = 'DELETE FROM tbl_catalog WHERE strCatalogItemID = ? AND intCatalogAuctionID = ?'
	var queryString2 = 'UPDATE tbl_consignment_item SET booIsBundled = 1 WHERE intConsignmentItemID = ?'
	var queryString3 = 'INSERT INTO tbl_bundle (dblBundlePrice, strBundleTitle, intBundleConsignmentID, strBundlePicture) VALUES(100, ?, ?, ?)'
	var queryString4 = 'SELECT intBundleID FROM tbl_bundle WHERE intBundleUnique = ?'
	var queryString5 = 'INSERT INTO tbl_items_in_bundle (intIIBItemID, strIIBBundleID) VALUES(?,?)'
	if(typeof req.session.removeFromCatalog != 'undefined'){
		for(var r=0; r<req.session.removeFromCatalog.length; r++){
			removeItemFromCatalog(req.session.removeFromCatalog[r])
		}
	}
	for(var g=0;g<req.body.items.length;g++){
		updateItem(req.body.items[g]);
	}
	db.query(queryString3,[req.body.bundleDesc, req.body.consignmentId, req.file.filename], (err, results, fields) => {
		if(err) console.log(err)
		
		db.query(queryString4, [results.insertId], (err, results, fields) => {
			if(err) console.log(err)
			
			var smartId = results[0].intBundleID;
			for(var f=0;f<req.body.items.length;f++){
				insertItemToBundle(req.body.items[f], smartId, function(){
					if(done == req.body.items.length){
						res.send({sendSmartId: smartId, desc:req.body.bundleDesc}).end()
					}
				})
			}
		})
	})
});
router.post('/bundle/split', middleware.employeeLoggedIn, (req, res) => {
	var queryString = 'SELECT intIIBItemID FROM tbl_items_in_bundle WHERE strIIBBundleID = ?';
	var queryString2 = 'UPDATE tbl_consignment_item SET booIsBundled = 0 WHERE intConsignmentItemID = ?';
	var queryString3 = 'DELETE FROM tbl_bundle WHERE intBundleID = ?';

	function booIsBundledRevert(item){
		db.query(queryString2, [item.intIIBItemID], (err, results, fields) => {
			if(err) console.log(err)

			console.log('item split')
		})
	}
	db.query(queryString,[req.body.bundleId], (err, results, fields) => {
		if(err) console.log(err)

		for(var h=0;h<results.length;h++){
			booIsBundledRevert(results[h]);
		}
		db.query(queryString3, [req.body.bundleId], (err, results, fields) =>{
			if(err) console.log(err)

			res.send()
		})
	})
})
router.post('/bundle/remove/item', middleware.employeeLoggedIn, (req, res) => {
	db.query('UPDATE tbl_consignment_item SET booIsBundled = 0 WHERE intConsignmentItemID = ?', [req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		db.query('DELETE FROM tbl_items_in_bundle WHERE intIIBItemID = ? AND strIIBBundleID =?', [req.body.id, req.body.bundle], (err, results, fields) => {
			if(err) console.log(err)

			res.end()
		})
	})
});
router.post('/bundle/edit', middleware.employeeLoggedIn, upload.single('bundlePicture'), (req, res) => {
	req.body.items = JSON.parse(req.body.items)
	console.log(req.body.items)
	if(req.file){
		var queryString = `UPDATE tbl_bundle SET strBundleTitle = ?, strBundlePicture = ? WHERE intBundleID = ?`
		db.query(queryString, [req.body.bundleDesc,req.file.filename,req.body.bundleId], (err, results, fields) => {
			if(err) console.log(err)

			res.send()
		})
	}
	else{
		var queryString = `UPDATE tbl_bundle SET strBundleTitle = ? WHERE intBundleID = ?`
		db.query(queryString, [req.body.bundleDesc,req.body.bundleId], (err, results, fields) => {
			if(err) console.log(err)

			res.send()
		})
	}
	function addItemToBundle(item){
		db.query('INSERT INTO tbl_items_in_bundle (intIIBItemID, strIIBBundleID) VALUES(?,?)', [item, req.body.bundleId], (err, results, fields) => {
			if(err) console.log(err)
			db.query('UPDATE tbl_consignment_item SET booIsBundled = 1 WHERE intConsignmentItemID = ?', [item], (err, results, fields) => {
				if(err) console.log(err)
				
			})
		})
	}

	for(var k=0;k<req.body.items.length;k++){
		addItemToBundle(req.body.items[k])
	}
})
router.get('/inventory', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_consignment_item WHERE (booItemStatus = 0 OR booItemStatus = 3) AND booIsBundled = 0 AND booIsReceived = 1 ', (err, results, fields) => {
		if(err) console.log(err)

		res.render('management/views/inventory', {session: req.session, assets: results});
	})
})
router.post('/inventory/asset/details', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `SELECT strName, strColor, intStorage, tbl_color.intQTY AS originalQuantity,tbl_consignment_item.intQTY AS currentQuantity FROM tbl_consignment_item
	JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID
	JOIN tbl_consignment ON intConsignmentID = intCIConsignment
	JOIN tbl_consignor ON intConsignmentConsignorID = intConsignorID
	WHERE intConsignmentItemID = ?`
	db.query(queryString, [req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		var itemDetails = results;
		console.log(results);
		db.query('SELECT * FROM tbl_consignment_item_pictures WHERE intCIPConsignmentItemID = ?', [req.body.id], (err, results, fields) => {
			if(err) console.log(err)

			console.log('============================ \n');
			console.log(results)
			res.send({itemDetails: itemDetails, pictures: results, itemId:req.body.id})
		})
	})
})
router.post('/inventory/edit', middleware.employeeLoggedIn, upload.any(), (req, res) => {
	var deletePic = `DELETE FROM tbl_consignment_item_pictures WHERE strPicture = ?`;
	var insertPic = `INSERT INTO tbl_consignment_item_pictures (intCIPConsignmentItemID, strPicture) VALUES (?, ?)`
	var updateItem = `UPDATE tbl_consignment_item SET intStorage = ? WHERE intConsignmentItemID = ?`
	var updateColor = `UPDATE tbl_color SET strColor = ? WHERE intColorConsignmentItemID = ?`
	var picsToDelete = req.body.delete.split(',');
	console.log(picsToDelete)
	console.log('============================ \n');
	console.log(req.body)
	console.log('============================ \n');
	console.log(req.files)
	db.query(updateItem,[req.body.size,req.body.id], (err, results, fields) => {
		if(err) console.log(err)
		db.query(updateColor, [req.body.color,req.body.id], (err, results, fields) => {
			if(err) console.log(err)
			for(var p=0;p<picsToDelete.length;p++){
				deletePicture(picsToDelete[p]);
			}
			for(var q=0;q<req.files.length;q++){
				addPic(req.files[q].filename)
			}
			res.send('success')
		})
	})
	function deletePicture(x){
		db.query(deletePic, [x], (err, results, fields) => {
			if(err) console.log(err)
		})
	}
	function addPic(x){
		db.query(insertPic, [req.body.id, x], (err, results, fields) => {
			if(err) console.log(err)
		})
	}
});
router.get('/adjustment', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
	
	res.render('management/views/adjustment', {session: req.session})
});
router.post('/adjustment/query', middleware.employeeLoggedIn, (req, res) => {
	var query = `SELECT intConsignmentItemID, intCIConsignment, strUOM, strCategory, jsonOtherSpecifications, booIsBundled, tbl_consignment_item.intQTY AS availableQuantity, tbl_color.intQTY AS originalQuantity
	FROM tbl_consignment_item 
	JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID
	WHERE booIsReceived = 1 AND tbl_consignment_item.intQTY > 0 AND tbl_consignment_item.booItemStatus = 0`
	var issuesQuery = `SELECT * FROM tbl_issues`
	db.query(query,(err, results, fields) => {
		if(err) console.log(err)

		var items = results;
		db.query(issuesQuery,(err, results, fields) => {
			if(err) console.log(err)

			var issues = results;
			for(var q=0;q<items.length;q++){
				items[q].lost = 0
				items[q].damaged = 0
				for(var r=0; r<issues.length;r++){
					console.log(issues[r]);
					console.log('==========================')
					console.log(items[q]);
					if(issues[r].intIssueConsignmentItemID == items[q].intConsignmentItemID){
						if(issues[r].strIssue == 'Damaged'){
							items[q].damaged = eval(items[q].damaged+'+'+issues[r].intQTY)
						}
						else if(issues[r].strIssue == 'Lost'){
							items[q].lost = eval(items[q].lost+'+'+issues[r].intQTY)
						}
					}
				}
			}
			res.send(items)
		})
	})
})
router.post('/adjust/items', middleware.employeeLoggedIn, (req, res) => {
	var query = '';
	var now = moment().format('YYYY-MM-DD');
	for(var w = 0; w< req.body.items.length; w++){
		if(req.body.items[w].lostQty > 0){
			query = query + `INSERT INTO tbl_issues(intIssueConsignmentItemID, strIssue, datDateSeen, intQTY) VALUES(${req.body.items[w].id}, "Lost", "${now}", ${req.body.items[w].lostQty});`;
		}
		if(req.body.items[w].damagedQty > 0){
			query = query + `INSERT INTO tbl_issues(intIssueConsignmentItemID, strIssue, datDateSeen, intQTY) VALUES(${req.body.items[w].id}, "Damaged", "${now}", ${req.body.items[w].damagedQty});`;
		}
		query = query + `UPDATE tbl_consignment_item SET intQTY = ${req.body.items[w].updateQty}, booItemStatus = 2 WHERE intConsignmentItemID = ${req.body.items[w].id};`;
		if(w == (req.body.items.length - 1)){
			db.query(query,(err, results, fields) => {
				if(err) console.log(err)
				res.send().end()
			})
		}
	}
})
router.get('/bidder', middleware.employeeLoggedIn, middleware.auctionQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBABidderID=intBidderID WHERE booStatus = 1 OR booStatus = 3', (err, results, fields) => {
		if(err) console.log(err)
		
		res.render('management/views/bidderMaintenance', {bidders: results, session:req.session});
	})
})
router.post('/bidder/ban', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body)
	if(req.body.ban == 'true'){
		db.query('UPDATE tbl_bidder_accounts SET booStatus = 1 WHERE intBABidderID = ?',[req.body.id], (err, results, fields) => {
			if(err) console.log(err)
			res.send().end()
		})
	}
	else{
		db.query('UPDATE tbl_bidder_accounts SET booStatus = 3 WHERE intBABidderID = ?',[req.body.id], (err, results, fields) => {
			if(err) console.log(err)
			res.send().end()
		})
	}
});
router.get('/inventory/pullout', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
	
	db.query('SELECT * FROM tbl_consignment_item WHERE booItemStatus = 4 AND booIsBundled = 0 AND booIsReceived = 1 ', (err, results, fields) => {
		if(err) console.log(err)

		res.render('management/views/pulledOut', {session: req.session, assets: results});
	})
})

router.get('/awards', middleware.employeeLoggedIn, (req, res) => {
	
	var awardQuery = `SELECT tbl_sales_invoice.*, tbl_bidder_accounts.*, tbl_bidder.*, tbl_address_book.* FROM tbl_sales_invoice JOIN tbl_bidder ON intReceiptBidderID = intBidderID JOIN tbl_bidder_accounts ON intBidderID = intBABidderID JOIN tbl_address_book ON intBidderID = intABBidderID WHERE booDefault = 1`
	db.query(awardQuery, (err, results, field) => {
		if(err) console.log(err);
		for(var i = 0; i < results.length; i++){
			results[i].datDate = moment(results[i].datDate).format('MMMM Do YYYY');
			if(i == results.length - 1){
				res.render('management/views/awardsmain', {awards: results, session: req.session})
			}
		}
	})
})



router.post('/invalidcredential', middleware.employeeLoggedIn, (req, res) => {
	var intSalesInvoiceID = req.body.intSalesInvoiceID;
	
	var icQuery = `UPDATE tbl_sales_invoice SET booSIStatus = 0, strBankReference = '', intOrderID = '' WHERE intSalesInvoiceID = ?;`
	db.query(icQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
		if (err) {
			console.log(err)
			throw err;		
		}

		res.send({indicator: true});
		res.end();

	})
})


router.post('/unpaid', middleware.employeeLoggedIn,(req, res) => {
	var intSalesInvoiceID = req.body.intSalesInvoiceID;
	db.getConnection(function(err, conn) {
		conn.beginTransaction((err) => {
			if(err){ 
				throw err; 
			}

			var unpaidQuery = `UPDATE tbl_sales_invoice SET booSIStatus = 0, intOrderID = '' WHERE intSalesInvoiceID = ?;`
			conn.query(unpaidQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
				if (err) {
					return conn.rollback(function() {
						throw err;
					});
				}
				else{
					var selectQuery = `SELECT * FROM tbl_sales_invoice_details WHERE intSIDSalesInvoiceID = ?`
					conn.query(selectQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
						if (err) {
							return conn.rollback(function() {
								throw err;
							});
						}
						else{
							if(results.length > 0){
								console.log('==result query of details==')
								console.log(results)
								console.log('==result query of details==')
								var awards = results;
								payingFunction(awards, conn);
							}
						}
					})

				}
			});
		})
	})

	async function payingFunction(awards, conn){	
		for(var award of awards){
			await subFunction(award, conn)
		}
		conn.commit(function(err) {
			if (err) {
				return connection.rollback(function() {
					throw err;
				});
			}
			console.log('success!');
			res.send({indicator: true});
			res.end();
		});
	}

	function subFunction(award, conn){
		var strAwardID = award.strAwardID;
		var quantity = award.intSIDQty;
		if(award.booSIDType == 0){//single item
			console.log('==PAID POST SINGLE ITEM==')
			var minusQuery = `UPDATE tbl_consignment_item SET intQTY = intQTY + ? WHERE strItemID = ?`
			conn.query(minusQuery, [quantity, strAwardID], function (err, results, field){
				if (err) {
					return conn.rollback(function() {
						throw err;
					});
				}
				else{
					var backQuery = `SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
					conn.query(backQuery, [strAwardID], function (err, results, field){
						if (err) {
							return conn.rollback(function() {
								throw err;
							});
						}
						else{
							if(results.length > 0){
								if(results[0].intQTY > 0){
									var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 1 WHERE strItemID = ?`
									conn.query(soldQuery, [strAwardID], function (err, results, field){
										if (err) {
											return conn.rollback(function() {
												throw err;
											});
										}
									});							
								}
								else if(results[0].intQTY == 0){
									var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2 WHERE strItemID = ?`
									conn.query(soldQuery, [strAwardID], function (err, results, field){
										if (err) {
											return conn.rollback(function() {
												throw err;
											});
										}
									});							
								}
							}//results length
						}// else Back query
					});
				}
			});
			console.log('==PAID POST SINGLE ITEM==')
		}
		else if(award.booSIDType == 1){//bundle
			var selectBundleQuery = `SELECT * FROM tbl_bundle JOIN tbl_items_in_bundle ON intBundleID = strIIBBundleID JOIN tbl_consignment_item ON intConsignmentItemID = intIIBItemID WHERE intBundleID = ?;
									UPDATE tbl_bundle SET booBundleStatus = 1 WHERE intBundleID = ?`
			db.query(selectBundleQuery, [strAwardID, strAwardID], (err, results, field) => {
				if(err) return console.log(err)
				console.log(results[0])
				
				if(results[0].length > 0){
					for(var i = 0; i < results[0].length; i++){
						var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 1 WHERE strItemID = ?`
						db.query(soldQuery, [results[0][i].strItemID], function (err, results, field){
							if(err) console.log(err);
						});
					}//for loop
				}//results.length
			}) // selectBundleQuery
		}
	}
})

router.post('/paid', middleware.employeeLoggedIn, (req, res) => {
	var intSalesInvoiceID = req.body.intSalesInvoiceID;
	var text = moment().format('MMDDYYYY');
	var possible = "0123456789";

	for (var i = 0; i < 10; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	db.getConnection(function(err, conn) {
		conn.beginTransaction((err) => {
			if(err){ 
				throw err; 
			}

			var paidQuery = `UPDATE tbl_sales_invoice SET booSIStatus = 1, intOrderID = ? WHERE intSalesInvoiceID = ?;`
			conn.query(paidQuery, [text, req.body.intSalesInvoiceID], (err, results, field) => {
				if (err) {
					return conn.rollback(function() {
						throw err;
					});
				}
				else{
					var selectQuery = `SELECT * FROM tbl_sales_invoice_details WHERE intSIDSalesInvoiceID = ?`
					conn.query(selectQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
						if (err) {
							return conn.rollback(function() {
								throw err;
							});
						}
						else{
							if(results.length > 0){
								var awards = results;
								payingFunction(awards, conn);
							}
						}
					})

				}
			});
		})
	})

	async function payingFunction(awards, conn){
		for(var award of awards){
			await subFunction(award, conn)
		}
		conn.commit(function(err) {
			if (err) {
				return connection.rollback(function() {
					throw err;
				});
			}
			console.log('success!');
			res.send({indicator: true});
			res.end();
		});
	}

	function subFunction(award, conn){
		var strAwardID = award.strAwardID;
		var quantity = award.intSIDQty;
		if(award.booSIDType == 0){//single item
			console.log('==PAID POST SINGLE ITEM==')
			var minusQuery = `UPDATE tbl_consignment_item SET intQTY = intQTY - ? WHERE strItemID = ?`
			conn.query(minusQuery, [quantity, strAwardID], function (err, results, field){
				if (err) {
					return conn.rollback(function() {
						throw err;
					});
				}
				else{
					var backQuery = `SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
					conn.query(backQuery, [strAwardID], function (err, results, field){
						if (err) {
							return conn.rollback(function() {
								throw err;
							});
						}
						else{
							if(results.length > 0){
								if(results[0].intQTY > 0){
									var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 0 WHERE strItemID = ?`
									conn.query(soldQuery, [strAwardID], function (err, results, field){
										if (err) {
											return conn.rollback(function() {
												throw err;
											});
										}
									});							
								}
								else if(results[0].intQTY == 0){
									var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2 WHERE strItemID = ?`
									conn.query(soldQuery, [strAwardID], function (err, results, field){
										if (err) {
											return conn.rollback(function() {
												throw err;
											});
										}
									});							
								}
							}//results length
						}// else Back query
					});
				}
			});
			console.log('==PAID POST SINGLE ITEM==')
		}
		else if(award.booSIDType == 1){//bundle
			var selectBundleQuery = `SELECT * FROM tbl_bundle JOIN tbl_items_in_bundle ON intBundleID = strIIBBundleID JOIN tbl_consignment_item ON intConsignmentItemID = intIIBItemID WHERE intBundleID = ?;
									UPDATE tbl_bundle SET booBundleStatus = 2 WHERE intBundleID = ?`
			db.query(selectBundleQuery, [strAwardID, strAwardID], (err, results, field) => {
				if(err) return console.log(err)
				console.log(results[0])
				
				if(results[0].length > 0){
					for(var i = 0; i < results[0].length; i++){
						var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2 WHERE strItemID = ?`
						db.query(soldQuery, [results[0][i].strItemID], function (err, results, field){
							if(err) console.log(err);
						});
					}//for loop
				}//results.length
			}) // selectBundleQuery
		}
	}
})

router.get('/delivery', middleware.employeeLoggedIn, (req, res) => {
	
	var awardQuery = `SELECT tbl_sales_invoice.*, tbl_bidder_accounts.*, tbl_bidder.*, tbl_address_book.*, SUM(tbl_sales_invoice_details.intPremium + tbl_sales_invoice_details.dblSIDBidPrice) AS Totality FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID JOIN tbl_bidder ON intReceiptBidderID = intBidderID JOIN tbl_bidder_accounts ON intBidderID = intBABidderID JOIN tbl_address_book ON intBidderID = intABBidderID WHERE booSIStatus != 0 AND booDefault = 1 GROUP BY intSalesInvoiceID;`
	db.query(awardQuery, (err, results, field) => {
		if(err) console.log(err);
		console.log(results)
		if(results.length > 0){
			if(results[0].intSalesInvoiceID != null){
				for(var i = 0; i < results.length; i++){
					results[i].datDate = moment(results[i].datDate).format('MMMM Do YYYY');
					if(i == results.length - 1){
						res.render('management/views/awards', {awards: results, session: req.session})
					}
				}
			}
			else{
				res.render('management/views/awards', {session: req.session})			
			}
		}
		else{
				res.render('management/views/awards', {session: req.session})			
			}
	})
})

router.get('/award/detail/:intSalesInvoiceID', middleware.employeeLoggedIn, (req, res) => {
	
	var detailQuery = `SELECT * FROM tbl_sales_invoice JOIN tbl_bidder ON intReceiptBidderID = intBidderID JOIN tbl_bidder_accounts ON intBidderID = intBABidderID JOIN tbl_address_book ON intBidderID = intABBidderID WHERE intSalesInvoiceID = ?;`
	db.query(detailQuery, [req.params.intSalesInvoiceID], (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			res.render('management/views/awarddetails', {award: results, session: req.session})
		}
	})
})

router.get('/award/detail/main/:intSalesInvoiceID', middleware.employeeLoggedIn, (req, res) => {
	
	var detailQuery = `SELECT * FROM tbl_sales_invoice JOIN tbl_bidder ON intReceiptBidderID = intBidderID JOIN tbl_bidder_accounts ON intBidderID = intBABidderID JOIN tbl_address_book ON intBidderID = intABBidderID WHERE intSalesInvoiceID = ?;`
	db.query(detailQuery, [req.params.intSalesInvoiceID], (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			res.render('management/views/awarddetmain', {award: results, session: req.session})
		}
	})
})

router.post('/statushistory', middleware.employeeLoggedIn, (req, res) => {
	console.log('history accessed')
	var detailQuery = `SELECT * FROM tbl_si_status_history WHERE intSISHSalesInvoice = ? ORDER BY datDateChange DESC;`
	db.query(detailQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			for(var i = 0; i < results.length; i++){
				results[i].datDateChange = moment(results[i].datDateChange).format('MMMM Do YYYY, h:mm:ss a');
				if(i == results.length - 1){
					res.send({status: results});
				}
			}
		}
	})
})

router.post('/updatestatus',  middleware.employeeLoggedIn, (req, res) => {
	console.log('update accessed')
	var detailQuery = `INSERT INTO tbl_si_status_history (datDateChange, Comment, booStatus, intSISHSalesInvoice) VALUES (now(), ?, ?, ?); 
					UPDATE tbl_sales_invoice SET booSIStatus = ? WHERE intSalesInvoiceID = ?;`
	db.query(detailQuery, [req.body.statuscomment, req.body.status, req.body.intSalesInvoiceID, req.body.status, req.body.intSalesInvoiceID], (err, results, field) => {
		if(err) console.log(err);
		res.send({indicator: true})
	})
})

router.get('/auctionresult', middleware.employeeLoggedIn, middleware.inventoryOrAuctionQualified, (req, res) => {
	
	res.render('management/views/auctionresult', {session: req.session});
})



//consignor payment
router.post('/awards', middleware.consignorNotLoggedIn,  (req, res) => {
	var utilQuery = `SELECT * FROM tbl_utilities`
	db.query(utilQuery, (err, results, field) => {
		if(err) return console.log(err);
		if(results.length > 0){
			req.session.utilities = results[0]
			var awardQuery = `SELECT * FROM tbl_auction JOIN tbl_sales_invoice ON intAuctionID = intSIAuctionID WHERE booAuctionStatus = 3 AND datDateEnd < now() AND intReceiptBidderID = ?`
			db.query(awardQuery, [req.session.bidder.intBidderID], (err, results, field) => {
				if(err) return console.log(err);
				console.log('========Sales=======')
				console.log(results);
				console.log('========Sales=======')
				

				for(var i = 0; i < results.length; i++){
					var dateEnd = moment(results[i].datDateEnd).format('MM/DD/YY h:mm:ss a');
					var today = moment();
					var diffe = today.diff(dateEnd, 'days');
					results[i].diffe = diffe;
					var shouldEnd = moment(results[i].datDateEnd.toString()).add(req.session.utilities.intPaymentDays, 'days');
					results[i].shouldEnd = moment(shouldEnd).format('MM/DD/YY');
					results[i].datDateEnd2 = new Date(results[i].datDateEnd)					
					results[i].datDateEnd = moment(results[i].datDateEnd).format('MMMM Do YYYY h:mm:ss a');
					console.log(results[i])
					if(i ==  results.length - 1){
						res.send({awards: results, indicator: true});
						res.end();
					}
				}
			});
		}
	});	
	
});
router.post('/consignor/logs/:consignorAccountId', middleware.employeeLoggedIn, (req, res) => {
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
router.post('/check/bundle', middleware.employeeLoggedIn, (req, res) => {
	var bundle;
	db.query('SELECT strIIBBundleID FROM tbl_items_in_bundle WHERE intIIBItemID = ?',[req.body.id], (err, results, fields) => {
		if(err) console.log(err)

		bundle = results[0].strIIBBundleID;
		db.query('SELECT COUNT(strIIBBundleID) AS itemCount FROM tbl_items_in_bundle WHERE strIIBBundleID = ? GROUP BY strIIBBundleID', [results[0].strIIBBundleID], (err, results, fields) => {
			if(err) console.log(err)

			if(results[0].itemCount > 2){
				return res.send({valid: true, bundleId: bundle})
			}
			else{
				return res.send({valid: false, bundleId: bundle})
			}
		})
	})
})
//Queries Dynamic

router.get('/queries', middleware.employeeLoggedIn, middleware.acquisitionQualified, middleware.inventoryQualified, middleware.auctionQualified, (req, res) => {
	
	res.render('management/views/queries', {session: req.session})
})

router.post('/queries', middleware.employeeLoggedIn, (req, res) => {
	var select = 'SELECT '
	var bundles;
	for(var i=0; i<req.body.fields.length; i++){
		if(i == req.body.fields.length - 1)
			select = select+` ${req.body.fields[i]}`
		else
			select = select+` ${req.body.fields[i]},`
	}
	if(req.body.table1 == 'Consignor'){
		if(req.body.table2 == 'Consignment'){
			select = select + ' FROM tbl_consignor JOIN tbl_consignment ON intConsignorID = intConsignmentConsignorID'
		}
		else if(req.body.table2 == 'Consignor Accounts'){
			select = select + ' FROM tbl_consignor JOIN tbl_consignor_accounts ON intConsignorID = intCSConsignorID'
		}
		else{
			select = select + ' FROM tbl_consignor'
		}
	}
	else if(req.body.table1 == 'Bidder'){
		if(req.body.table2 == 'Awards'){
			select = select + ` FROM tbl_sales_invoice_details
			JOIN tbl_sales_invoice ON intSIDSalesInvoiceID = intSalesInvoiceID
			JOIN tbl_bidder ON intReceiptBidderID = intBidderID
			JOIN tbl_consignment_item ON strAwardID = strItemID`
		}
		else if(req.body.table2 == 'Bidder Accounts'){
			select = select + ' FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID'
		}
		else{
			select = select + ' FROM tbl_bidder'
		}
	}
	else if(req.body.table1 == 'Auction'){
		if(req.body.table2 == 'Items'){
			select = select + ` FROM tbl_auction JOIN tbl_catalog ON intAuctionID = intCatalogAuctionID 
			JOIN tbl_consignment_item ON strCatalogItemID = strItemID`
		}
		else if(req.body.table2 == 'Bidders'){
			select = select + ` FROM tbl_auction JOIN tbl_catalog ON intAuctionID = intCatalogAuctionID 
			JOIN tbl_bidlist ON intBidlistCatalogID = intCatalogID 
			JOIN tbl_bidder ON intBidlistBidderID = intBidderID 
			JOIN tbl_bidder_accounts ON intBidderID = intBABidderID
			GROUP BY intBidderID`
		}
		else{
			select = select + ' FROM tbl_auction'
		}
	}
	console.log(select)
	db.query(select,(err, results, fields) => {
		if(err) console.log(err)
		var una = results;
		if(req.body.table2 == 'Items'){
			db.query(`SELECT * FROM tbl_auction
				JOIN tbl_catalog ON intCatalogAuctionID = intAuctionID
				JOIN tbl_bundle ON strCatalogItemID = intBundleID`, (err, results, fields) =>{
				if(err) console.log(err)

				if(results.length > 0){
					for(var z=0; z<results.length; z++){
						var pushObject = {
							strAuctionName: results[z].strAuctionName,
							datDateStart: results[z].datDateStart,
							datDateEnd: results[z].datDateEnd,
							strCategory: 'Bundled Items',
							jsonOtherSpecifications: results[z].strBundleTitle
						}
						una.push(pushObject)
					}
				}
				console.log(una);
				res.send(una)
			})
		}
		else if(req.body.table2 == 'Awards'){
			db.query(`SELECT * FROM tbl_sales_invoice_details
				JOIN tbl_sales_invoice ON intSIDSalesInvoiceID = intSalesInvoiceID
				JOIN tbl_bidder ON intReceiptBidderID = intBidderID
				JOIN tbl_bundle ON strAwardID = intBundleID`, (err, results, fields) =>{
				if(err) console.log(err)

				if(results.length > 0){
					for(var a=0; a<results.length; a++){
						var pushObject = {
							strUsername: results[a].strUsername,
							strAddress: results[a].strAddress,
							strContact: results[a].strContact,
							strEmailAddress: results[a].strEmail,
							strCategory: 'Bundled Items',
							jsonOtherSpecifications: results[a].strBundleTitle
						}
						una.push(pushObject)
					}
				}
				console.log(una);
				res.send(una)
			})
		}
		else{
			console.log(una);
			res.send(una)
		}
	})
})
router.get('/utilities', middleware.employeeLoggedIn, middleware.acquisitionQualified, middleware.inventoryQualified, middleware.auctionQualified, (req, res) => {
	db.query('SELECT * FROM tbl_utilities WHERE intUtilitiesID = 1', (err, results, fields) =>{
		if(err) console.log(err)
		
		delete req.session["utilities"]
		console.log(results[0])
		req.session.utilities = results[0];
		console.log(req.session.utilities)
		res.render('management/views/utilities', {session: req.session});
	})
})
router.post('/utilities/edit', middleware.employeeLoggedIn, (req, res) => {
	console.log(req.body)
	var update = `UPDATE tbl_utilities SET 
	dblBuyersPremium = ${eval(req.body.buyersPremium+'/100')},
	intPaymentDays = ${req.body.paymentDays},
	intMinimumDaysForAuction = ${req.body.minimumDaysOfAuction},
	intMaximumDaysForAuction = ${req.body.maximumDaysOfAuction},
	intMaximumItemsInCatalog = ${req.body.maximumItemsInCatalog},
	intMinimumItemsInCatalog = ${req.body.minimumItemsInCatalog},
	intAuctionMonthLimit = ${req.body.auctionMonthLimit} ,
	intExcellent = ${req.body.excellent},
	intGood = ${req.body.good},
	intOkay = ${req.body.okay},
	intBad = ${req.body.bad},
	dblSalvagePrice = ${eval(req.body.salvagePrice+'/100')} ,
	doubleCommission = ${eval(req.body.companyCommission+'/100')},
	intTimesInAuctionMax = ${req.body.maximumTimesInAuction},
	intRegFee = ${req.body.onlineBiddingRegistrationFee},
	strCompanyName = '${req.body.nameOfCompany}',
	strAccountNumber = '${req.body.bankAccountNumber}',
	jsonCompanyAddress = '${req.body.jsonCompanyAddress}'
	WHERE intUtilitiesID = 1`
	db.query(update, (err, results, fields) =>{
		if(err) console.log(err)

		res.send(true)
	})
})
//reports dynamic
router.get('/reports/sales', middleware.employeeLoggedIn, middleware.acquisitionQualified, middleware.inventoryQualified, middleware.auctionQualified, (req, res) => {
	
	console.log('===Sales Report===');
	
				var timeInterval = 5 * 60 * 2000; // 5 minutes
					var mas = MA(timeInterval);
				mas.push(new Date(moment().subtract(5, 'months').format('YYYY-MM-DD')), 0)	
				mas.push(new Date(moment().subtract(4, 'months').format('YYYY-MM-DD')), 0)	
				mas.push(new Date(moment().subtract(3, 'months').format('YYYY-MM-DD')), 60000)	
				mas.push(new Date(moment().subtract(2, 'months').format('YYYY-MM-DD')), 3000)	
				mas.push(new Date(moment().subtract(1, 'months').format('YYYY-MM-DD')), 1500)	
				mas.push(new Date(moment().format('YYYY-MM-DD')), 2000)	

				console.log('=========================fore')
				console.log(mas.forecast())

	res.render('management/views/salesreport', {session: req.session})
})

router.post('/reports/graphical/items', middleware.employeeLoggedIn, (req, res) => {
	var itemQuery = `SELECT (SELECT COUNT(*) FROM tbl_consignment_item) AS totalItems, (SELECT COUNT(*) FROM tbl_consignment_item WHERE booItemStatus = 2 OR booItemStatus = 4) AS doneItems;`
	db.query(itemQuery, (err, results, field) => {
		if(err) console.log(err);
		var totalItems = results[0].totalItems;
		var doneItems = results[0].doneItems;

		var percentageRemaining = (totalItems-doneItems)/totalItems * 100;
		var percentageFilled = 100 - percentageRemaining;
	
		res.send({percentageRemaining: percentageRemaining, percentageFilled: percentageFilled, indicator: true, totalItems: totalItems, doneItems: doneItems});
		res.end();
	})
})

router.post('/reports/sales/monthly', middleware.employeeLoggedIn, (req, res) => {
	var rows = req.body.rows;

	var reportQuery = `SELECT datDate, SUM(intPremium + intComission) AS totalProfit, SUM(intPremium + dblSIDBidPrice) AS totalRevenue, SUM(dblSIDBidPrice-intComission) as netPayment, COUNT(*) As assetSales FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate()) AND booSIStatus != 0 AND booSIStatus != 4;`
	for( var i = 1; i < rows; i++){
		reportQuery = reportQuery + `SELECT datDate, SUM(intPremium + intComission) AS totalProfit, SUM(intPremium + dblSIDBidPrice) AS totalRevenue, SUM(dblSIDBidPrice-intComission) as netPayment, COUNT(*) As assetSales FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate()) - ${i} AND booSIStatus != 0 AND booSIStatus != 4;`
		if(i == rows - 1){
			db.query(reportQuery, (err, results, field) => {
				if(err) console.log(err);
				var today = moment(new Date)
				var timeInterval = 5 * 60 * 2000; // 5 minutes
				
				console.log(today)
				var forecast = []
				for(var i = results.length-1; i >= 0 ; i--){
					var ma = MA(timeInterval);
					if(results[i][0].datDate != null){
						
						for(var x= results.length-1; x >= i ; x--){
							if(results[x][0].datDate != null){
								ma.push(new Date(moment(results[x][0].datDate).format('YYYY-MM-DD')), results[x][0].totalRevenue);
							}
							else{
								ma.push(new Date(moment().subtract(x, 'months').format('YYYY-MM-DD')), results[x][0].totalRevenue);								
							}
							if(x == i){
								results[i][0].forecastValue = ma.forecast();
							}
						}
						results[i][0].datDate = moment(results[i][0].datDate).format('MMMM YYYY')
					}
					else{
						console.log(i)
						console.log(today.subtract(i, 'months').format('YYYY-MM-DD'))
						for(var x= results.length-1; x >= i ; x--){
							if(results[x][0].datDate != null){
								ma.push(new Date(moment(results[x][0].datDate).format('YYYY-MM-DD')), results[x][0].totalRevenue);
							}
							else{
								ma.push(new Date(moment().subtract(x, 'months').format('YYYY-MM-DD')), results[x][0].totalRevenue);								
							}
							if(x == i){
								results[i][0].forecastValue = ma.forecast();
							}
						}
						results[i][0].datDate = moment().subtract(i, 'months').format('MMMM YYYY')
					}
					if(i == 0){
						res.send({indicator: true, report: results})
						res.end()
					}
				}
			})
		}
	}
})

router.post('/reports/sales/yearly', middleware.employeeLoggedIn, (req, res) => {
	var rows = req.body.rows;

	var reportQuery = `SELECT datDate, SUM(intPremium + intComission) AS totalProfit, SUM(intPremium + dblSIDBidPrice) AS totalRevenue, SUM(dblSIDBidPrice-intComission) as netPayment, COUNT(*) As assetSales FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE YEAR(datDate) = YEAR(curdate()) AND booSIStatus != 0 AND booSIStatus != 4;`
	for( var i = 1; i < rows; i++){
		reportQuery = reportQuery + `SELECT datDate, SUM(intPremium + intComission) AS totalProfit, SUM(intPremium + dblSIDBidPrice) AS totalRevenue, SUM(dblSIDBidPrice-intComission) as netPayment, COUNT(*) As assetSales FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE YEAR(datDate) = YEAR(curdate()) - ${i} AND booSIStatus != 0 AND booSIStatus != 4;`
		if(i == rows - 1){
			db.query(reportQuery, (err, results, field) => {
				if(err) console.log(err);
				var today = moment(new Date)
				var timeInterval = 5 * 60 * 2000; // 5 minutes
				
				console.log(today)
				var forecast = []
				for(var i = results.length-1; i >= 0 ; i--){
					var ma = MA(timeInterval);
					if(results[i][0].datDate != null){
						
						for(var x= results.length-1; x >= i ; x--){
							if(results[x][0].datDate != null){
								ma.push(new Date(moment(results[x][0].datDate).format('YYYY-MM-DD')), results[x][0].totalRevenue);
							}
							else{
								ma.push(new Date(moment().subtract(x, 'years').format('YYYY-MM-DD')), results[x][0].totalRevenue);								
							}
							if(x == i){
								results[i][0].forecastValue = ma.forecast();
							}
						}
						results[i][0].datDate = moment(results[i][0].datDate).format('YYYY')
					}
					else{
						console.log(i)
						console.log(today.subtract(i, 'years').format('YYYY-MM-DD'))
						for(var x= results.length-1; x >= i ; x--){
							if(results[x][0].datDate != null){
								ma.push(new Date(moment(results[x][0].datDate).format('YYYY-MM-DD')), results[x][0].totalRevenue);
							}
							else{
								ma.push(new Date(moment().subtract(x, 'years').format('YYYY-MM-DD')), results[x][0].totalRevenue);								
							}
							if(x == i){
								results[i][0].forecastValue = ma.forecast();
							}
						}
						results[i][0].datDate = moment().subtract(i, 'years').format('YYYY')
					}
					if(i == 0){
						res.send({indicator: true, report: results})
						res.end()
					}
				}
			})
		}
	}
})
//Reports Infographic
router.post('/reports/revenue/currentmonth', (req, res) => {
	console.log('===Revenue Accessed===');
	var revenueQuery = `SELECT SUM(intPremium + dblSIDBidPrice) AS totalRevenue FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate()) AND booSIStatus != 0 AND booSIStatus != 4;`
	db.query(revenueQuery, (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			console.log('Total Revenue for this month:', results[0].totalRevenue);
			res.send({indicator: true, totalRevenue: results[0].totalRevenue});
			res.end();
		}
		else{
			res.send({indicator: false});
			res.end();
		}
	})
})


router.post('/reports/revenue/currentmonth', (req, res) => {
	console.log('===Revenue Accessed===');
	var revenueQuery = `SELECT SUM(intPremium + dblSIDBidPrice) AS totalRevenue FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate()) AND booSIStatus != 0 AND booSIStatus != 4;`
	db.query(revenueQuery, (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			console.log('Total Revenue for this month:', results[0].totalRevenue);
			res.send({indicator: true, totalRevenue: results[0].totalRevenue});
			res.end();
		}
		else{
			res.send({indicator: false});
			res.end();
		}
	})
})


router.post('/reports/graphical/topbidder', (req, res) => {
	var topQuery = `SELECT COUNT(intReceiptBidderID) AS winCount, strUsername, strName FROM tbl_sales_invoice
	JOIN tbl_bidder_accounts ON intBABidderID = intReceiptBidderID
	JOIN tbl_bidder ON intBABidderID = intBidderID
	JOIN tbl_sales_invoice_details ON intSIDSalesInvoiceID = intSalesInvoiceID
	WHERE booSIStatus = 1 OR booSIStatus = 2 OR booSIStatus = 3
	group by strUsername order by winCount DESC LIMIT 5;`;
	db.query(topQuery, (err, results, field) => {
		if(err) console.log(err)
		if(results.length > 0){
			res.send({indicator: true, topbidders: results})
			res.end();
		}
	})

})




router.post('/reports/revenue/prevmonth', (req, res) => {
	console.log('===Revenue Accessed===');
	var revenueQuery = `SELECT SUM(intPremium + dblSIDBidPrice) AS totalRevenue FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate())-1 AND booSIStatus != 0 AND booSIStatus != 4;`
	db.query(revenueQuery, (err, results, field) => {
		if(err) console.log(err);
		if(results[0].totalRevenue != null){
			console.log('Total Revenue for this month:', results[0].totalRevenue);
			res.send({indicator: true, totalRevenue: results[0].totalRevenue});
			res.end();
		}
		else{
			res.send({indicator: false});
			res.end();
		}
	})
})

router.post('/reports/consignor/count', middleware.employeeLoggedIn, (req, res) => {
	
	var countQuery = `SELECT COUNT(*) as counter FROM tbl_consignor WHERE booOnline = 1;`
	db.query(countQuery, (err, results, field) => {
		if(err) console.log(err);

		res.send({indicator: true, consignorCount: results[0].counter});
		res.end();
	})
})
router.post('/reports/bidder/count', middleware.employeeLoggedIn, (req, res) => {
	
	var countQuery = `SELECT COUNT(*) as counter FROM tbl_bidder WHERE booOnline = 1;`
	db.query(countQuery, (err, results, field) => {
		if(err) console.log(err);

		res.send({indicator: true, bidderCount: results[0].counter});
		res.end();
	})
})


router.post('/reports/registeredconsignor/count', (req, res) => {
	var countQuery = `SELECT COUNT(*) as counter FROM tbl_consignor_accounts JOIN tbl_consignor ON intConsignorID = intCSConsignorID WHERE booStatus = 0 AND MONTH(datDateRegistered) = MONTH(CURDATE());SELECT COUNT(*) as counter FROM tbl_consignor_accounts JOIN tbl_consignor ON intConsignorID = intCSConsignorID WHERE booStatus = 0 AND MONTH(datDateRegistered) = MONTH(CURDATE())-1;`
	db.query(countQuery, (err, results, field) => {
		if(err) console.log(err);

		var current, prev;
		if(results[0][0].counter != null)
			current = results[0][0].counter;
		else current = 0 

		if(results[1][0].counter != null)
			prev = results[1][0].counter;
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

		res.send({indicator: true, consignorCount: results[0][0].counter, percentage: percentage})
		res.end();
	})
});

router.post('/reports/registeredbidder/count', (req, res) => {


	var countQuery = `SELECT COUNT(*) as counter FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID WHERE booStatus = 1 AND MONTH(datDateRegistered) = MONTH(CURDATE());SELECT COUNT(*) as counter FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID WHERE booStatus = 1 AND MONTH(datDateRegistered) = MONTH(CURDATE())-1;`
	db.query(countQuery, (err, results, field) => {
		if(err) console.log(err);

		var current, prev;
		if(results[0][0].counter != null)
			current = results[0][0].counter;
		else current = 0 

		if(results[1][0].counter != null)
			prev = results[1][0].counter;
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

		res.send({indicator: true, bidderCount: results[0][0].counter, percentage: percentage})
		res.end();
	})
});


router.post('/reports/netloss/currentmonth', (req, res) => {
	

	console.log('===Consignment Counter Accessed===');
	var LossQuery = `SELECT SUM(tbl_issues.intQTY * dblReservePrice) AS Loss FROM tbl_issues JOIN tbl_consignment_item ON intIssueConsignmentItemID = intConsignmentItemID JOIN tbl_reserved_price ON intRPConsignmentItemID = intConsignmentItemID WHERE booIssueStatus = 1 AND MONTH(datDateSeen) = MONTH(CURDATE()); SELECT SUM(tbl_issues.intQTY * dblReservePrice) AS Loss FROM tbl_issues JOIN tbl_consignment_item ON intIssueConsignmentItemID = intConsignmentItemID JOIN tbl_reserved_price ON intRPConsignmentItemID = intConsignmentItemID WHERE booIssueStatus = 1 AND MONTH(datDateSeen) = MONTH(CURDATE())-1;`

	db.query(LossQuery, (err, results, field) => {
		if(err) console.log(err);
		var current, prev;
		if(results[0][0].Loss != null)
			current = results[0][0].Loss;
		else current = 0 

		if(results[1][0].Loss != null)
			prev = results[1][0].Loss;
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

		res.send({indicator: true, Loss: results[0][0].Loss, percentage: percentage})
	})
})


router.post('/reports/netincome/currentmonth', (req, res) => {
	

	console.log('===Consignment Counter Accessed===');
	var netIncomeQuery = `SELECT SUM(intPremium + intComission) AS netIncome FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID  WHERE booSIStatus != 0 AND booSIStatus != 4 AND MONTH(datDate) = MONTH(CURDATE());
						SELECT SUM(intPremium + intComission) AS netIncome FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE booSIStatus != 0 AND booSIStatus != 4 AND MONTH(datDate) = MONTH(CURDATE())-1;`
	db.query(netIncomeQuery, (err, results, field) => {
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

router.post('/reports/consignment/counter', (req, res) => {
	console.log('===Consignment Counter Accessed===');
	var revenueQuery = `SELECT COUNT(*) as consignmentCount FROM tbl_consignment WHERE MONTH(datDateReceived) = MONTH(CURDATE()) AND booStatus = 1;
						SELECT COUNT(*) as consignmentCount FROM tbl_consignment WHERE MONTH(datDateReceived) = MONTH(CURDATE())-1 AND booStatus = 1;`
	db.query(revenueQuery, (err, results, field) => {
		if(err) console.log(err);
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


router.post('/reports/graphical/storage', (req, res) => {
	console.log('===Storage Accessed===');
	var storeQuery = `SELECT sum(intStorage) AS storage FROM tbl_consignment_item WHERE booIsReceived = 1 AND (booItemStatus = 0 OR booItemStatus = 1)`;
	db.query(storeQuery, (err, results, field) => {
		if(err) console.log(err);

		if(results.length > 0){
			var storageCurrent = results[0].storage;

			var percentageRemaining = (4000-storageCurrent)/4000 * 100;
			var percentageFilled = 100 - percentageRemaining;
			
			res.send({percentageRemaining: percentageRemaining, percentageFilled: percentageFilled, indicator: true});
			res.end();
		}
	})
})

router.post('/reports/revenue/graphical', (req, res) => {
	console.log('===Revenue Accessed===');

	var revenueQuery = `SELECT SUM(intPremium + dblSIDBidPrice) AS totalRevenue FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate()) AND booSIStatus != 0 AND booSIStatus != 4;`
	for(var i = 1; i < 12; i++){
		revenueQuery = revenueQuery + `SELECT SUM(intPremium + dblSIDBidPrice) AS totalRevenue FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE MONTH(datDate) = MONTH(curdate())-${i} AND booSIStatus != 0 AND booSIStatus != 4;`
	}
	
	db.query(revenueQuery, (err, results, field) => {
		if(err) console.log(err);

		var monthReport = [];
		var d = new Date;
		monthReport.push(moment().format('MMMM'));

		for(var i = 1; i < 12; i++){
			monthReport.push(moment().subtract(i, 'months').format('MMMM'));

		}

		console.log(monthReport)
		
		
		
		res.send({indicator: true, totalRevenue: results, monthReport: monthReport});
		res.end();
		
	})
})



router.post('/reports/categories/timeseries', (req, res) => {
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
router.get('/lostanddamage', middleware.employeeLoggedIn, middleware.inventoryQualified, (req, res) => {
	var queryString = `SELECT *, tbl_issues.intQTY AS issueQty FROM tbl_issues
	JOIN tbl_consignment_item ON intConsignmentItemID = intIssueConsignmentItemID`
	db.query(queryString, (err, results, fields) => {
		if (err) console.log(err)

		if(results.length > 0){
			for(var i=0; i<results.length; i++){
				results[i].datDateSeen = moment(results[i].datDateSeen).format('YYYY-MM-DD');
			}
			res.render('management/views/lostanddamage', {session: req.session, issues: results});
		}
		else{
			res.render('management/views/lostanddamage', {session: req.session, issues: results});
		}
	})
})
router.post('/lostanddamage/delete', middleware.employeeLoggedIn, (req, res) => {
	var queryString = `DELETE FROM tbl_issues WHERE intIssuesID = ?`
	db.query(queryString, [req.body.id], (err, results, fields) => {
		if (err) console.log(err)

		res.send(true)
	})
})
router.post('/uom/query', (req, res) => {
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


//Router for 404 Page
router.get('*', (req, res) => {
	
	console.log('404 Page')
	res.status(404).render('management/views/404');
})


String.prototype.capitalize = function() {
	return this.charAt(0).toLowerCase() + this.slice(1);
}


router.post('/get/notif', middleware.employeeLoggedIn, (req, res) =>{

	var notifQuery = `SELECT * FROM tbl_notification WHERE strNotifTo = 'admin' AND booNotifRead = 0 ORDER BY datNotifDate DESC;`
	db.query(notifQuery, (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			for(var i = 0; i < results.length; i++){
				results[i].datNotifDate = moment(results[i].datNotifDate).fromNow();
			}
			console.log(results);
			res.send({indicator: true, notifications: results})
		}
	})
})

router.post('/read/notif', middleware.employeeLoggedIn, (req, res) =>{
	var notifMessage = req.body.notifMessage;

	var notifQuery = `UPDATE tbl_notification SET booNotifRead = 1 WHERE strNotifMessage = ?;`
	db.query(notifQuery, [notifMessage],(err, results, field) => {
		if(err) console.log(err);
		console.log('hi')
		res.send({indicator: true});
	})
})


function connectAdmin(req){
	req.io.on('connect', (socket) => {
		socket.room = "notifAdmin";
		console.log(socket.room)
		console.log('ddd')
	});
}

exports.index = router