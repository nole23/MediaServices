module.exports = {
    mediaDTO: function(media) {
        return {
           _id: media._id,
           datePublication: media.datePublication,
           link: media.link
        }
    }
}