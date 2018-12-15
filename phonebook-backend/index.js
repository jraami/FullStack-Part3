const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(bodyParser.json())
morgan.token('bodycontent', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :bodycontent :status :res[content-length] - :response-time ms'))
app.use(express.static('build'))

app.get('/info', (request, response) => {
    Person
        .count({}, (err, count) => {
            response.send('There are ' + count + ' people in the phonebook.')
        })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons.map(formatPerson))
        })
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            response.json(formatPerson(person))
        })
        .catch(error => {
            console.log(error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

// Formatoidaan id uudestaan
const formatPerson = (person) => {
    return {
        id: person._id,
        name: person.name,
        number: person.number

    }
}

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    //    entriesToShow = entriesToShow.filter(person => person.id !== id)
    Person
        .findByIdAndDelete(id, (err, deletedPerson) => {
            if (err) return response.status(500).send(err)
            const res = {
                message: "Success",
                id: deletedPerson.id
            }
        })
        .then(person => {
            response.json(person)
            response.status(204).end()
        })
        .catch(error => {
            response.status(400).send({ error: 'malformatted id' })
        })
})


app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ error: 'Needs a name.' })
    }
    else if (!body.number) {
        return response.status(400).json({ error: 'Needs a number.' })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person
        .save()
        .then(savedEntry => {
            response.json(formatPerson(savedEntry))
        })

})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const body = request.body
    Person
        .findByIdAndUpdate(id, { $set: { number: body.number } }, { new: true }, (err) => {
            if (err) return response.status(500).end()
        })
        .then(updated => {
            response.json(updated)
            response.status(204).end()
        })
        .catch(error => {
            console.log(error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

/*

app.put('api/persons/:id', (request, response) => {
    const body = request.body
    const updatedEntry = {
        'name': body.name,
        'number': body.number
    }
    Person
        .findOneAndUpdate({ '_id': id, updatedEntry })
        .then(updated => response.json(formatPerson(updated)))
    response.status(204).end()
})
*/
