const express = require('express');
var fs = require('fs');
const router = express.Router();
const multer = require('multer');
var io = require('socket.io-client');
const http = require("http");
var https = require('https');
const mediaImpl = require('../servicesImpl/mediaImpl.js');

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
        var _id = req.params.id_user;
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
            path: '/api/sync/',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin':'*',
                'Content-Type': 'application/json',
                'authorization': token,
                'Content-Length': Buffer.byteLength(data)
            }
          };
        var httpreq = https.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var data = await mediaImpl.getPictureById(JSON.parse(chunk), _id, 20, 0)
                return res.status(data.status).send({imageLink: data.listImage})
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    .put('/like', async function(req, res) {
        var body = req.body;
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
            path: '/api/sync/',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin':'*',
                'Content-Type': 'application/json',
                'authorization': token,
                'Content-Length': Buffer.byteLength(data)
            }
          };
        var httpreq = https.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var data = await mediaImpl.likePicture(JSON.parse(chunk), body);
                socket.emit('notification', {
                    friend : JSON.parse(chunk)._id,
                    me: body.user._id,
                    type: 'like',
                    publication: null,
                    cordinate: null,
                    image: {
                        _id_image: data.message._id,
                        link_image: data.message.link
                    }});
                return res.status(data.status).send({message: data.message})
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    /**
     * Funkcia koja dodaje profilnu sliku i cuva je
     * upload.single('file'),
     */
    .post('/:id', upload.single('file'), function(req, res) {
        //console.log(req.params.id)
        var name =req.params.id.split('.');
        var token = req.body.token || req.query.token || req.headers['authorization'];
        try {
            var item = {
                token: token,
                urlImage: 'https://twoway-mediaservice.herokuapp.com/static/' + name[0] + '/' +  name[1] + '_' + name[2] + '.jpg'
            }

            // Lista blokiranih moze se dodati i prije
            // cuvanja slike, ostaje za sad posle kao opcija
            mediaImpl.setImageInDB({_id: name[1], link: item.urlImage});

            socket.emit('serverEvent', item);
            return res.send({succes: false, message: 'save'});
        } catch (err) {
            // console.log(err);
            return res.send({succes: false, message: 'no save'});
        }
    })
    .post('/profile-picture/:id', upload.single('file'), function(req, res) {
        //console.log(req.params.id)
        var name =req.params.id.split('.');
        var token = req.body.token || req.query.token || req.headers['authorization'];

        var urlImage = 'https://twoway-mediaservice.herokuapp.com/static/' + name[0] + '/' +  name[1] + '_' + name[2] + '.jpg'
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
            path: '/api/sync/',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin':'*',
                'Content-Type': 'application/json',
                'authorization': token,
                'Content-Length': Buffer.byteLength(data)
            }
          };
        var httpreq = https.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                
                // Ako nisam autorizovan brise se

                // Ako sam autorizovan cuva se u bazu
                mediaImpl.setImageInDB({_id: name[1], link: urlImage});
                // Soket koji javlja klijentu
                socket.emit('publication', {
                    user_id: name[1],
                    text: null,
                    image: urlImage,
                    datePublish: new Date,
                    likesCount: null,
                    likes: null,
                    comments: null,
                    address: null,
                    friends: null
                })

                return res.status(200).send({message: 'image save'})
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    

module.exports = router;