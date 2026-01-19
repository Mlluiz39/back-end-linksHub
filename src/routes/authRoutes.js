import express from 'express'
import { registerUser, emailPasswordLogin } from '../controllers/authController.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate Limiter: Máximo de 5 tentativas de login/registro por 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 requisições por IP
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
  standardHeaders: true, // Retorna info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
})

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação de usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado om sucesso
 *       400:
 *         description: Dados faltando
 *       409:
 *         description: Email já cadastrado
 *       429:
 *         description: Muitas tentativas
 */
router.post('/register', authLimiter, registerUser)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login com email e senha
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas
 */
router.post('/login', authLimiter, emailPasswordLogin)

export default router
