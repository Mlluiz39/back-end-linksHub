import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import pool from '../lib/db.js'

const client = new OAuth2Client(
  '37636929163-4l0tgcuaqnp4csarn2kqbalbl0diejpo.apps.googleusercontent.com'
)

const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta'

// 🔹 Autenticação com Google + salvar usuário + gerar JWT
export const googleAuth = async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token é obrigatório' })

  try {
    // Verifica token do Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        '37636929163-4l0tgcuaqnp4csarn2kqbalbl0diejpo.apps.googleusercontent.com',
    })
    const payload = ticket.getPayload()

    // Salva/atualiza usuário
    const result = await pool.query(
      `INSERT INTO users (google_id, nome, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (google_id) DO UPDATE SET nome = $2, email = $3
       RETURNING *`,
      [payload.sub, payload.nome, payload.email]
    )

    const user = result.rows[0]

    // Cria JWT próprio (com id do usuário no nosso banco)
    const tokenJwt = jwt.sign(
      { userId: user.id, email: user.email },
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
