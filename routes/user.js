const axios = require("axios");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);
const jwtSecret = process.env.JWT_SECRET;

module.exports = (app) => {
	const router = require('express').Router();
	const application = app;

	router.get('/me', async (req, res) => {
		var user_token = req.query.userToken;
		var ResponseBody;

		jwt.verify(user_token, jwtSecret,
			function (err, decoded) {
				console.log(err);
				if (err) {
					res.send({
						isError: true,
						decodedError: true
					});
					return;
				}
				var sql = "SELECT u.id, u.name, u.profileImage, m.name as major FROM user AS u LEFT JOIN major AS m ON u.major=m.code WHERE token='" + decoded.user_token + "';"
				conn.query(sql, function (err, rows, fields) {
					if (err) {
						console.log('query is not excuted. select fail...\n' + err);
						res.send({
							isError: true
						});
					} else {
						res.send(rows);
					}
				})
			});

	})

	router.get('/myposts', async (req, res) => {
		var user_token = req.query.userToken;
		var ResponseBody;
        var page = req.query.page ? req.query.page : 1;
        
		jwt.verify(user_token, jwtSecret,
			function (err, decoded) {
				console.log(err);
				if (err) {
					res.send({
						isError: true,
						decodedError: true
					});
					return;
				}
                var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token WHERE user_token='" + decoded.user_token +"' ORDER BY timestamp DESC limit " + (page - 1) * 10 + ", 10;";
                
                conn.query(sql, function (err, rows, fields) {
					if (err) {
						console.log('query is not excuted. select fail...\n' + err);
						res.send({
							isError: true
						});
					} else {
						res.send(rows);
					}
				})
			});
	})

	return router;
}