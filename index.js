require('dotenv').config
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/note')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

//middleware to log request
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

//get all notes
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

//get one node by id
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
  .then(note => {
    if (note){
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

//add one note
/*
const generateID = () => {
  const maxID = notes.length > 0
    ? Math.max(...notes.map(note => note.id))
    : 0
  return maxID + 1
}
*/
app.post('/api/notes', (request, response, next) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({
      error: "Submission has no content"
    })
  }
  const note = new Note({
    content: body.content,
    date: new Date(),
    important: body.important || false
  })
  note.save()
  .then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

//change importance
app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body
  const noteChange = {
    content: body.content,
    important: body.important
  }
  Note.findByIdAndUpdate(request.params.id, noteChange, {new: true})
  .then(updatedNote => {
    response.json(updatedNote)
  })
  .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//middleware unknow address
const unknowEndP = (request, response) => {
  response.status(404).send({
    error: "Unknown endpoint"
  })
}
app.use(unknowEndP)

//middileware to handle error
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Incorrect format of id'})
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`SERVER RUNNING PORT ${PORT}`)
})