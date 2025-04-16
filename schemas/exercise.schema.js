const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('exercises', ExerciseSchema)
