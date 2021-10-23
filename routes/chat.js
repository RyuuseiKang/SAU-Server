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
        var post_token = req.query.postToken;
        var contents = req.query.contents;

        jwt.verify(user_token, jwtSecret, function (err, decoded) {
            if (err) {
                res.send({
                    isError: true,
                });
                return;

            }
            var current_date = (new Date()).valueOf().toString();
            var random = Math.random().toString();
            var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

            var sql = "select chat('" + hash + "', '" + decoded.user_token + "', '" + post_token + "', '" + contents + "');";
            conn.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.send({
                        isError: true,
                    });
                } else {
                    res.send({
                        chatToken: hash,
                    });
                }
            });
        });
    });

    router.get('/', async (req, res) => {
        var post_token = req.query.postToken;

        var sql = "select * from chat where post_token = '" + post_token + "';";
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.send({
                    isError: true,
                });
            } else {
                res.send({
                    chat: rows,
                });
            }
        }
    })

    return router;
}