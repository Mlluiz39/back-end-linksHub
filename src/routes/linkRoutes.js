import express from 'express'
import { authMiddleware } from '../controllers/authController.js'
import {
  getLinks,
  createLink,
  getLinkById,
  updateLink,
  deleteLink,
} from '../controllers/linkController.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getLinks)
router.post('/', createLink)
router.get('/:id', getLinkById)
router.put('/:id', updateLink)
router.delete('/:id', deleteLink)

export default router
