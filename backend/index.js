const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

const clientRoutes = require('./src/routes/client')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running',
    })
})

app.use('/api/client', clientRoutes)

const startServer = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL is missing in environment variables')
        }

        await mongoose.connect(process.env.MONGO_URL)
        console.log('MongoDB connected')

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error.message)
        process.exit(1)
    }
}

startServer()