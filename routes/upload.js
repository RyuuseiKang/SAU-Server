const axios = require("axios");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const fs = require('fs')
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
    limits: { fileSize: 20 * 1000 * 1000 } // 바이러스때문에 크기를 설정해주는 것이 좋다.
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
        try{
            const newFile = getHash() + '.jpg';
            sharp('./' + req.file.path)	// 리사이징할 파일의 경로
                .resize({width:640})	// 원본 비율 유지하면서 width 크기만 설정
                .withMetadata()
                .toFile('./images/' + newFile, (err, info)=>{
                    if(err) throw err               
                    console.log(`info : ${info}`)
                    info.filename = newFile;
                    res.send(info);
                    fs.unlink('./' + req.file.path, (err)=>{	
                    // 원본파일은 삭제해줍니다
                    // 원본파일을 삭제하지 않을거면 생략해줍니다
                      if(err) throw err				            
          
                    })                  
                })
          }catch(err){
              console.log(err)
              res.send(err);
          }
    });

    return router;
}