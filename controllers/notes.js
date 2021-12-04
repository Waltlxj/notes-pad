const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

//get all notes
notesRouter.get('/', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

//get one node by id
notesRouter.get('/:id', (request, response, next) => {
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

notesRouter.post('/', async (request, response, next) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
        error: "Submission has no content"
        })
    }

    const user = await User.findById(body.userId)

    const note = new Note({
        content: body.content,
        date: new Date(),
        important: body.important || false,
        user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    
    response.json(savedNote)
})

//change importance
notesRouter.put('/:id', (request, response, next) => {
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

notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

module.exports = notesRouter