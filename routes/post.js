const axios = require("axios");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);


var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);

module.exports = (app) => {
	const router = require('express').Router();
	const application = app;

    router.get('/write', async (req, res) => {
        var user_token = req.query.token;
		jwt.verify(user_token, 'SeCrEtKeYfOrHaShInG',
		function(err, decoded) {
			res.send(decoded.user_token);
		})
    });

	router.get('/view', async (req, res) => {
		var token = req.query.token;
		var ResponseBody;

		var sql = "SELECT * FROM post WHERE token='" + token + "';";

		conn.query(sql, function (err, rows, fields) {
			if(err) {
				console.log('query is not excuted. select faill...\n' + err);
				ResponseBody = {isError: true};
			} else {
				res.send(rows);
			}
		})
	})

	return router;
}