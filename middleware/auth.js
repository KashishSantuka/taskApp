const jwt = require('jsonwebtoken')
const User = require('../models/user')
const dotenv = require('dotenv')

dotenv.config()

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById({ _id: decoded._id })
            
        if (!user) {
            throw new Error()
        }

        console.log(user);
        
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth