import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../lib/db.js'
import dotenv from 'dotenv'

dotenv.config()

const client = new OAuth2Client(process.env.CLIENT_JWT)

const JWT_SECRET = process.env.JWT_SECRET

// 🔹 Autenticação com Google + salvar usuário + gerar JWT
export const googleAuth = async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token é obrigatório' })

  try {
    // Verifica token do Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_JWT,
    })
    const payload = ticket.getPayload()

    // Salva/atualiza usuário
    const result = await pool.query(
      `INSERT INTO users (google_id, nome, email, password)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE SET nome = $2, email = $3
       RETURNING *`,
      [payload.sub, payload.nome, payload.email]
    )

    const user = result.rows[0]

    // Cria JWT próprio (com id do usuário no nosso banco)
    const tokenJwt = jwt.sign(
      { userId: user.id, email: user.email, password: user.password },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ user, token: tokenJwt })
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Token inválido' })
  }
}

// 🔹 Middleware para validar JWT
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token inválido' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // { userId, email }
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Token expirado ou inválido' })
  }
}

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Nome, email e senha são obrigatórios' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, hashedPassword]
    )

    const user = result.rows[0]

    const tokenJwt = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ user, token: tokenJwt })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'E-mail já cadastrado' }) // Erro de chave única
    }

    console.error(err)
    res.status(500).json({ error: 'Erro ao cadastrar usuário' })
  }
}

// 🔹 Login com email e senha
export const emailPasswordLogin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    const user = result.rows[0]

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      return res.status(401).json({ error: 'Senha incorreta' })
    }

    const tokenJwt = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ user, token: tokenJwt })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao realizar login' })
  }
}

// Listar links do usuário
export const getLinks = async (req, res) => {
  try {
    const userId = req.user.userId
    const result = await pool.query(
      'SELECT * FROM links WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    )
    res.json({ links: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar links' })
  }
}

// Criar novo link
export const createLink = async (req, res) => {
  try {
    const userId = req.user.userId
    const { title, url } = req.body
    if (!title || !url) {
      return res.status(400).json({ error: 'Título e URL são obrigatórios' })
    }

    const result = await pool.query(
      'INSERT INTO links (title, url, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, url, userId]
    )

    res.status(201).json({ link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Buscar link por ID
export const getLinkById = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM links WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }
    res.json({ link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Atualizar link
export const updateLink = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params
    const { title, url } = req.body

    const result = await pool.query(
      'UPDATE links SET title = $1, url = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, url, id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    res.json({ link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Deletar link
export const deleteLink = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    res.json({ message: 'Link deletado com sucesso', link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default {
  googleAuth,
  getLinks,
  createLink,
  getLinkById,
  updateLink,
  deleteLink,
}
