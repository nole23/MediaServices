const express = require('express');
var fs = require('fs');
const router = express.Router();
const multer = require('multer');
var io = require('socket.io-client');
var socket = io.connect('https://twoway-usersservice.herokuapp.com', {reconnect: true});
// socket.connect();

var Auth = require('../meddlewares/auth.js');

const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        // console.log(file)
        var name = file.originalname.split('.');
        cb(null, './public/' + name[0] + '/')
    },
    filename: function (req, file, cb) {
        
        var name = file.originalname.split('.');
        cb(null, name[1] + '_' + name[2] + '.jpg')
    },
    onFileUploadStart: function(file) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            return true;
        } else {
            return false;
        }
    }
})

var upload = multer({ storage: storage });

router
    .get('/', function(req, res) {
        return res.status(200).send({message: 'radi'})
    })
    /**
     * Get all images by user id
     * return 200 - Return list link images
     * return 404 - Id user is not corect
     * return 500 - List null
     */
    .get('/:id_user', async function(req, res) {
        var username = req.params.id_user;
        const testFolder = './public/' + username + '/';

        fs.readdir(testFolder, (err, files) => {
            var listImage = [];
            files.forEach(file => {
                var link = 'https://twoway-mediaservice.herokuapp.com/static/' + username + '/' + file;
                listImage.push({image: link})
            });
            console.log(listImage);
            return res.status(200).send({images: listImage});
        });
        
    })
    /**
     * Funkcia koja cuva sliku
     * upload.single('file'),
     */
    .post('/:id', upload.single('file'), function(req, res) {
        //console.log(req.params.id)
        var name =req.params.id.split('.');
        var token = req.body.token || req.query.token || req.headers['authorization'];
        try {
            // const upload = await firebase.uploadImage(req.file.path, 'public/'+req.file.filename );
            //console.log(upload)
            // socket.emit("/" + name[0], "003021");
            var item = {
                token: token,
                urlImage: 'https://twoway-mediaservice.herokuapp.com/static/' + name[0] + '/' +  name[1] + '_' + name[2] + '.jpg'
            }
            socket.emit('serverEvent', item);
            return res.send({succes: false, message: 'save'});
        } catch (err) {
            // console.log(err);
            return res.send({succes: false, message: 'no save'});
        }
    })
    

module.exports = router;