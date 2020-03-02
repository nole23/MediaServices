var Media = require('../models/media.js');
var mediaFunction = require('../function/media.js');

module.exports = {
    getPictureById: async function(me, userForPicture, limit, page) {
        return Media.findOne({user_id: userForPicture, 'listImages.isShowImage': {$ne: false}})
            .limit(limit)
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

                return {status: 200, listImage: listImage};
            })
            .catch((err) => {
                return {status: 404, message: 'server error'};
            })
    },
    setImageInDB: function(data) {
        Media.findOne({user_id: data._id})
            .exec()
            .then((userMedia) => {
                if (userMedia === null) {
                var newMedia = new Media();
                newMedia.user_id = data._id;
                newMedia.listImages.push({
                    link: data.link,
                    like: [],
                    comment: [],
                    isShowImage: true,
                    listBlockUser: []
                });
                
                newMedia.save();
                } else {
                    userMedia.listImages.push({
                        link: data.link,
                        like: [],
                        comment: [],
                        isShowImage: true,
                        listBlockUser: []
                    });

                    userMedia.save();
                }
            })
            .catch((err) => {
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