const axios = require("axios");
const crypto = require("crypto");
var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);

module.exports = (app) => {
	const router = require('express').Router();
	const application = app;

    router.get('/registration', async (req, res) => {
        var ResponseBody;
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
        var sql = "registrationBook('" + hash + "', '" + req.query.isbn + "', '" + req.query.title + "', '" + req.query.price + "')";    
        console.log(sql);
        conn.query("select " + sql + ";", function (err, rows, fields) {
            if(err) {
                console.log('query is not excuted. select fail...\n' + err);
                ResponseBody = {isError: true};
            }
            else {
                ResponseBody = {isError: false};
            }
        });

        res.send(ResponseBody);
    });

    router.get('/search', async (req, res) => {
        var ResponseBody;

        switch (req.query.type) {
            case 'isbn':
                var sql = "SELECT token FROM book WHERE isbn='" + req.query.isbn + "';";
                break;
            case 'title':
                var sql = "SELECT token FROM book WHERE title LIKE '" + req.query.title + "';";
                break;
        
            default:
                var sql = "SELECT * FROM book WHERE token='" + req.query.token + "';";
                break;
        }
            
        conn.query(sql, function (err, rows, fields) {
            if(err) {
                console.log('query is not excuted. select fail...\n' + err);
                ResponseBody = {isError: true};
            } else {
                console.log(rows);
                rowDataPacket = rows.toString();
                ResponseBody = Object.values(JSON.parse(JSON.stringify(rows)));

                res.send(ResponseBody);
            }
        });

        res.send(ResponseBody);
    })

	return router;
}