const axios = require("axios");
const crypto = require("crypto");
var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);

module.exports = (app) => {
	const router = require('express').Router();
	const application = app;

    var ResponseBody;

    router.get('/registration', async (req, res) => {
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
        var sql = "registrationBook('" + hash + "', '" + req.query.isbn + "', '" + req.query.title + "', '" + req.query.price + "')";    
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

	return router;
}