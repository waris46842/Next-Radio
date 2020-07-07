const mongoose = require('mongoose')
const Schema = mongoose.Schema

const filesSchema = new Schema({
    _id: String,
    type: String,
    length: Number
}, {timestamps: true, versionKey: false})

const filesModel = mongoose.model('files', filesSchema, 'files')

module.exports = filesModel