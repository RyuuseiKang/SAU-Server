const axios = require("axios");

var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);

module.exports = (app) => {
	const router = require('express').Router();
	const application = app;

    router.get('/post', async (req, res) => {
        
    });

	return router;
}