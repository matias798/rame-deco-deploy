var express = require('express');
var router = express.Router();
let productsContoller= require('../controller/productsController')
/* GET home page. */
router.get('/', productsContoller.index);
router.get('/search', productsContoller.search);
module.exports = router;
