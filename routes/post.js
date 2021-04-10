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
		var book_token = req.query.bookToken;
		var isSell = req.query.isSell;
		var description = req.query.description;
		var major = req.query.major;
		var price = req.query.price;
		var image_token = 'null';
		image_token = req.query.imageToken;
		jwt.verify(user_token, 'SeCrEtKeYfOrHaShInG',
		function(err, decoded) {
			var current_date = (new Date()).valueOf().toString();
			var random = Math.random().toString();
			var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
			
			var sql = "select posting('" + hash + "', '" + decoded.user_token + "', '" + book_token + "', '" + isSell + "', '" + description + "', " + major + ", " + price + ", '" + image_token + "';";
			conn.query(sql, function(err, rows, fields) {
				if(err) console.log('query is not excuted. select fail...\n +' + err);
				else {
					res.send({
						postToken: hash,
					});
				}
			});

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