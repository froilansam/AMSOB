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
    res.render('consignor/views/login')
});


exports.consignorportal = router