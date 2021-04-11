const axios = require("axios");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        // cb는 callback, cb대신 원하는 function 이름을 넣어도 된다. ex) done
        destination(req, file, cb) {
            cb(null, './images/');
        },
        filename(req, file, cb) {
            cb(null, getHash() + '.jpg');
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 } // 바이러스때문에 크기를 설정해주는 것이 좋다.
});

function getHash() {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
}

module.exports = (app) => {
    const router = require('express').Router();
    const application = app;

    router.post('/img', upload.single('attachment'),(req,res) => {
        res.json(req.file);
        console.log(req.file);
        
        res.send({
            isError: false
        });
    });

    return router;
}