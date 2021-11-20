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

	router.post('/', async (req, res) => {
		var user_token = req.query.token;
		var book_token = req.query.bookToken;
		var isSell = req.query.isSell;
		var description = req.query.description;
		var major = req.query.major;
		var price = req.query.price;
		var imageUri = 'null';
		imageUri = req.query.imageUri;
		jwt.verify(user_token, jwtSecret,
			function (err, decoded) {
				if (err) {
					res.send({
						isError: true,
					})
					return;
				}
				var current_date = (new Date()).valueOf().toString();
				var random = Math.random().toString();
				var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

				var sql = "select posting('" + hash + "', '" + decoded.user_token + "', '" + book_token + "', " + isSell + ", '" + description + "', '" + major + "', '" + price + "', '" + imageUri + "');";
				conn.query(sql, function (err, rows, fields) {
					if (err) {
						console.log('query is not excuted. select fail...\n' + err);
						res.send({
							isError: true,
						});
					} else {
						res.send({
							postToken: hash,
						});
					}
				});

			})
	});

	router.delete('/', async (req, res) => {
		var user_token = req.query.userToken;
		var post_token = req.query.token;

		jwt.verify(user_token, jwtSecret,
			function (err, decoded) {
				if (err) {
					console.log('tokenError');
					res.send({
						isRemove: false
					});
					return;
				}
				var sql = "select removePost('" + post_token + "', '" + decoded.user_token + "');"
				conn.query(sql, function (err, rows, fields) {
					if (err) {
						console.log('query is not excuted. select fail...\n' + err);
						res.send({
							isRemove: false
						});
					} else {
						res.send({
							isRemove: true
						});
					}
				})
			});
	});

	router.put('/', async (req, res) => {
		var user_token = req.query.userToken;
		var post_token = req.query.token;
		var description = req.query.description;
		var price = req.query.price;
		var imageUri = req.query.imageUri;
		var isSell = req.query.isSell;
		var isComplete = req.query.isComplete;

		jwt.verify(user_token, jwtSecret,
			function (err, decoded) {
				if (err) {
					res.send({
						isRemove: false
					});
					return;
				}
				var sql = "update post set isComplete=" + isComplete + " description='" + description + "', imageUri='" + imageUri + "', price='" + price + "', isSell=" + isSell + " where user_token='" + decoded.user_token + "' and token='" + post_token + "'";
				conn.query(sql, function (err, rows, fields) {
					if (err) {
						console.log('query is not excuted. update fail...\n' + err);
						res.send({
							isRemove: false
						});
					} else {
						res.send({
							isRemove: true
						});
					}
				})
			});

	});

	router.get('/', async (req, res) => {
		var token = req.query.token;
		var user_token = req.query.userToken;
		var ResponseBody;

		if (user_token != undefined) {
			jwt.verify(user_token, jwtSecret,
				function (err, decoded) {
					if (err) {
						var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp, post.isComplete, (false) AS isMyPost FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token WHERE post.token='" + token + "';"
						conn.query(sql, function (err, rows, fields) {
							if (err) {
								console.log('query is not excuted. select fail...\n' + err);
								ResponseBody = { isError: true };
							} else {
								res.send(rows);
							}
						});
						return;
					}

					var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp, post.isComplete, IF(user_token='" + decoded.user_token + "', true , false) AS isMyPost FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token WHERE post.token='" + token + "';"
					conn.query(sql, function (err, rows, fields) {
						if (err) {
							console.log('query is not excuted. select fail...\n' + err);
							ResponseBody = { isError: true };
							res.send(ResponseBody);
						} else {
							res.send(rows);
						}
					});
				});
		} else {
			var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp, post.isComplete, (false) AS isMyPost FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token WHERE post.token='" + token + "';"
			conn.query(sql, function (err, rows, fields) {
				if (err) {
					console.log('query is not excuted. select fail...\n' + err);
					ResponseBody = { isError: true };
				} else {
					res.send(rows);
				}
			});
		}

	})

	router.get('/live', async (req, res) => {
		var ResponseBody;
		var page = 1;
		page = req.query.page;
		var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp, post.isComplete FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token WHERE post.isComplete is false ORDER BY timestamp DESC limit " + (page - 1) * 10 + ", 10;";

		conn.query(sql, function (err, rows, fields) {
			if (err) {
				console.log('query is not excuted. select fail...\n' + err);
				ResponseBody = { isError: true };
			} else {
				res.send(rows);
			}
		})
	})

	router.get('/search', async (req, res) => {
		var ResponseBody;
		var type = req.query.type;

		if (type == 'token') {
			var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token WHERE book_token='" + req.query.token + "' ORDER BY timestamp DESC";
		} else {
			var sql = "SELECT post.token, user.name as name, book.title, major.name as major, post.isSell, post.price, post.description, post.imageUri, post.timestamp FROM post LEFT JOIN user ON post.user_token = user.token LEFT JOIN major ON user.major = major.code LEFT JOIN book ON post.book_token=book.token ORDER BY timestamp DESC";
		}

		conn.query(sql, function (err, rows, fields) {
			if (err) {
				console.log('query is not excuted. select fail...\n' + err);
				ResponseBody = { isError: true };
			} else {
				res.send(rows);
			}
		})
	})

	return router;
}
