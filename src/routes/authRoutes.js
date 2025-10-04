import express from 'express'
import { registerUser, emailPasswordLogin, googleAuth } from '../controllers/authController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', emailPasswordLogin)
router.post('/google', googleAuth)

export default router
