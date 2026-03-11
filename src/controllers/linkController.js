import pool from '../lib/db.js'
import { z } from 'zod'
import { nanoid } from "nanoid"

// Schemas
const linkSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  url: z.string().url('URL inválida'),
})

// Listar links do usuário
export const getLinks = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM links WHERE user_id = $1 ORDER BY id ASC',
      [req.user.userId]
    )
    res.json({ links: rows })
  } catch (err) {
    console.error('Erro ao listar links:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Criar link
export const createLink = async (req, res) => {
  try {
    const id = nanoid() // Gerar ID curto e único
    
    const { title, url } = linkSchema.parse(req.body)
    
    const { rows } = await pool.query(
      'INSERT INTO links (id, title, url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, title, url, req.user.userId]
    )
    res.status(201).json({ link: rows[0] })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('Erro ao criar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Buscar link por ID
export const getLinkById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM links WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: rows[0] })
  } catch (err) {
    console.error('Erro ao buscar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Atualizar link
export const updateLink = async (req, res) => {
  try {
    const { title, url } = linkSchema.parse(req.body)

    const { rows } = await pool.query(
      'UPDATE links SET title = $1, url = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, url, req.params.id, req.user.userId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: rows[0] })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('Erro ao atualizar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Deletar link
export const deleteLink = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ message: 'Link deletado com sucesso', link: rows[0] })
  } catch (err) {
    console.error('Erro ao deletar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Backup (Exportar links)
export const backupLinks = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT title, url FROM links WHERE user_id = $1',
      [req.user.userId]
    )
    res.json({ links: rows })
  } catch (err) {
    console.error('Erro ao fazer backup:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Restore (Importar links)
export const restoreLinks = async (req, res) => {
  try {
    const { links } = req.body
    if (!Array.isArray(links)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado um array de links.' })
    }

    const linksToInsert = links
      .map(link => {
        try {
          const { title, url } = linkSchema.parse(link)
          return {id: nanoid(), title, url }
        } catch {
          return null
        }
      })
      .filter(Boolean)

    if (linksToInsert.length === 0) {
      return res.status(400).json({ error: 'Nenhum link válido para importar.' })
    }

    // Monta INSERT com múltiplos valores usando parâmetros
    const values = linksToInsert.flatMap(({ id, title, url }) => [id, title, url, req.user.userId])
    const placeholders = linksToInsert
      .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
      .join(', ')

    const { rows } = await pool.query(
      `INSERT INTO links (title, url, user_id) VALUES ${placeholders} RETURNING *`,
      values
    )

    res.status(201).json({ message: `${rows.length} links importados com sucesso.`, links: rows })
  } catch (err) {
    console.error('Erro ao restaurar links:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
