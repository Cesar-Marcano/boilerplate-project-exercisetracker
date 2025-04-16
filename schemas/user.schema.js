const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }
})

module.exports = mongoose.model('user', UserSchema)
