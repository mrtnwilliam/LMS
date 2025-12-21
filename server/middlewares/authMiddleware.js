import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protectRoute = async (req, res, next) => {
  try {
    const { token } = req.cookies

    if (!token) {
      return res.json({ success: false, message: 'Not Authorized. Please Login Again.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.id) {
        req.auth = { userId: decoded.id }
        next()
    } else {
        return res.json({ success: false, message: 'Not Authorized. Please Login Again.' })
    }

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId
    const user = await User.findById(userId)

    if (user.role !== 'educator') {
      return res.status(403).json({success: false, message: 'Unauthorized Access'})
    }

    next()
  } catch (error) {
    res.status(401).json({success: false, message: error.message})
  }
}