var Media = require('../models/media.js');

module.exports = {
    getPictureById: async function(idUser, limit, page) {
        console.log(idUser)
        return Media.find({user_id: idUser})
            .limit(limit)
            .exec()
            .then((image) => {
                if (image === null) {
                    return {status: 200, listImage: []};
                }
                var listImage = image.listImages;

                return {status: 200, listImage: listImage};
            })
            .catch((err) => {
                return {status: 404};
            })
    }
}