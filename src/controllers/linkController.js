import db from '../lib/db.js'

// Listar todos os links
export const getLinks = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM links ORDER BY id ASC')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar links' })
  }
}

// Criar um novo link
export const createLink = async (req, res) => {
  try {
    const { title, url } = req.body
    if (!title || !url) {
      return res.status(400).json({ error: 'Título e URL são obrigatórios' })
    }

    const [result] = await pool.query(
      'INSERT INTO links (title, url) VALUES (?, ?)',
      [title, url]
    )

    res.status(201).json({ id: result.insertId, title, url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Buscar link por ID
export const getLinkById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Deletar link
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM links WHERE id = ?', [id])
    res.json({ message: 'Link deletado com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default { getLinks, createLink, getLinkById, deleteLink }
