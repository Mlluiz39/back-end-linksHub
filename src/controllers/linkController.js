import pool from '../lib/db.js'

// Listar links do usuário
export const getLinks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE user_id=$1 ORDER BY id ASC',
      [req.user.userId]
    )
    res.json({ links: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Criar link
export const createLink = async (req, res) => {
  const { title, url } = req.body
  if (!title || !url)
    return res.status(400).json({ error: 'Título e URL são obrigatórios' })

  try {
    const result = await pool.query(
      'INSERT INTO links (title,url,user_id) VALUES ($1,$2,$3) RETURNING *',
      [title, url, req.user.userId]
    )
    res.status(201).json({ link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Buscar link por ID
export const getLinkById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.userId]
    )
    if (!result.rows.length)
      return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Atualizar link
export const updateLink = async (req, res) => {
  const { title, url } = req.body
  try {
    const result = await pool.query(
      'UPDATE links SET title=$1,url=$2 WHERE id=$3 AND user_id=$4 RETURNING *',
      [title, url, req.params.id, req.user.userId]
    )
    if (!result.rows.length)
      return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Deletar link
export const deleteLink = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM links WHERE id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.userId]
    )
    if (!result.rows.length)
      return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ message: 'Link deletado com sucesso', link: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
