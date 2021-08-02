const mongoose = require('mongoose');
const {Schema} = mongoose;
const ShortId = require('mongoose-shortid-nodeps');

const apiTokenSchema = new Schema({
    _id: { type: ShortId, len: 8, retries: 4 },
    token: {type: String, required:true },
    last_modified: Date,
    added_dtm: { type: Date, default: Date.now }
}, { strict: true })

module.exports = mongoose.model('ApiToken', apiTokenSchema);