var express = require('express');
var db = require("../db");
var router = express.Router();

router.get('/:from/:to/:text', function (req, res) {
	res.header("Content-Type", "application/json; charset=utf-8");
	var from = req.params.from;
	var to = req.params.to;
	var text = req.params.text;
	db.translate(text,from,to,function(data) {
		res.send(data);
	});
});
module.exports = router;
