import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import directus from '../lib/directus.js'
import { readItems, createItem } from '@directus/sdk'
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error('❌ ERRO FATAL: JWT_SECRET não definido no .env.')
  process.exit(1)
}

// Schemas de Validação
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string(),
})

// Middleware JWT
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token não fornecido' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

// Registro manual
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)

    const hashedPassword = await bcrypt.hash(password, 10)

    // Verificar se o usuário já existe no Directus
    const existingUsers = await directus.request(
        readItems('users', {
            filter: { email: { _eq: email } }
        })
    )

    if (existingUsers.length > 0) {
        return res.status(409).json({ error: 'E-mail já cadastrado' })
    }

    // Criar usuário no Directus
    const user = await directus.request(
        createItem('users', {
            name,
            email,
            password: hashedPassword
        })
    )

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('Erro no registro:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Login email/senha
export const emailPasswordLogin = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const users = await directus.request(
        readItems('users', {
            filter: { email: { _eq: email } },
            limit: 1
        })
    )

    const user = users[0]
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) return res.status(401).json({ error: 'Credenciais inválidas' })

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('Erro no login:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
