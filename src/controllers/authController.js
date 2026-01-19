import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import supabase from '../lib/supabase.js'
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
    // Validação
    const { name, email, password } = registerSchema.parse(req.body)

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Inserir no Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword }])
      .select()

    if (error) {
       if (error.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' })
       throw error
    }

    const user = data[0]
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
    // Validação
    const { email, password } = loginSchema.parse(req.body)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!data) return res.status(401).json({ error: 'Credenciais inválidas' }) // Generic msg

    const user = data
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) return res.status(401).json({ error: 'Credenciais inválidas' }) // Generic msg

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
