const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date }
})

module.exports = mongoose.model('exercises', ExerciseSchema)
