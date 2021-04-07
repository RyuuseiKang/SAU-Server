const axios = require("axios");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

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
			res.send(decoded);
		})
    });

	return router;
}