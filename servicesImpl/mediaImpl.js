var Media = require('../models/media.js');
var mediaFunction = require('../function/media.js');

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
    }
}