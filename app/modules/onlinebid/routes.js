var express = require('express');
var router = express.Router();
var db = require('../../lib/database')();
const multer = require('multer');
const moment = require('moment');
var renameKeys = require('rename-keys');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.jpg')
  }
})

var request = require('request');
var upload = multer({storage: storage})
var authMiddleware = require('../auth/middlewares/auth');

function getSession(req, res, next){
	if(typeof req.session.utilities == 'undefined'){
		db.query('SELECT * FROM tbl_utilities WHERE intUtilitiesID = 1', (err, results, fields) => {
			if(err) console.log(err)

			req.session.utilities = results[0];
			return next();
		})
	}
	else{
		return next();
	}
}

router.get('/', getSession, (req, res) => {
	var socket = require('socket.io-client')(`http://${req.hostname}:${req.port}`)
	
	req.io.on('connect', function(socket){
		console.log('connecting... mainroom')
		socket.room = 'mainroom';
	})

	bidFunc();

	function updateHighestBid(intBidlistID, bid, i, salesInvoiceID){
		
		console.log('=============================')
		console.log(bid)
		console.log('=============================')
		if(bid[i].intBidlistBidderID == 0){
			var updateHighestBid = `UPDATE tbl_bidlist SET booStatus = 1 WHERE intBidlistID = ?`;
			db.query(updateHighestBid, [intBidlistID], (err, results, field) => {
				if(err) return console.log(err);
				var deleteSalesInvoice = `DELETE FROM tbl_sales_invoice WHERE intSalesInvoiceID = ?`
				db.query(deleteSalesInvoice, [salesInvoiceID], (err, results, fields) => {
					if (err) console.log(err)
					var updateItemStatus = `SELECT * FROM tbl_bidlist JOIN tbl_catalog ON intCatalogID = intBidlistCatalogID WHERE intBidlistID = ?`
					db.query(updateItemStatus, [intBidlistID], (err, results, field) => {
						if(err) return console.log(err);
						if(results.length > 0){
							for(var i = 0; i < results.length; i++){
								var catalogID = results[i].strCatalogItemID;
								if(results[i].strCatalogItemID.charAt(0) == 'B'){
									var updateBundleQuery = `UPDATE tbl_bundle SET booBundleStatus = 0 WHERE intBundleID = ?`
									db.query(updateBundleQuery, [catalogID], (err, resulta, field) => {
										if(err) return console.log(err);
										var insideQuery = `SELECT * FROM tbl_bundle JOIN tbl_items_in_bundle ON strIIBBundleID = intBundleID WHERE intBundleID = ?`
										db.query(insideQuery, [catalogID], (err, resulta, field) => {
											if(err) return console.log(err);
											
											if(resulta.length > 0){
												for(var x = 0; x < resulta.length; x++){
													var itemID = resulta[x].intIIBItemID;
													var lastBundleQuery = `UPDATE tbl_consignment_item SET intTimesInAuction = intTimesInAuction + 1 WHERE intConsignmentItemID = ?;`
													db.query(lastBundleQuery, [itemID], (err, resulta, field) => {
														if(err) return console.log(err);

														var firstQuery = `SELECT * FROM tbl_consignment_item WHERE intConsignmentItemID = ?`
														db.query(firstQuery, [itemID], (err, results, field) => {
															if(err) console.log(err);
															
															if(results.length > 0){
																var item = results[0];
																var utilQuery = `SELECT * FROM tbl_utilities`
																db.query(utilQuery, (err, results, field) => {
																	if(err) return console.log(err);
																	if(results.length > 0){
																		req.session.utilities = results[0]
																		if(item.intTimesInAuction >= req.session.utilities.intTimesInAuctionMax){
																			var pullOutQuery = `UPDATE tbl_consignment_item SET booItemStatus = 3 WHERE intConsignmentItemID = ?`
																			db.query(pullOutQuery, [itemID], (err, results, field) => {
																				if(err) return console.log(err);
																				socket.emit('monitoring', item.intConsignmentItemID, 3, item.intCIConsignment, function(){
																					console.log('updated sa consignor side')
																				});
																			})
																		}
																	}
																});
																
															}
														}) 
													});
													
													if(x == resulta.length - 1){

														var buwagQuery = `SELECT Count(*) as counter
																		FROM tbl_consignment_item 
																		JOIN tbl_items_in_bundle 
																			ON intConsignmentItemID = intIIBItemID 
																		WHERE strIIBBundleID = ? 
																			AND (booItemStatus = 0 OR booItemStatus = 1);`
														db.query(buwagQuery, [catalogID], (err, results, field) => {
															if(err) console.log(err);
															if(results[0].counter <= 1){
																var updateBundleQuery = `UPDATE tbl_consignment_item JOIN tbl_items_in_bundle ON intConsignmentItemID = intIIBItemID SET booIsBundled = 0 WHERE strIIBBundleID = ?`
																db.query(updateBundleQuery, [catalogID], (err, results, fields) => {
																	if(err) return console.log(err);
																	var deleteBundleQuery = `DELETE FROM tbl_bundle WHERE intBundleID = ?;`
																	db.query(deleteBundleQuery, [catalogID], (err, results, field) =>{
																		if(err) console.log(err);
																		console.log('Item updated (bundle0)')
																		
																	})
																})
															}
														})
														
													}
												} //- Foor Loop Resulta
											} // -Resulta

										}); //- Inside Query
									}); //-update Bundle Query							
								} //- charAt B
								else if(results[i].strCatalogItemID.charAt(0) == 'I'){
									var insideItemQuery = `UPDATE tbl_consignment_item SET booItemStatus = 0, intTimesInAuction = intTimesInAuction + 1 WHERE strItemID = ?;
									SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
									db.query(insideItemQuery, [catalogID, catalogID], (err, results, field) => {
										if(err) return console.log(err);
										var itemNowFirst = results[1][0];
										socket.emit('monitoring', itemNowFirst.intConsignmentItemID, 0, itemNowFirst.intCIConsignment, function(){
											console.log('updated sa consignor side')
										});
										var selectQuery = `SELECT * FROM tbl_consignment_item WHERE intTimesInAuction >= ? AND strItemID = ?;`;
										db.query(selectQuery, [req.session.utilities.intTimesInAuctionMax, catalogID], (err, results, field) => {
											if(err) return console.log(err);
											if(results.length > 0){
												var pullOutQuery = `UPDATE tbl_consignment_item SET booItemStatus = 3 WHERE strItemID = ?;
												SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
												db.query(pullOutQuery, [catalogID, catalogID], (err, results, field) => {
													if(err) console.log(err);
													
													var itemNow = results[1][0];
													console.log('Item updated (single0)')
													socket.emit('monitoring', itemNow.intConsignmentItemID, 3, itemNow.intCIConsignment, function(){
														console.log('updated sa consignor side')
													});
												})
											}
										})
									}); //- Inside Item Query
								} //- charAt Item
							}//- For Loop
						} //- If statement results.length
						

					});	//- Update Status Query
				})
			});

		}
		else{
			var updateHighestBid = `UPDATE tbl_bidlist SET booStatus = 1 WHERE intBidlistID = ?`;
			db.query(updateHighestBid, [intBidlistID], (err, results, field) => {
				if(err) return console.log(err);

				var salesDetailsQuery = `INSERT INTO tbl_sales_invoice_details (intSIDSalesInvoiceID, intRDBidlistID) VALUES (?,?)`
				db.query(salesDetailsQuery, [salesInvoiceID, intBidlistID], (err, result2, fields) => {
					if(err) console.log(err);
				
					var updateItemStatus = `SELECT * FROM tbl_bidlist JOIN tbl_catalog ON intCatalogID = intBidlistCatalogID WHERE intBidlistID = ?`
					db.query(updateItemStatus, [intBidlistID], (err, results, field) => {
						if(err) return console.log(err);
						
						if(results.length > 0){
							for(var i = 0; i < results.length; i++){
								if(results[i].strCatalogItemID.charAt(0) == 'B'){
									var insideQuery = `SELECT * FROM tbl_bundle JOIN tbl_items_in_bundle ON strIIBBundleID = intBundleID WHERE intBundleID = ?`
									db.query(insideQuery, [results[i].strCatalogItemID], (err, resulta, field) => {
										if(err) return console.log(err);
										
										if(resulta.length > 0){
											for(var x = 0; x < resulta.length; x++){
												var itemID = resulta[x].intIIBItemID;
												var lastBundleQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2, intTimesInAuction = intTimesInAuction + 1 WHERE intConsignmentItemID = ?;
												SELECT * FROM tbl_consignment_item WHERE intConsignmentItemID = ?`
												db.query(lastBundleQuery, [itemID, itemID], (err, resulta, field) => {
													if(err) return console.log(err);
													var itemNowBundle = resulta[1][0]
													socket.emit('monitoring', itemNowBundle.intConsignmentItemID, 2, itemNowBundle.intCIConsignment, function(){
														console.log('updated sa consignor side')
													});
													console.log('Item updated (bundle)')											
												});									
											}
										}

									});
								}
								else if(results[i].strCatalogItemID.charAt(0) == 'I'){
									var insideItemQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2, intTimesInAuction = intTimesInAuction + 1 WHERE strItemID = ?;
									SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
									db.query(insideItemQuery, [results[i].strCatalogItemID, results[i].strCatalogItemID], (err, results, field) => {
										if(err) return console.log(err);
										var itemNow = results[1][0]
										socket.emit('monitoring', itemNow.intConsignmentItemID, 2, itemNow.intCIConsignment, function(){
											console.log('updated sa consignor side')
										});
										console.log('Item updated (single)')
									});
								}
							}
						}
					});			
				});
			});
		}//- else

		if(i == bid.length - 1){
			bidFunc();
		}
	}

	function invoiceFunc(arrBid, bids){
		var insertInvoiceQuery = `INSERT INTO tbl_sales_invoice (datDate, intReceiptBidderID, booSIStatus, intSIAuctionID) VALUES (now(), ?, 0, ?)`
		db.query(insertInvoiceQuery, [arrBid, req.session.auction.intAuctionID], (err, resulta, fields) => {
			if (err) console.log(err);
			var salesInvoiceID = resulta.insertId;
			for(var i = 0; i < bids.length; i++){
				if(bids[i].intBidlistBidderID == arrBid){
					console.log('////////////////////////////////////accessed')
					updateHighestBid(bids[i].intBidlistID, bids, i, salesInvoiceID)
				}
			}
		})
	}

		


	function bidFunc(){
		delete req.session.auction
		var auctionQuery = `SELECT * FROM tbl_auction WHERE booAuctionStatus = 2 AND booAuctionType = 2`
		db.query(auctionQuery, function (err, results, field){
			if(err) return console.log(err);
			console.log('ongoing', results)
			if(results.length > 0){

				results[0].jsonDuration = JSON.parse(results[0].jsonDuration);
				var dateStart = moment(results[0].datDateStart).format('YYYY-MM-DD') + ' ' + results[0].jsonDuration.startingTime;
				results[0].datDateEnd = moment(dateStart).add(results[0].jsonDuration.days, 'd').add(results[0].jsonDuration.hours, 'h').add(results[0].jsonDuration.minutes, 'm').format('MM/DD/YYYY HH:mm:ss');
				req.session.auction = results[0]
				console.log(new Date(results[0].datDateEnd), new Date())
				if(new Date(results[0].datDateEnd) < new Date()){

					
					var updateQuery = `UPDATE tbl_auction SET booAuctionStatus = 3, datDateEnd = ? WHERE intAuctionID = ?`;
					db.query(updateQuery, [new Date(), req.session.auction.intAuctionID], (err, results, field) => {
						if(err) return console.log(err);

						var selectHighQuery = `SELECT t1.intBidlistBidderID, t1.dblBidPrice, t1.intBidlistID, t1.intBidlistCatalogID, t3.intAuctionID FROM tbl_bidlist t1 JOIN tbl_catalog t2 ON intBidlistCatalogID = intCatalogID JOIN tbl_auction t3 ON intCatalogAuctionID = intAuctionID INNER JOIN (SELECT 	Max(dblBidPrice) AS maxi, intBidlistCatalogID FROM tbl_bidlist GROUP BY intBidlistCatalogID) t2 ON t1.intBidlistCatalogID = t2.intBidlistCatalogID AND t1.dblBidPrice = t2.maxi AND t3.intAuctionID = ?`
						db.query(selectHighQuery, [req.session.auction.intAuctionID], (err, results, field) => {
							if(err) return console.log(err);
							console.log(results);
							if(results.length > 0){
								var arrBids = [];
								var bids = results;
								for(var x = 0 ; x < bids.length; x++){
									if(!arrBids.includes(bids[x].intBidlistBidderID)){
										arrBids.push(bids[x].intBidlistBidderID)
									}
									if(x == bids.length - 1){
										console.log('-------------------------------')
										console.log(arrBids);
										console.log('-------------------------------')
										for(var v = 0; v < arrBids.length; v++){

											invoiceFunc(arrBids[v], bids)
											
										}
									}
								}
								
							}	
						});		
					})


				}

				if(req.session.bidder){
					if(req.session.bidder.booStatus == 0 || req.session.bidder.booStatus == 2){
						res.redirect('/bid/profile');
					}
					else{
						res.render('onlinebid/views/home', {hostname: req.hostname, bidder: req.session.bidder, auction: results[0], port: req.port, util: req.session.utilities})  
					}
				}
				else{
					res.render('onlinebid/views/home', {hostname: req.hostname, auction: results[0], port: req.port, util: req.session.utilities})  
				}			
			}
			else{
				var auction2Query = `SELECT * FROM tbl_auction WHERE datDateStart < now() AND booAuctionStatus = 5 AND booAuctionType = 2 ORDER BY datDateStart DESC LIMIT 1`
				db.query(auction2Query, function (err, results, field){
					if(err) return console.log(err);
					console.log('start', results)

					if(results.length > 0){

						var updateQuery = `UPDATE tbl_auction SET booAuctionStatus = 2 WHERE intAuctionID = ?`;
						db.query(updateQuery, [results[0].intAuctionID], (req, res) => {
							if(err) return console.log(err);

						})
						results[0].jsonDuration = JSON.parse(results[0].jsonDuration);
						var dateStart = moment(results[0].datDateStart).format('MM/DD/YYYY') + ' ' + results[0].jsonDuration.startingTime;
						results[0].datDateEnd = moment(dateStart).add(results[0].jsonDuration.days, 'd').add(results[0].jsonDuration.hours, 'h').add(results[0].jsonDuration.minutes, 'm').format('MM/DD/YYYY HH:mm:ss');
						req.session.auction = results[0]


						console.log('date end', dateStart);
						if(req.session.bidder){
							if(req.session.bidder.booStatus == 0 || req.session.bidder.booStatus == 2){
								res.redirect('/bid/profile');
							}
							else{
								res.render('onlinebid/views/home', {port: req.port, hostname: req.hostname, bidder: req.session.bidder, auction: results[0], util: req.session.utilities})
							}
						}
						else{
							res.render('onlinebid/views/home', {port: req.port, hostname: req.hostname, auction: results[0], util: req.session.utilities})  
						}			

					}
					else{

						var upcomeQuery = `SELECT * FROM tbl_auction WHERE datDateStart > now() AND booAuctionStatus = 5 AND booAuctionType = 2 ORDER BY datDateStart ASC`
						db.query(upcomeQuery, function (err, results, field){
							if(err) return console.log(err);
							console.log(results)
							if(results.length > 0){

								for(var i = 0; i < results.length; i++){
									results[i].jsonDuration = JSON.parse(results[i].jsonDuration);
									var dateStart = moment(results[i].datDateStart).format('MM/DD/YYYY') + ' ' + results[i].jsonDuration.startingTime;
									results[i].datDateEnd = moment(dateStart).add(results[i].jsonDuration.days, 'd').add(results[i].jsonDuration.hours, 'h').add(results[i].jsonDuration.minutes, 'm').format('MM/DD/YYYY HH:mm:ss');
									results[i].datDateStart = moment(results[i].datDateStart).format('MMMM Do YYYY, h:mm:ss a');
									results[i].datDateEnd = moment(results[i].datDateEnd).format('MMMM Do YYYY, h:mm:ss a')
								}
								if(req.session.bidder){
									if(req.session.bidder.booStatus == 0 || req.session.bidder.booStatus == 2){
										res.redirect('/bid/profile');
									}
									else{
										res.render('onlinebid/views/home', {port: req.port, hostname: req.hostname, bidder: req.session.bidder, auctionlist: results, util: req.session.utilities})  
									}
								}
								else{
									res.render('onlinebid/views/home', {port: req.port, hostname: req.hostname, auctionlist: results, util: req.session.utilities})  
								}						
							}
							else{
								if(req.session.bidder){
									if(req.session.bidder.booStatus == 0 || req.session.bidder.booStatus == 2){
										res.redirect('/bid/profile');
									}
									else{
										res.render('onlinebid/views/home', {port: req.port, hostname: req.hostname, bidder: req.session.bidder, util: req.session.utilities})  
									}
								}
								else{
									res.render('onlinebid/views/home', {port: req.port, hostname: req.hostname, util: req.session.utilities})  
								}	
							}
						})
						
					}
					
				});

			}
		})
	}
	
})


router.post('/', (req, res) => {
	console.log(req.body)

	var loginQuery = `SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID =  intBABidderID WHERE strUsername = ? AND strPassword = ? AND booStatus != 3 AND booStatus != 0;`
	db.query(loginQuery, [req.body.username, req.body.password], function (err, results, field){
		if(err) return console.log(err);

		console.log(results)

		if(results.length == 0){
			res.send({indicator: 'fail'});
			res.end();			
		}
		else{
			 var onlineQuery = `UPDATE tbl_bidder SET booOnline = 1 WHERE intBidderID = ?`;
			db.query(onlineQuery, [results[0].intBidderID], (err, resulta, field) => {
				req.session.bidder = results[0];
				res.send({indicator: 'success'});
				res.end();
			});
		}
	})
})

router.post('/shippingaddress', authMiddleware.bidderNotLoggedIn, (req, res) => {

	var shippingQuery = `SELECT * FROM tbl_address_book WHERE intABBidderID = ? AND booDefault = 1;`
	db.query(shippingQuery, [req.session.bidder.intBidderID], function (err, results, field){
		if(err) return console.log(err);
		console.log('=============Address Book==============')
		console.log(results)
		console.log('=============Address Book==============')		

		if(results.length > 0){
			res.send({indicator: true, addressBook: results[0]})
			res.end();
		}
		else{
			res.send({indicator: false});
			res.end();
		}
	})
})


router.post('/bidlist/access', (req, res) => {
	console.log(req.body);
	blurp();
	function blurp(){
		var blQuery = `SELECT * FROM tbl_bidlist WHERE intBidlistCatalogID = ? ORDER BY dblBidPrice DESC LIMIT 1`
		db.query(blQuery, [req.body.intCatalogID], function (err, results, field){
			if(err){
				console.log(err);
				res.end();
			}
			if(results.length > 0){
				res.send({indicator: true, bid: results[0]});
				res.end();
			}
			else if(results.length == 0){
				if(req.body.booPrice == 1){
					var rpQuery = `SELECT * FROM tbl_reserved_price WHERE intRPConsignmentItemID = ? ORDER BY dblReservePrice ASC LIMIT 1`
					db.query(rpQuery, [req.body.intConsignmentItemID], function (err, results, field){
						if(err){
							console.log(err)
						}

						if(results.length > 0){
							var blurpQuery =  `INSERT INTO tbl_bidlist (intBidlistCatalogID, intBidlistBidderID, dblBidPrice, datDateBid) VALUES (?,0,?, now())`
							db.query(blurpQuery, [req.body.intCatalogID, results[0].dblReservePrice], function (err, results, field){
								if(err) return console.log(err);
								blurp();
							});						
						}
					})
				}
				if(req.body.booPrice == 0){
					
					var blurpQuery =  `INSERT INTO tbl_bidlist (intBidlistCatalogID, intBidlistBidderID, dblBidPrice, datDateBid) VALUES (?,0,?, now())`
					db.query(blurpQuery, [req.body.intCatalogID, 100], function (err, results, field){
						if(err) return console.log(err);
						blurp();
					});						
						
				}

			}
		})
	}
})

router.post('/catalog', (req, res) => {
	var catQuery = `SELECT * FROM tbl_catalog JOIN tbl_consignment_item ON strCatalogItemID = strItemID JOIN tbl_consignment_item_pictures ON intCIPConsignmentItemID = intConsignmentItemID JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID WHERE intCatalogAuctionID = ? GROUP BY strCatalogItemID`
	db.query(catQuery, [req.session.auction.intAuctionID], function (err, results, field){
		if(err){
			console.log(err);
			console.log('=============')
			res.send({indicator: false});
			res.end();
		}
		var items = results;
		var bunQuery = `SELECT * FROM tbl_catalog  JOIN tbl_bundle ON strCatalogItemID = intBundleID WHERE intCatalogAuctionID = ?`
		db.query(bunQuery, [req.session.auction.intAuctionID], function (err, results, field){
			if (err){
				console.log(err);
				console.log('--------------')
				
				res.send({indicator: false});
				res.end();
			}

			if(results){
				var bundles = results
				console.log('--------')
				console.log(results)
				console.log('=======')
				console.log(items);
				res.send({indicator: true, bundles: bundles, items: items})
				res.end();
			}
			else{
				console.log(items);
				res.send({indicator: true, items: items})
				res.end();				
			}
		})
		
	});
})

router.get('/profile', authMiddleware.bidderNotLoggedIn, (req, res) => {
	
	console.log(req.query.m)
	var loginQuery = `SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID =  intBABidderID WHERE strUsername = ? AND strPassword = ? AND booStatus != 3 AND booStatus != 0;`
	db.query(loginQuery, [req.session.bidder.strUsername, req.session.bidder.strPassword], function (err, results, field){
		if(err) return console.log(err);

		console.log(results)

		if(results.length == 0){
			res.redirect('/bid/logout')		
		}
		else{
			 var onlineQuery = `UPDATE tbl_bidder SET booOnline = 1 WHERE intBidderID = ?`;
			db.query(onlineQuery, [results[0].intBidderID], (err, resulta, field) => {
				req.session.bidder = results[0];
				res.render('onlinebid/views/profile', {bidder: req.session.bidder, message: req.query.m, port: req.port, hostname: req.hostname, util: req.session.utilities})  
			});
		}
	})
})

router.get('/paymentregistration/online', authMiddleware.bidderNotLoggedIn, (req, res) => {
	if(req.session.bidder.booStatus == 1)
		return res.redirect('/bid')
	res.render('onlinebid/views/onlinepay')  
})

.post('/paymentawards/online', authMiddleware.bidderNotLoggedIn, (req, res) => {
	console.log(req.body);
	req.session.intSalesInvoiceID = req.body.intSalesInvoiceID;

	var options = {
		url: 'https://pg-sandbox.paymaya.com/payments/v1/payment-tokens',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic cGstNnkyV1g2V2hXeGZRT2c4ZXpLSVV1aUp4YTdnQzRzRHZPaXBuOU5GWGx3eg=',
		},
		body: JSON.stringify(req.body.card), 
	}

	function callback2(error, response, body) {
		console.log('=============')
		if(JSON.parse(body).code == 'PY0008'){
			res.send({indicator: false})
		}
		else{
			console.log(JSON.parse(body));
			req.session.paymentid = JSON.parse(body).id;
			res.send({indicator: true, url: JSON.parse(body).verificationUrl})
		}
	}

	function callback(error, response, body) {
		var bodi = JSON.parse(body);
		var text = "";
              var possible = "0123456789";

              for (var i = 0; i < 10; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
		
		var options2 = {
			url: 'https://pg-sandbox.paymaya.com/payments/v1/payments',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic c2stQm9UbTcxb3FBMWpkQ2Q2YndMd3hLM1FzVlBvOVpPY3IxZHBZZnlBUFVVZA=',
			},
			body: `{
					"paymentTokenId": "${bodi.paymentTokenId}",
					"totalAmount": {
						"amount": ${parseFloat(req.body.amount)},
						"currency": "PHP"
					},
					"requestReferenceNumber": "APP-REF-${text}",
					"redirectUrl": {
						"success": "http://${req.hostname}:${req.port}/bid/getpayment/awards",
						"failure": "http://${req.hostname}:${req.port}/bid/profile?m=Jo7fA6796JNCXohs97s",
						"cancel": "http://shop.someserver.com/cancel?id=6319921"
					}
					}`, 
		}


		request(options2, callback2);
	}

	request(options, callback);
})


.post('/awards/sold/online', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var socket = require('socket.io-client')(`http://${req.hostname}:${req.port}`)
	console.log('========body=========')
	console.log(req.body)
	console.log(req.session.intSalesInvoiceID)
	if(req.body.hasOwnProperty('strItemID')){
		var soldQuery = `UPDATE tbl_sales_invoice_details SET intComission = ?, intPremium = ?, intSIDQty = ?, dblSIDBidPrice = ?, strAwardID = ?, booSIDType = 0 WHERE intSalesInvoiceDetailsID = ?;`
		var commission = parseFloat(req.body.bidPrice) * parseFloat(req.session.utilities.doubleCommission);
		db.query(soldQuery, [commission, req.body.buyersPremium, req.body.quantity, req.body.bidPrice, req.body.strItemID, req.body.intSalesInvoiceDetailsID], function(err, results, field){
			if(err) return console.log(err);
			console.log(results)
			var minusQuery = `UPDATE tbl_consignment_item SET intQTY = intQTY - ? WHERE strItemID = ?`
			db.query(minusQuery, [req.body.quantity, req.body.strItemID], function (err, results, field){
				if(err) return console.log(err);
				var backQuery = `SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
				db.query(backQuery, [req.body.strItemID], function (err, results, field){
					if(err) console.log(err);
					if(results.length > 0){
						console.log('===item sold===')
						console.log(results[0])
  						console.log('===item sold===')
						var itemNow = results[0];
						if(results[0].intQTY > 0){
							var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 0 WHERE strItemID = ?`
							db.query(soldQuery, [req.body.strItemID], function (err, results, field){
								if(err) console.log(err);
								res.send(true);
								socket.emit('monitoring', itemNow.intConsignmentItemID, 0, itemNow.intCIConsignment, function(){
									console.log('updated sa consignor side')
								});
							});							
						}
						else if(results[0].intQTY == 0){
							var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2 WHERE strItemID = ?`
							db.query(soldQuery, [req.body.strItemID], function (err, results, field){
								if(err) console.log(err);
								res.send(true);
								socket.emit('monitoring', itemNow.intConsignmentItemID, 2, itemNow.intCIConsignment, function(){
									console.log('updated sa consignor side')
								});
							});							
						}
					}
				});				
			})
		})
	}
	else{ // for bundle
		console.log('=======body bundle========')
		console.log(req.body);
		console.log('=======body bundle========')
		
		var soldQuery = `UPDATE tbl_sales_invoice_details SET intComission = ?, intPremium = ?, intSIDQty = ?, dblSIDBidPrice = ?, strAwardID = ?, booSIDType = 1 WHERE intSalesInvoiceDetailsID = ?;`
		var commission = parseFloat(req.body.bidPrice) * parseFloat(req.session.utilities.doubleCommission);
		db.query(soldQuery, [commission, req.body.buyersPremium, req.body.quantity, req.body.bidPrice, req.body.intBundleID, req.body.intSalesInvoiceDetailsID], function(err, results, field){
			if(err) return console.log(err);
			var selectBundleQuery = `SELECT * FROM tbl_bundle JOIN tbl_items_in_bundle ON intBundleID = strIIBBundleID JOIN tbl_consignment_item ON intConsignmentItemID = intIIBItemID WHERE intBundleID = ?;
									 UPDATE tbl_bundle SET booBundleStatus = 2 WHERE intBundleID = ?`
			db.query(selectBundleQuery, [req.body.intBundleID, req.body.intBundleID], (err, results, field) => {
				if(err) return console.log(err)
				console.log(results[0])
				
				if(results[0].length > 0){
					for(var i = 0; i < results[0].length; i++){
						var soldQuery = `UPDATE tbl_consignment_item SET booItemStatus = 2 WHERE strItemID = ?;
						SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
						db.query(soldQuery, [results[0][i].strItemID, results[0][i].strItemID], function (err, results, field){
							if(err) console.log(err);
							var itemNow = results[1][0]
							socket.emit('monitoring', itemNow.intConsignmentItemID, 2, itemNow.intCIConsignment, function(){
								console.log('updated sa consignor side')
							});
						});
					}//for loop
				}//results.length
			}) // selectBundleQuery
		})//soldQuery
	}
})

.post('/awards/sold/offline', authMiddleware.bidderNotLoggedIn, (req, res) => {
	console.log('========body=========')
	console.log(req.body)
	console.log(req.session.intSalesInvoiceID)
	if(req.body.hasOwnProperty('strItemID')){
		var soldQuery = `UPDATE tbl_sales_invoice_details SET intComission = ?, intPremium = ?, intSIDQty = ?, dblSIDBidPrice = ?, strAwardID = ?, booSIDType = 0 WHERE intSalesInvoiceDetailsID = ?;`
		var commission = parseFloat(req.body.bidPrice) * parseFloat(req.session.utilities.doubleCommission);
		db.query(soldQuery, [commission, req.body.buyersPremium, req.body.quantity, req.body.bidPrice, req.body.strItemID, req.body.intSalesInvoiceDetailsID], function(err, results, field){
			if(err) return console.log(err);
			console.log(results)
			res.send(true);
			
		})
	}
	else{
		var soldQuery = `UPDATE tbl_sales_invoice_details SET intComission = ?, intPremium = ?, intSIDQty = ?, dblSIDBidPrice = ?, strAwardID = ?, booSIDType = 1 WHERE intSalesInvoiceDetailsID = ?;`
		var commission = parseFloat(req.body.bidPrice) * parseFloat(req.session.utilities.doubleCommission);
		db.query(soldQuery, [commission, req.body.buyersPremium, req.body.quantity, req.body.bidPrice, req.body.intBundleID, req.body.intSalesInvoiceDetailsID], function(err, results, field){
			if(err) return console.log(err);
			console.log(results)
			res.send(true);
			
		})	
	}
})

router.post('/checkout', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var text = "";
	var possible = "0123456789";

	for (var i = 0; i < 10; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	var options = {
		url: 'https://pg-sandbox.paymaya.com/checkout/v1/checkouts',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic cGstQThhRXNwdGpaR1hhcjlBdDNaUEtIMERsVVpnZTVVS1hGcWxvZUdEdEFSbQ=',
		},
		body: `{
				"totalAmount": {
					"currency": "PHP",
					"value": "${req.session.utilities.intRegFee}.00",
					"details": {
					"subtotal": "${req.session.utilities.intRegFee}.00"
					}
				},

				"items": [
					{
					"name": "Auction Registration Fee",
					"description": "One-time payment only.",
					"quantity": "1",
					"amount": {
						"value": "${req.session.utilities.intRegFee}.00"
					},
					"totalAmount": {
						"value": "${req.session.utilities.intRegFee}.00"
					}
					}
				],
				"redirectUrl": {
					"success": "http://${req.hostname}:${req.port}/bid/getpayment/checkout",
					"failure": "http://www.askthemaya.com/failure?id=6319921",
					"cancel": "http://www.askthemaya.com/cancel?id=6319921"
				},
				"requestReferenceNumber": "APP-REF-${text}",
				"metadata": {}
				}`,
	}

	function callback(error, response, body){
		console.log(JSON.parse(body));
		req.session.checkoutId = JSON.parse(body).checkoutId;
		res.send({url: JSON.parse(body).redirectUrl})
	}
	
	request(options, callback);
})


.get('/getpayment/checkout', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var options = {
		url: `https://pg-sandbox.paymaya.com/checkout/v1/checkouts/${req.session.checkoutId}`,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic c2stYmk2YmRMRWZGZDFHSDZUNmJGMTl2dkkza1hjNWd2VERKV2JwREwzUVdlSw=',
		},
	}


	function callback(error, response, body) {
			console.log('=============================================WEHOW==============================================')
			console.log(JSON.parse(body));
			var payment = JSON.parse(body);
			if(payment.paymentStatus == 'PAYMENT_SUCCESS'){
				var paidQuery = `UPDATE tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID SET booStatus = 1, strBankReferenceNo = ? WHERE intBidderID = ?;`
				db.query(paidQuery, [payment.requestReferenceNumber, req.session.bidder.intBidderID], (err, results, field) => {
					if(err) return console.log(err);
					var loginQuery = `SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID =  intBABidderID WHERE intBidderID = ? AND booStatus != 2;`
					db.query(loginQuery, [req.session.bidder.intBidderID], function (err, results, field){
						if(err) return console.log(err);

					
							req.session.bidder = results[0];
							res.redirect('/bid');
							res.end();
						
					})
				})
			}
			else{
				res.redirect('/bid/profile?m=Jo7fA6796JNCXohs97s');
				res.end();
			}	
	}


	request(options, callback);
})


.post('/paymentregistration/online', authMiddleware.bidderNotLoggedIn, (req, res) => {
	console.log(req.body);

	var options = {
		url: 'https://pg-sandbox.paymaya.com/payments/v1/payment-tokens',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic cGstNnkyV1g2V2hXeGZRT2c4ZXpLSVV1aUp4YTdnQzRzRHZPaXBuOU5GWGx3eg=',
		},
		body: JSON.stringify(req.body.cardInfo), 
	}

	function callback2(error, response, body) {
			console.log(JSON.parse(body));
			req.session.paymentid = JSON.parse(body).id;
			res.send({url: JSON.parse(body).verificationUrl})
	}

	function callback(error, response, body) {
		var bodi = JSON.parse(body);
		var text = "";
              var possible = "0123456789";

              for (var i = 0; i < 10; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
		
		var options2 = {
			url: 'https://pg-sandbox.paymaya.com/payments/v1/payments',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic c2stQm9UbTcxb3FBMWpkQ2Q2YndMd3hLM1FzVlBvOVpPY3IxZHBZZnlBUFVVZA=',
			},
			body: `{
					"paymentTokenId": "${bodi.paymentTokenId}",
					"totalAmount": {
						"amount": ${req.session.utilities.intRegFee},
						"currency": "PHP"
					},
					"requestReferenceNumber": "APP-REF-${text}",
					"redirectUrl": {
						"success": "http://${req.hostname}:${req.port}/bid/getpayment",
						"failure": "http://${req.hostname}:${req.port}/bid/profile?m=Jo7fA6796JNCXohs97s",
						"cancel": "http://shop.someserver.com/cancel?id=6319921"
					}
					}`, 
		}


		request(options2, callback2);
	}

	request(options, callback);
})

.get('/getpayment/awards', authMiddleware.bidderNotLoggedIn, (req, res) => {

	var options = {
		url: `https://pg-sandbox.paymaya.com/payments/v1/payments/${req.session.paymentid}`,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic c2stQm9UbTcxb3FBMWpkQ2Q2YndMd3hLM1FzVlBvOVpPY3IxZHBZZnlBUFVVZA=',
		},
	}

	function callback(error, response, body) {
			console.log(JSON.parse(body));
			var payment = JSON.parse(body);
			if(payment.status == 'PAYMENT_SUCCESS'){
				var text = moment().format('MMDDYYYY');;
				var possible = "0123456789";

				for (var i = 0; i < 5; i++)
					text += possible.charAt(Math.floor(Math.random() * possible.length));
				var paidQuery = `UPDATE tbl_sales_invoice SET booSIStatus = ?, strBankReference = ?, intOrderID = ? WHERE intSalesInvoiceID = ?;
								 INSERT INTO tbl_si_status_history (datDateChange, Comment, booStatus, intSISHSalesInvoice) VALUES (now(), ?, 1, ?)`
				db.query(paidQuery, [1, payment.requestReferenceNumber, text, req.session.intSalesInvoiceID, 'Thank you for bidding! We are now processing your awards to be delivered.', req.session.intSalesInvoiceID], (err, results, field) => {
					if(err) return console.log(err);
					res.redirect('/bid/profile');
					res.end();
				})
			}
			else{
				res.redirect('/bid/profile?m=Jo7fA6796JNCXohs97s');
				res.end();
			}	
	}


	request(options, callback);

})

.get('/getpayment', authMiddleware.bidderNotLoggedIn, (req, res) => {
	if(req.session.bidder.booStatus == 1)
		return res.redirect('/bid')

	var options = {
		url: `https://pg-sandbox.paymaya.com/payments/v1/payments/${req.session.paymentid}`,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic c2stQm9UbTcxb3FBMWpkQ2Q2YndMd3hLM1FzVlBvOVpPY3IxZHBZZnlBUFVVZA=',
		},
	}

	function callback(error, response, body) {
			console.log(JSON.parse(body));
			var payment = JSON.parse(body);
			if(payment.status == 'PAYMENT_SUCCESS'){
				var paidQuery = `UPDATE tbl_bidder JOIN tbl_bidder_accounts ON intBidderID = intBABidderID SET booStatus = 1, strBankReferenceNo = ? WHERE intBidderID = ?;`
				db.query(paidQuery, [payment.requestReferenceNumber, req.session.bidder.intBidderID], (err, results, field) => {
					if(err) return console.log(err);
					var loginQuery = `SELECT * FROM tbl_bidder JOIN tbl_bidder_accounts ON intBidderID =  intBABidderID WHERE intBidderID = ? AND booStatus != 2;`
					db.query(loginQuery, [req.session.bidder.intBidderID], function (err, results, field){
						if(err) return console.log(err);

					
							req.session.bidder = results[0];
							res.redirect('/bid');
							res.end();
						
					})
				})
			}
			else{
				res.redirect('/bid/profile?m=Jo7fA6796JNCXohs97s');
				res.end();
			}	
	}


	request(options, callback);

})

router.post('/emailavailability', (req, res) => {//check if email is existing
		console.log(req.body)
		var emailQuery = `SELECT * FROM tbl_bidder WHERE strEmailAddress = ?`;
		db.query(emailQuery, [req.body.emailAddress], function (err, results, fields) {
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

router.post('/usernameavailability', (req, res) => {//Check if username is existing
	var usernameQuery = `SELECT * FROM tbl_bidder_accounts WHERE strUsername = ?`;
	db.query(usernameQuery, [req.body.userName], function (err, results, fields) {
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

router.post('/consignoravailability', (req, res) => {//Check if username is existing
	var consignorQuery = `SELECT * FROM tbl_consignor WHERE intConsignorID = ?`;
	console.log(req.body.consignorID)
	db.query(consignorQuery, [req.body.consignorID], function (err, results, fields) {
		if (err) return console.log(err);
		console.log(results)
		if(results.length > 0){
			console.log('ConID is Existing')
			res.send({ "consignorid": true });
		}
		else{
			console.log('ConID not existing')
			res.send({ "consignorid": false });
		}
	})
})


router.post('/register', upload.single('IDPicture'), (req, res) => {
	if(req.file){
		console.log(req.body)
		var body = req.body
		var name = body.midName != null ? body.firstName+' '+body.midName+' '+body.lastName : body.firstName+' '+body.lastName;
		var regQuery = `INSERT INTO tbl_bidder (strName, strAddress, strContact, strEmailAddress, strIDType, strIDNumber, intBidderConsignorID, strIDPicture, datDateRegistered) VALUES (?,?,?,?,?,?,?,?,?)`
		db.query(regQuery, [name, body.homeAddress, body.contactNumber, body.emailAddress, body.personalID, body.idNumber, body.consignorID, req.file.filename, new Date], function (err, results, fields){
			if(err) {
				if(err.errno == 1062){
					res.send({indicator: 'duplicate'})
				}
				console.log(err);
			}
			else{
				var insert = results.insertId;

				var credQuery = `INSERT INTO tbl_bidder_accounts (strUsername, strPassword, intBABidderID) VALUES (?,?,?);`
				db.query(credQuery, [body.userName, body.passWord, insert], function (err, results, fields){
					if(err) {
						if(err.errno == 1062){
							res.send({indicator: 'duplicate'})
							db.query(`DELETE FROM tbl_bidder WHERE intBidderID = ${insert}`, function (err, results, fields){
								if(err) console.log(err);
							})
						}
						console.log(err);
					}
	

					res.send({indicator: 'success'});
					res.end();

				});
			}
		})
	}
})

router.post('/replace/id', upload.single('strIDPicture'), (req, res) => {
	console.log('file' ,req.file);
	
	var idQuery = `UPDATE tbl_bidder SET strIDPicture = ? WHERE intBidderID = ?`
	db.query(idQuery, [req.file.filename, req.body.intBidderID], function (err, results, fields){
		if(err) return console.log(err);
		req.session.bidder.strIDPicture = req.file.filename;
		res.send({strIDPicture: req.file.filename});
		res.end();
	});
	

})

router.post('/edit/information', (req, res) => {
	console.log('body' ,req.body);
	var b = req.body
	
	var infoQuery = `UPDATE tbl_bidder SET strAddress = ?, strContact = ?, strEmailAddress = ?, strIDType = ?, strIDNumber = ? WHERE intBidderID = ?`
	db.query(infoQuery, [b.strAddress, b.strContact, b.strEmailAddress, b.strIDType, b.strIDNumber, req.session.bidder.intBidderID], function (err, results, fields){
		if(err) return console.log(err);
		req.session.bidder.strAddress = b.strAddress
		req.session.bidder.strContact = b.strContact
		req.session.bidder.strEmailAddress =  b.strEmailAddress
		req.session.bidder.strIDType = b.strIDType
		req.session.bidder.strIDNumber = b.strIDNumber
		res.send({indicator: 'success'});
		res.end();
	});
	

})

router.post('/bidhistory', (req, res) => {
	var bidhistoryQuery = `SELECT * FROM tbl_bidlist JOIN tbl_bidder_accounts ON intBABidderID = intBidlistBidderID WHERE intBidlistBidderID != 0 AND intBidlistCatalogID = ? ORDER BY datDateBid ASC`;
	db.query(bidhistoryQuery, [req.body.intCatalogID], (err, results, field) => {
		if(err) return console.log(err);
		if(results.length > 0){
			for(var i = 0; i < results.length; i++){
				results[i].datDateBid = moment(results[i].datDateBid).format('MMMM Do YYYY, h:mm:ss a')
				if(i == results.length -1){
					res.send({indicator: true, bidhistory: results});
					res.end();
				}
			}
		}
		else{
			res.send({indicator: false});
			res.end();
		}
	})
})







// Single Item
router.get('/item/:intCatalogID', authMiddleware.bidderNotLoggedIn, (req, res) => {

	req.io.on('connect', function(socket){
		console.log('connecting... '+ req.params.intCatalogID)
		socket.room = req.params.intCatalogID;
		socket.bidder = req.session.bidder
	});

	var itemQuery = `SELECT * FROM tbl_auction JOIN tbl_catalog ON intCatalogAuctionID = intAuctionID JOIN tbl_consignment_item ON strCatalogItemID = strItemID JOIN tbl_consignment_item_pictures ON intCIPConsignmentItemID = intConsignmentItemID JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID WHERE intCatalogID = ?`
	db.query(itemQuery, [req.params.intCatalogID], (err, results, field) => {
		if(err) return console.log(err);

		if(results[0].booAuctionStatus != 2){
			return res.redirect('/bid')
		}

		console.log(results)
		if(results.length > 0){
			
			var pics = []
			for(var i = 0; i < results.length; i++){
				pics.push(results[i].strPicture);
				if(i == results.length -1){
					console.log('======pics=====')
					console.log(pics)
					results[0].jsonOtherSpecifications = JSON.parse(results[0].jsonOtherSpecifications); 
					res.render('onlinebid/views/single', {item: results[0], bidder: req.session.bidder, auction: req.session.auction, hostname: req.hostname, pictures: pics, port: req.port});
				}
			}
		}
	});	
	
})

router.get('/bundle/:intCatalogID', authMiddleware.bidderNotLoggedIn, (req, res) => {

	req.io.on('connect', function(socket){
		console.log('connecting... '+ req.params.intCatalogID)
		socket.room = req.params.intCatalogID;
		socket.bidder = req.session.bidder
	});

	var itemQuery = `SELECT * FROM tbl_auction JOIN tbl_catalog ON intCatalogAuctionID = intAuctionID JOIN tbl_bundle ON strCatalogItemID = intBundleID JOIN tbl_items_in_bundle ON strIIBBundleID = intBundleID JOIN tbl_consignment_item ON intIIBItemID = intConsignmentItemID JOIN tbl_consignment_item_pictures ON intCIPConsignmentItemID = intConsignmentItemID JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID WHERE intCatalogID = ?`
	db.query(itemQuery, [req.params.intCatalogID], (err, results, field) => {
		if(err) return console.log(err);

		if(results[0].booAuctionStatus != 2){
			return res.redirect('/bid')
		}

		console.log('bundle', results)
		if(results.length > 0){

			
			
			var pics = []
			for(var i = 0; i < results.length; i++){
				pics.push(results[i].strPicture);
				results[i].jsonOtherSpecifications = JSON.parse(results[i].jsonOtherSpecifications); 
			}

			res.render('onlinebid/views/bundle', {item: results, bidder: req.session.bidder, auction: req.session.auction, hostname: req.hostname, pictures: pics});
		}
	});	
	
})

router.get('/address/get', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var addressQuery = `SELECT * FROM tbl_address_book WHERE intABBidderID = ?`
	db.query(addressQuery, [req.session.bidder.intBidderID], (err, results, field) => {
		if(err) return console.log(err);
		console.log('address get accessed')
		if(results.length > 0){
			res.send({address: results, indicator: true});
			res.end();
		}
	});
	
});

router.post('/address/add', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var b = req.body;
	var insertAddressQuery = `INSERT INTO tbl_address_book (strHouseAddress, strBarangay, strCity, strRegion, strPostcode, strFullname, strPhoneNumber, strOthernotes, intABBidderID) VALUES (?,?,?,?,?,?,?,?,?)`
	db.query(insertAddressQuery, [b.strHouseAddress, b.strBarangay, b.strCity, b.strRegion, b.strPostcode, b.strFullname, b.strPhoneNumber, b.strOthernotes, req.session.bidder.intBidderID], (err, results, field) => {
		if(err) return console.log(err);

		res.send({indicator: true, intAddressBookID: results.insertId});
		res.end();
	})
});

router.post('/address/edit', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var b = req.body;
	var insertAddressQuery = `UPDATE tbl_address_book SET strHouseAddress = ?, strBarangay = ?, strCity = ?, strRegion = ?, strPostcode = ?, strFullname = ?, strPhoneNumber = ?, strOthernotes = ? WHERE intAddressBookID = ?`
	db.query(insertAddressQuery, [b.strHouseAddress, b.strBarangay, b.strCity, b.strRegion, b.strPostcode, b.strFullname, b.strPhoneNumber, b.strOthernotes, b.intAddressBookID], (err, results, field) => {
		if(err) return console.log(err);

		res.send({indicator: true});
		res.end();
	})
});

router.post('/address/remove', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var b = req.body;
	var deleteAddressQuery = `DELETE FROM tbl_address_book WHERE intAddressBookID = ?`
	db.query(deleteAddressQuery, [b.intAddressBookID], (err, results, field) => {
		if(err) return console.log(err);

		res.send({indicator: true});
		res.end();
	})
});


router.post('/address/get/individual', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var addressQuery = `SELECT * FROM tbl_address_book WHERE intAddressBookID = ?`
	db.query(addressQuery, [req.body.intAddressBookID], (err, results, field) => {
		if(err) return console.log(err);
		console.log('address get accessed')
		if(results.length > 0){
			res.send({address: results[0], indicator: true});
			res.end();
		}
	});
});


router.post('/address/default', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var b = req.body;
	var defaultQuery = `UPDATE tbl_address_book SET booDefault = 0 WHERE intABBidderID = ?;`
	db.query(defaultQuery, [req.session.bidder.intBidderID], (err, results, field) => {
		if(err) return console.log(err);
		var defaulterQuery = `UPDATE tbl_address_book SET booDefault = 1 WHERE intAddressBookID = ?;`
		db.query(defaulterQuery, [b.intAddressBookID], (err, results, field) => {
			if(err) return console.log(err);
			res.send(true);
			res.end();
		});
	})
});

router.post('/checkout/awards', authMiddleware.bidderNotLoggedIn, (req, res) => {
		var b = req.body;
		res.render('onlinebid/views/award', {bidder: req.session.bidder, intSalesInvoiceID: b.intSalesInvoiceID ,utilities: req.session.utilities, port: req.port, hostname: req.hostname})
});

router.post('/checkout/items', authMiddleware.bidderNotLoggedIn, (req, res) => {
	var jsonAward = []
	var c = 0;
	function awardFunc(awards, i, callback){
		var award = awards[i];
		console.log('awardFunc access')
		console.log(award)
		if(award.strCatalogItemID.charAt(0) == 'B'){
			var awardQuery = `SELECT * FROM tbl_bundle WHERE intBundleID = ? AND booBundleStatus = 1`
			db.query(awardQuery, [award.strCatalogItemID], (err, results, fields) => {
				if(err) return console.log(err);
				console.log('----Bundle----')
				award.info = results[0]
				console.log(results);
				console.log('----Bundle----')
				if(results.length > 0){
					jsonAward.push(award);
					console.log('awards and I bun')
					console.log(awards.length, i)
					console.log(award)
					if(c == awards.length - 1){
						console.log('=========BundleAward=========')
						console.log(jsonAward)
						console.log('=========BundleAward=========')
						res.send({awards: jsonAward, indicator: true, utilities: req.session.utilities})
						res.end();
					}	
					c++;
				}
			})	
		} //- charAt B
		else if(award.strCatalogItemID.charAt(0) == 'I'){
			var awardQuery = `SELECT * FROM tbl_consignment_item JOIN tbl_consignment_item_pictures ON intCIPConsignmentItemID = intConsignmentItemID JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID WHERE strItemID = ? LIMIT 1`
			db.query(awardQuery, [award.strCatalogItemID], (err, results, fields) => {
				if(err) return console.log(err);
				console.log('----Single----')
				console.log(results);
				award.info = results[0]				
				console.log('----Single----')
				if(results.length > 0){
					jsonAward.push(award);
					console.log('awards and I, single')
					console.log(awards.length, i)
					if(c == awards.length - 1){
						console.log('=========SingleAward=========')
						console.log(jsonAward)
						console.log('=========SingleAward=========')
						res.send({awards: jsonAward, indicator: true, utilities: req.session.utilities})
						res.end();						
					}
					c++
				}
			})
		} //- charAt Item
	}
	var b = req.body;
	var salesQuery = `SELECT * FROM tbl_sales_invoice 
	JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID 
	JOIN tbl_bidlist ON intBidlistID = intRDBidlistID 
	JOIN tbl_catalog ON intCatalogID = intBidlistCatalogID 
	WHERE intSalesInvoiceID = ?`
	db.query(salesQuery, [b.intSalesInvoiceID], (err, results, field) => {
		if(err) return console.log(err);
		console.log('----AWARDS----')
		console.log(results);
		console.log('----AWARDS----')
		var awards = results;
		if(awards.length > 0){
			for(var i = 0; i < awards.length; i++){
				awardFunc(awards, i);
			}
		}
		else{
			res.redirect('/bid')
		}
	})
});

router.post('/awards', authMiddleware.bidderNotLoggedIn,  (req, res) => {
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

router.post('/ban', (req, res) => {
	var banQuery = `UPDATE tbl_bidder_accounts SET booStatus = 3 WHERE intBABidderID = ?;
					UPDATE tbl_sales_invoice SET booSIStatus = 4 WHERE booSIStatus = 0 AND intSIAuctionID = ?;`
	db.query(banQuery, [req.session.bidder.intBidderID, req.body.intAuctionID], function(err, results, field){
		if(err) return console.log(err);
		var onlineQuery = `UPDATE tbl_bidder SET booOnline = 0 WHERE intBidderID = ?`;
		db.query(onlineQuery, [req.session.bidder.intBidderID], (err, resulta, field) => {
			delete req.session.bidder;
		})

		var balikQuery = `SELECT * FROM tbl_sales_invoice JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID WHERE booSISStatus = 4 AND intSIAuctionID = ?`
		db.query(balikQuery, [req.body.intAuctionID], (err, results, field) => {
			if(err) console.log (err);
			
			
			for(var v = 0; v < results.length; v++){
				var updateItemStatus = `SELECT * FROM tbl_bidlist JOIN tbl_catalog ON intCatalogID = intBidlistCatalogID WHERE intBidlistID = ?`
				db.query(updateItemStatus, [results[v].intRDBidlistID], (err, results, field) => {
					if(err) return console.log(err);
					if(results.length > 0){
						for(var i = 0; i < results.length; i++){
							var catalogID = results[i].strCatalogItemID;
							if(results[i].strCatalogItemID.charAt(0) == 'B'){
								var updateBundleQuery = `UPDATE tbl_bundle SET booBundleStatus = 0 WHERE intBundleID = ?`
								db.query(updateBundleQuery, [catalogID], (err, resulta, field) => {
									if(err) return console.log(err);
									var insideQuery = `SELECT * FROM tbl_bundle JOIN tbl_items_in_bundle ON strIIBBundleID = intBundleID WHERE intBundleID = ?`
									db.query(insideQuery, [catalogID], (err, resulta, field) => {
										if(err) return console.log(err);
										
										if(resulta.length > 0){
											for(var x = 0; x < resulta.length; x++){
												var itemID = resulta[x].intIIBItemID;
												var lastBundleQuery = `UPDATE tbl_consignment_item SET intTimesInAuction = intTimesInAuction + 1 WHERE intConsignmentItemID = ?;`
												db.query(lastBundleQuery, [itemID], (err, resulta, field) => {
													if(err) return console.log(err);

													var firstQuery = `SELECT * FROM tbl_consignment_item WHERE intConsignmentItemID = ?`
													db.query(firstQuery, [itemID], (err, results, field) => {
														if(err) console.log(err);
														
														if(results.length > 0){
															var item = results[0];
															var utilQuery = `SELECT * FROM tbl_utilities`
															db.query(utilQuery, (err, results, field) => {
																if(err) return console.log(err);
																if(results.length > 0){
																	req.session.utilities = results[0]
																	if(item.intTimesInAuction >= req.session.utilities.intTimesInAuctionMax){
																		var pullOutQuery = `UPDATE tbl_consignment_item SET booItemStatus = 3 WHERE intConsignmentItemID = ?`
																		db.query(pullOutQuery, [itemID], (err, results, field) => {
																			if(err) return console.log(err);
																			socket.emit('monitoring', item.intConsignmentItemID, 3, item.intCIConsignment, function(){
																				console.log('updated sa consignor side')
																			});
																		})
																	}
																}
															});
															
														}
													}) 
												});
												
												if(x == resulta.length - 1){

													var buwagQuery = `SELECT Count(*) as counter
																	FROM tbl_consignment_item 
																	JOIN tbl_items_in_bundle 
																		ON intConsignmentItemID = intIIBItemID 
																	WHERE strIIBBundleID = ? 
																		AND (booItemStatus = 0 OR booItemStatus = 1);`
													db.query(buwagQuery, [catalogID], (err, results, field) => {
														if(err) console.log(err);
														if(results[0].counter <= 1){
															var updateBundleQuery = `UPDATE tbl_consignment_item JOIN tbl_items_in_bundle ON intConsignmentItemID = intIIBItemID SET booIsBundled = 0 WHERE strIIBBundleID = ?`
															db.query(updateBundleQuery, [catalogID], (err, results, fields) => {
																if(err) return console.log(err);
																var deleteBundleQuery = `DELETE FROM tbl_bundle WHERE intBundleID = ?;`
																db.query(deleteBundleQuery, [catalogID], (err, results, field) =>{
																	if(err) console.log(err);
																	console.log('Item updated (bundle0)')
																	
																})
															})
														}
													})
													
												}
											} //- Foor Loop Resulta
										} // -Resulta

									}); //- Inside Query
								}); //-update Bundle Query							
							} //- charAt B
							else if(results[i].strCatalogItemID.charAt(0) == 'I'){
								var insideItemQuery = `UPDATE tbl_consignment_item SET booItemStatus = 0, intTimesInAuction = intTimesInAuction + 1 WHERE strItemID = ?;
								SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
								db.query(insideItemQuery, [catalogID, catalogID], (err, results, field) => {
									if(err) return console.log(err);
									var itemNowFirst = results[1][0];
									socket.emit('monitoring', itemNowFirst.intConsignmentItemID, 0, itemNowFirst.intCIConsignment, function(){
										console.log('updated sa consignor side')
									});
									var selectQuery = `SELECT * FROM tbl_consignment_item WHERE intTimesInAuction >= ? AND strItemID = ?;`;
									db.query(selectQuery, [req.session.utilities.intTimesInAuctionMax, catalogID], (err, results, field) => {
										if(err) return console.log(err);
										if(results.length > 0){
											var pullOutQuery = `UPDATE tbl_consignment_item SET booItemStatus = 3 WHERE strItemID = ?;
											SELECT * FROM tbl_consignment_item WHERE strItemID = ?`
											db.query(pullOutQuery, [catalogID, catalogID], (err, results, field) => {
												if(err) console.log(err);
												
												var itemNow = results[1][0];
												console.log('Item updated (single0)')
												socket.emit('monitoring', itemNow.intConsignmentItemID, 3, itemNow.intCIConsignment, function(){
													console.log('updated sa consignor side')
												});
											})
										}
									})
								}); //- Inside Item Query
							} //- charAt Item
						}//- For Loop
					} //- If statement results.length
					

				});	//- Update Status Query

				if(v == results.length - 1){
					res.redirect('/bid')					
				}
			}
		})
		
	})
})

router.post('/receipt', authMiddleware.bidderNotLoggedIn, (req,res) => {
	var receiptQuery = `SELECT * FROM tbl_sales_invoice WHERE intSalesInvoiceID = ? AND booSIStatus != 0`
	db.query(receiptQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
		if(err) return console.log(err)
		if(results.length > 0)
			res.render('onlinebid/views/receipt', {dataRes: results[0], bidder: req.session.bidder, intSalesInvoiceID: req.body.intSalesInvoiceID ,utilities: req.session.utilities});
		else
			res.redirect('/bid/profile')
	})
})

router.post('/status', authMiddleware.bidderNotLoggedIn, (req,res) => {
	var statusQuery = `SELECT * FROM tbl_si_status_history WHERE intSISHSalesInvoice = ? ORDER BY datDateChange DESC`
	db.query(statusQuery, [req.body.intSalesInvoiceID], (err, results, field) => {
		if(err) return console.log(err)
		if(results.length > 0){
			for(var i = 0; i < results.length; i++){
				results[i].datDateChange = moment(results[i].datDateChange).format('MMMM Do YYYY, h:mm:ss a');
				if(i == results.length - 1){
					res.send({indicator: true, statuses: results});
				}
			}
		}
		
	})
})

router.post('/awarded', (req, res) => {
	var jsonAward = []
	var c = 0;
	function awardFunc(awards, i, callback){
		var award = awards[i];
		console.log('awardFunc access')
		console.log(award)
		if(award.strCatalogItemID.charAt(0) == 'B'){
			var awardQuery = `SELECT * FROM tbl_bundle WHERE intBundleID = ? AND booBundleStatus = 1`
			db.query(awardQuery, [award.strCatalogItemID], (err, results, fields) => {
				if(err) return console.log(err);
				console.log('----Bundle----')
				console.log(results);
				award.info = results[0]
				console.log('----Bundle----')
				if(results.length > 0){
					jsonAward.push(award);
					console.log('awards and I bun')
					console.log(awards.length, i)
					if(c == awards.length - 1){
						console.log('=========BundleAward=========')
						console.log(jsonAward)
						console.log('=========BundleAward=========')
						res.send({awards: jsonAward, indicator: true, utilities: req.session.utilities})
						res.end();
					}	
					c++;
				}
			})	
		} //- charAt B
		else if(award.strCatalogItemID.charAt(0) == 'I'){
			var awardQuery = `SELECT * FROM tbl_consignment_item JOIN tbl_consignment_item_pictures ON intCIPConsignmentItemID = intConsignmentItemID JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID WHERE strItemID = ?LIMIT 1`
			db.query(awardQuery, [award.strCatalogItemID], (err, results, fields) => {
				if(err) return console.log(err);
				console.log('----Single----')
				console.log(results);
				award.info = results[0]				
				console.log('----Single----')
				if(results.length > 0){
					jsonAward.push(award);
					console.log('awards and I, single')
					console.log(awards.length, i)
					if(c == awards.length - 1){
						console.log('=========SingleAward=========')
						console.log(jsonAward)
						console.log('=========SingleAward=========')
						res.send({awards: jsonAward, indicator: true, utilities: req.session.utilities})
						res.end();						
					}
					c++
				}
			})
		} //- charAt Item
	}
	var b = req.body;
	var salesQuery = `SELECT * FROM tbl_sales_invoice 
	JOIN tbl_sales_invoice_details ON intSalesInvoiceID = intSIDSalesInvoiceID 
	JOIN tbl_bidlist ON intBidlistID = intRDBidlistID 
	JOIN tbl_catalog ON intCatalogID = intBidlistCatalogID 
	WHERE intSalesInvoiceID = ?`
	db.query(salesQuery, [b.intSalesInvoiceID], (err, results, field) => {
		if(err) return console.log(err);
		console.log('----AWARDS----')
		console.log(results);
		console.log('----AWARDS----')
		var awards = results;
		if(awards.length > 0){
			for(var i = 0; i < awards.length; i++){
				awardFunc(awards, i);
			}
		}
		else{
			res.redirect('/')
		}
	})
});

router.get('/regprint',authMiddleware.bidderNotLoggedIn, getSession, (req, res) => {
	res.render('onlinebid/views/regprint', {session: req.session});
})

router.post('/registration/upload', upload.single('strReferencePicture'), (req, res) => {
	var paymentQuery = 'UPDATE tbl_bidder SET strBankReferenceNo = ?, strReferencePicture = ? WHERE intBidderID = ?'
	db.query(paymentQuery, [req.body.strBankReference, req.body.strReferencePicture, req.session.bidder.intBidderID], (err, results, field) => {
		if(err) console.log(err);

		

		res.redirect('/bid/profile');
	})
})

router.post('/payment/upload', (req, res) => {
	var paymentQuery = 'UPDATE tbl_sales_invoice SET strBankReference = ? WHERE intSalesInvoiceID = ?'
	db.query(paymentQuery, [req.body.strBankReference, req.body.intSalesInvoiceID], (err, results, field) => {
		if(err) console.log(err);
		
		
		res.redirect('/bid/profile');
	})
})



router.get('/logout', (req, res) => {
    var onlineQuery = `UPDATE tbl_bidder SET booOnline = 0 WHERE intBidderID = ?`;
    db.query(onlineQuery, [req.session.bidder.intBidderID], (err, resulta, field) => {
		if(err) console.log(err)
		delete req.session.bidder;
        res.redirect('/bid');
    })
})

router.post('/query/idtypes', (req, res) => {
	db.query('SELECT * FROM tbl_id_types WHERE booStatus = 0', (err, results, fields) => {
		if(err) console.log(err)

		console.log(results)
		res.send({ids:results})
	})
})
router.get('/catalog/:intAuctionID', (req, res) => {
	var catQuery = `SELECT * FROM tbl_auction JOIN tbl_catalog ON intAuctionID = intCatalogAuctionID JOIN tbl_consignment_item ON strCatalogItemID = strItemID JOIN tbl_consignment_item_pictures ON intCIPConsignmentItemID = intConsignmentItemID JOIN tbl_color ON intColorConsignmentItemID = intConsignmentItemID WHERE intCatalogAuctionID = ? GROUP BY strCatalogItemID`
	db.query(catQuery, [req.params.intAuctionID], function (err, results, field){
		if(err){
			console.log(err);
			console.log('=============')
			res.redirect('/bid')			
		}
		var items = results;
		
		if(results.length > 0){
			for(var i = 0; i < items.length; i++){
				items[i].jsonDuration = JSON.parse(items[i].jsonDuration);
				var dateStart = moment(items[i].datDateStart).format('MM/DD/YYYY') + ' ' + items[i].jsonDuration.startingTime;
				items[i].datDateEnd = moment(dateStart).add(items[i].jsonDuration.days, 'd').add(items[i].jsonDuration.hours, 'h').add(items[i].jsonDuration.minutes, 'm').format('MM/DD/YYYY HH:mm:ss');

				items[i].datDateStart = moment(items[i].datDateStart).format('MMMM Do YYYY, h:mm:ss a');
				items[i].datDateEnd = moment(items[i].datDateEnd).format('MMMM Do YYYY, h:mm:ss a')
				items[i].jsonOtherSpecifications = JSON.parse(items[i].jsonOtherSpecifications)
				if(i == items.length - 1){
					var bunQuery = `SELECT * FROM tbl_catalog  JOIN tbl_bundle ON strCatalogItemID = intBundleID WHERE intCatalogAuctionID = ?`
					db.query(bunQuery, [req.params.intAuctionID], function (err, results, field){
						if (err){
							console.log(err);
							console.log('--------------')
							res.redirect('/bid')
						}

						if(results){
							var bundles = results
							console.log('--------')
							console.log(results)
							console.log('=======')
							console.log(items);
							res.render('onlinebid/views/pdfcatalog',  {bundles: bundles, items: items});
							
						}
						else{
							console.log(items);
							res.render('onlinebid/views/pdfcatalog',  {items: items});
						}
					})
				}
			}
		}
		else{
			res.redirect('/bid');
		}
		
	});
})


exports.bid = router
