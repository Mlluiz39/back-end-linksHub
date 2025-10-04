import express from 'express'
import {
  googleAuth,
  getLinks,
  createLink,
  getLinkById,
  updateLink,
  deleteLink,
  authMiddleware,
} from '../controllers/linkController.js'

const router = express.Router()

// 🔓 Rota pública - Login com Google
router.post('/auth/login', googleAuth)

// 🔒 Rotas protegidas - CRUD de links
router.use(authMiddleware) // tudo abaixo exige token válido

router.get('/links', getLinks)
router.post('/links', createLink)
router.get('/links/:id', getLinkById)
router.put('/links/:id', updateLink)
router.delete('/links/:id', deleteLink)

export default router
