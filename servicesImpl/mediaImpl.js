var Media = require('../models/media.js');
var mediaFunction = require('../function/media.js');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:8080', {reconnect: true});

module.exports = {
    getPictureById: async function(me, userForPicture, limit, page) {
        return Media.findOne({user_id: userForPicture, 'listImages.isShowImage': {$ne: false}}, { listImages: { "$slice": [ 0, 5 ] }})
            .exec()
            .then((images) => {
                var listImage = [];
                images.listImages.forEach(element => {

                    if (me._id.toString() === userForPicture.toString()) {
                        listImage.push(mediaFunction.mediaDTO(element));
                    } else if (element.listBlockUser.length != 0) {
                        element.listBlockUser.forEach(blocker => {
                            if (blocker.toString() !== me._id.toString()) {
                                listImage.push(mediaFunction.mediaDTO(element));
                            }
                        })
                    } else {
                        listImage.push(mediaFunction.mediaDTO(element));
                    }
                    
                });

                // TODO Sortiranje
                listImage.sort(function(a,b){
                    return new Date(b.datePublication) - new Date(a.datePublication);
                });
                return {status: 200, listImage: listImage};
            })
            .catch((err) => {
                console.log(err)
                return {status: 404, message: 'server error'};
            })
    },
    setImageInDB: async function(data) {
        Media.findOne({user_id: data._id})
            .exec()
            .then((userMedia) => {
                var item = null;

                if (userMedia === null) {
                var newMedia = new Media();
                newMedia.user_id = data._id;
                newMedia.listImages.push({
                    link: data.link,
                    isShowImage: true,
                    listBlockUser: []
                });
                
                newMedia.save();
                item = newMedia.listImages[userMedia.listImages.length - 1]['_id'];
                } else {
                    userMedia.listImages.push({
                        link: data.link,
                        isShowImage: true,
                        listBlockUser: []
                    });

                    userMedia.save();
                    item = userMedia.listImages[userMedia.listImages.length - 1]['_id'];
                }

                socket.emit(data.type.toString(), {
                    user_id: data['_id'],
                    text: data['text'],
                    image: data['link'],
                    datePublish: new Date,
                    likesCount: null,
                    likes: null,
                    comments: null,
                    address: null,
                    friends: null,
                    type: 'imagePublic',
                    img_id: item
                })
            })
            .catch((err) => {
                console.log(err)
                console.log('server ne radi nesto')
            })
    },
    likePicture: async function(me, picture) {

        return Media.findOne({user_id: picture.user._id})
            .exec()
            .then((images) => {
                if (!images) return {status: 501, message: 'ne postoji baza sa slikama'}

                var info = null;
                images.listImages.forEach(element => {
                    if (element._id.toString() === picture.link._id.toString()) {
                        element.like.push(me._id);
                        info = element;
                    }
                })

                images.save();

                return {status: 200, message: info}
            })
            .catch((err) => {
                return {status: 404, message: 'server error'}
            })
    }
}