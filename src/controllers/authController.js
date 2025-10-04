import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../lib/db.js'
import dotenv from 'dotenv'

dotenv.config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const JWT_SECRET = process.env.JWT_SECRET

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
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *`,
      [name, email, hashedPassword]
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user, token })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' })
    res.status(500).json({ error: 'Erro ao cadastrar usuário' })
  }
}

// Login email/senha
export const emailPasswordLogin = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' })

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (!result.rows.length) return res.status(401).json({ error: 'Usuário não encontrado' })

    const user = result.rows[0]
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) return res.status(401).json({ error: 'Senha incorreta' })

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar login' })
  }
}

// Google Auth
export const googleAuth = async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token é obrigatório' })

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const result = await pool.query(
      `INSERT INTO users (google_id,name,email,password)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (google_id) DO UPDATE SET name=$2,email=$3
       RETURNING *`,
      [payload.sub, payload.name, payload.email, '']
    )
    const user = result.rows[0]
    const tokenJwt = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user, token: tokenJwt })
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
}
