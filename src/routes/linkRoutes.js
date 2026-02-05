import express from 'express'
import { authMiddleware } from '../controllers/authController.js'
import {
  getLinks,
  createLink,
  getLinkById,
  updateLink,
  deleteLink,
  backupLinks,
  restoreLinks,
} from '../controllers/linkController.js'

const router = express.Router()

router.use(authMiddleware)

/**
 * @swagger
 * tags:
 *   name: Links
 *   description: Gerenciamento de Links
 */

/**
 * @swagger
 * /links:
 *   get:
 *     summary: Retorna todos os links do usuário autenticado
 *     tags: [Links]
 *     responses:
 *       200:
 *         description: Lista de links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       url:
 *                         type: string
 *                       user_id:
 *                         type: integer
 */
router.get('/', getLinks)

/**
 * @swagger
 * /links/backup:
 *   get:
 *     summary: Exporta todos os links do usuário (backup)
 *     tags: [Links]
 *     responses:
 *       200:
 *         description: Arquivo JSON com os links
 */
router.get('/backup', backupLinks)

/**
 * @swagger
 * /links/restore:
 *   post:
 *     summary: Importa links de um backup (restore)
 *     tags: [Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Links importados com sucesso
 */
router.post('/restore', restoreLinks)

/**
 * @swagger
 * /links:
 *   post:
 *     summary: Cria um novo link
 *     tags: [Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Link criado
 *       400:
 *         description: Dados inválidos
 */
router.post('/', createLink)

/**
 * @swagger
 * /links/{id}:
 *   get:
 *     summary: Busca um link pelo ID
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do link
 *     responses:
 *       200:
 *         description: Detalhes do link
 *       404:
 *         description: Link não encontrado
 */
router.get('/:id', getLinkById)

/**
 * @swagger
 * /links/{id}:
 *   put:
 *     summary: Atualiza um link
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do link
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Link atualizado
 *       404:
 *         description: Link não encontrado
 */
router.put('/:id', updateLink)

/**
 * @swagger
 * /links/{id}:
 *   delete:
 *     summary: Remove um link
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do link
 *     responses:
 *       200:
 *         description: Link removido
 *       404:
 *         description: Link não encontrado
 */
router.delete('/:id', deleteLink)

export default router
