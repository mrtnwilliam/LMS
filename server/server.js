import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authRoutes.js'

// Initialize Express
const app = express()

// Connect to database
await connectDB();
await connectCloudinary();

// Middlewares
const allowedOrigins = ['http://localhost:5173', 'https://lms-frontend-sigma-weld.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
app.use(cookieParser())
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.use('/api/auth', authRouter)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)


// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})