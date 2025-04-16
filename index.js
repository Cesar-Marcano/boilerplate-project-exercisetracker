const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const userModel = require('./schemas/user.schema')
const exerciseModel = require('./schemas/exercise.schema')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Database connected')
})

app.post('/api/users', async (req, res) => {
  const newUser = await userModel.create({username: req.body.username})

  return res.status(201).json({ username: newUser.username, _id: newUser._id })
})

app.get('/api/users', async (req, res) => {
  const users = (await userModel.find()).map(user => ({ username: user.username, _id: user._id }))

  return res.status(200).json(users)
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const {description, duration, date} = req.body
  const userId = req.params._id

  const user = await userModel.findById(userId)

  if (!user) {
    throw new Error('No user found')
  }

  const newExercise = await exerciseModel.create({
    userId: user._id,
    date: date ?? Date.now(),
    description,
    duration
  })

  return res.status(201).json({
    username: newExercise.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id,
    username: user.username
  })
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  const filter = { userId: userId };

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for "from". Use yyyy-mm-dd.' });
      }
      filter.date = { ...filter.date, $gte: fromDate };
    }

    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for "to". Use yyyy-mm-dd.' });
      }
      filter.date = { ...filter.date, $lte: toDate };
    }

    let query = exerciseModel.find(filter).select('description duration date -_id');

    if (limit) {
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        return res.status(400).json({ error: 'Invalid value for "limit". Must be a non-negative integer.' });
      }
      query = query.limit(parsedLimit);
    }

    const exercises = await query.exec();

    const logResponse = {
      username: user.username,
      _id: user._id.toString(),
      count: exercises.length,
      log: exercises.map(exercise => ({
        description: exercise.description,
        duration: parseInt(exercise.duration),
        date: new Date(exercise.date).toDateString()
      }))
    };

    return res.status(200).json(logResponse);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching user logs' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
