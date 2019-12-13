const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Deskripcija
 * Novica,                      -   ime
 * Nikolic,                     -   prezime
 * hasdkjlasjpdoaskas.dkasoda,  -   sifra
 * nole,                        -   korisnicko ime
 * nole0223@gmail.com           -   email
 * true,                        -   status profila
 * 123456dsgs6g54sd321          -   id od modela userInformation
 */
const MediaSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    listImages: [{
        type: String
    }]
});

module.exports = mongoose.model('Media', MediaSchema);