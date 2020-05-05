const express = require('express');
var fs = require('fs');
const router = express.Router();
const multer = require('multer');
var https = require('https');
var http = require('http');
const mediaImpl = require('../servicesImpl/mediaImpl.js');

const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        var name = file.originalname.split('.');
        var dir =  './public/' + name[0];
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0744);
        }
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
        return res.status(200).send({message: 'radi', socket: 'SOCKET_NULL_POINT'})
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
        var limit = req.body;
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
                return res.status(data.status).send({imageLink: data.listImage, socket: 'SOCKET_NULL_POINT'})
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
        var name = req.params.id.split('.');
        var token = req.body.token || req.query.token || req.headers['authorization'];

        var item = {
            link: 'https://twoway-mediaservice.herokuapp.com/static/' + name[0] + '/' +  name[1] + '_' + name[2] + '.jpg',
            type: 'imageProfil',
            text: null
        }
        var data = JSON.stringify(item)
        try {
            var options = {
                host: 'twoway-usersservice.herokuapp.com',
                path: '/api/publication/add-publication',
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Access-Control-Allow-Credentials':'true',
                    'Access-Control-Allow-Methods':'GET, HEAD, POST, PUT, DELETE',
                    'Access-Control-Allow-Headers':'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data),
                    'authorization': token
                }
            };

            var httpreq = http.request(options, async function (response, error) {
                response.setEncoding('utf8');
                response.on('data', async function (chunk) {
                    mediaImpl.setImageInDB({_id: name[1], link: item.urlImage, type: 'imageProfil', text: null});
                    return res.status(200).send({message: 'SUCCESS_SAVE_ADD', socket: 'SOCKET_NULL_POINT'})
                });
            });
            httpreq.write(data);
            httpreq.end();
        } catch (err) {
            return res.send({succes: false, message: 'no save', socket: 'SOCKET_NULL_POINT'});
        }
    })
    .post('/profile-picture/:id/:text', upload.single('file'), async function(req, res) {
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var text = req.params.text;

        var name = req.params.id.split('.');
        var item = {
            link: 'https://twoway-mediaservice.herokuapp.com/static/' + name[0] + '/' +  name[1] + '_' + name[2] + '.jpg',
            type: 'imagePublic',
            text: text
        }

        var data = JSON.stringify(item)
        try {
            
            var options = {
                host: 'twoway-usersservice.herokuapp.com',
                path: '/api/publication/add-publication',
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Access-Control-Allow-Credentials':'true',
                    'Access-Control-Allow-Methods':'GET, HEAD, POST, PUT, DELETE',
                    'Access-Control-Allow-Headers':'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data),
                    'authorization': token
                }
            };

            var httpreq = http.request(options, async function (response, error) {
                response.setEncoding('utf8');
                response.on('data', async function (chunk) {
                    mediaImpl.setImageInDB({_id: name[1], link: item.urlImage, type: 'imagePublic', text: text});
                    return res.status(200).send({message: chunk, socket: 'SOCKET_NULL_POINT'})
                });
            });
            httpreq.write(data);
            httpreq.end(); 
        } catch (err) {
            console.log(err)
        }
    })
    

module.exports = router;