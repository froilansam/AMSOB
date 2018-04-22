var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
	res.render('management/views/index')
});

router.get('/consignment', (req, res) => {
	res.render('management/views/consignment')
});


//Router for 404 Page
router.get('*', (req, res) => {
	console.log('404 Page')
	res.status(404).render('management/views/404');
})
router.get('/auction', (req, res) => {
	res.render('management/views/auctionSchedule')
});

exports.index = router