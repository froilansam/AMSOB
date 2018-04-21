var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
	res.render('management/views/index')
});

router.get('/consignment', (req, res) => {
	res.render('management/views/consignment')
});

exports.index = router