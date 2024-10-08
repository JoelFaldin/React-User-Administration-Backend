const directionRouter = require('express').Router()
const Direction = require('../models/directions')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getToken = res => {
    const authorization = res.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '') 
    }
    return null
}

// Getting directions:
directionRouter.get('/api/getDirections', async (req, res) => {
    try {
        const directions = await Direction.find({})
        return res.status(200).json({ message: 'Directions found!', directions })
    } catch(error) {
        return res.status(404).json({ error: 'There are no directions found.' })
    }
})

// Creating a new direction:
directionRouter.post('/api/newDirection', async (req, res) => {
    const decodedToken = jwt.verify(getToken(req), process.env.SECRET)
    
    const body = req.body
    const user = await User.findOne({ identifier: decodedToken.identifier })

    const existsDirection = await Direction.findOne({ name: body.newDirection })

    if (existsDirection) {
        return res.status(409).json({ error: 'That direction already exists in the database!' })
    }

    if (user.role === 'superAdmin') {
        const newDirection = new Direction({
            name: body.newDirection,
            address: body.address
        })
        await newDirection.save()
        return res.status(201).json({ message: 'Direction successfully created!' })
    } else {
        return res.status(401).json({ error: 'You cant create directions.' })
    }
})

// Removing a direction:
directionRouter.delete('/api/deleteDirection/:index', async (req, res) => {
    const decodedToken = jwt.verify(getToken(req), process.env.SECRET)

    const user = await User.findOne({ identifier: decodedToken.identifier })

    if (user.role === 'superAdmin') {
        try {
            const allDirections = await Direction.find({})
            const deleteDir = allDirections[req.params.index]

            await Direction.findByIdAndDelete(deleteDir._id)
            return res.status(204).json({ message: 'Direction removed.' })
        } catch(error) {
            return res.status(404).json({ error: 'Direction not found.' })
        }
    } else {
        return res.status(401).json({ error: 'You cant remove a direction.' })
    }
})

// Updating a direction:
directionRouter.put('/api/updateDirection/:index', async (req, res) => {
    const decodedToken = jwt.verify(getToken(req), process.env.SECRET)
    
    const user = await User.findOne({ identifier: decodedToken.identifier })

    if (user.role === 'superAdmin') {
        const body = req.body

        try {
            const allDirections = await Direction.find({})
            const updateDir = allDirections[req.params.index]
            const contains = allDirections.some(obj => obj.direccion === body.editDirection)

            if (body.editDirection !== null && !contains) {
                await Direction.findByIdAndUpdate(updateDir._id, { direccion: body.editDirection })
                return res.status(200).json({ message: 'Direction updated!' })
            } else if (body.editDirection === null) {
                return res.status(400).json({ error: 'You cant enter an empty direction!' })
            } else if (contains) {
                return res.status(409).json({ error: 'This direction already exists in the database!' })
            }
        } catch(error) {
            return res.status(404).json({ error: 'There was an error while updating the direction. Try again later.' }) 
        }
    } else {
        return res.status(401).json({ error: 'You cant update directions.' })
    }
})

module.exports = directionRouter