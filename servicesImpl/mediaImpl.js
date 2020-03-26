var Media = require('../models/media.js');
var mediaFunction = require('../function/media.js');
var io = require('socket.io-client');
var socket = io.connect('https://twoway-usersservice.herokuapp.com', {reconnect: true});

module.exports = {
    getPictureById: async function(me, userForPicture, limit, page) {
        return Media.find({user_id: userForPicture, 'isShowImage': {$ne: false}})
            .sort({datePublication: -1})
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then((images) => {
                var listImage = [];
                images.forEach(element => {
                    listImage.push(mediaFunction.mediaDTO(element));
                })
                return {status: 200, listImage: listImage};
            })
            .catch((err) => {
                console.log(err)
                return {status: 404, message: 'server error'};
            })
    },
    setImageInDB: async function(data) {
        var newMedia = new Media();
        newMedia.user_id = data._id;
        newMedia.link = data.link
        newMedia.isShowImage = true,
        newMedia.listBlockUser = [],
        newMedia.datePublication = new Date
        
        newMedia.save();
        
        socket.emit(data.type.toString(), {
            user_id: data['_id'],
            text: data['text'],
            image: data['link'],
            datePublish: newMedia.datePublication,
            likesCount: null,
            likes: null,
            comments: null,
            address: null,
            friends: null,
            type: 'imagePublic',
            img_id: newMedia._id
        })
    }
}