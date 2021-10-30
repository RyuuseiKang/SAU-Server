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

        var sql = "select chat.token, chat.timestamp, chat.contents, user.name, major.name as major, user.profileImage, user.id as uid from chat left join user ON user.token=chat.user_token left join major ON major.code=user.major where post_token = '" + post_token + "' order by timestamp;";
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
        });
    });

    router.delete('/', async (req, res) => {
        var chat_token = req.query.token;
        var user_token = req.query.userToken;

        jwt.verify(user_token, jwtSecret, function (err, decoded) {
            if (err) {
                res.send({
                    isError: true,
                });
                return;

            }

            var sql = "delete from chat where user_token='" + decoded.user_token + "' and token='" + chat_token + "';";
            console.log(sql);
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
    })

    return router;
}