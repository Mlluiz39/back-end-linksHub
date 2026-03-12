import { createItem, createItems, readItems, updateItem, deleteItem } from '@directus/sdk'
import directus from '../lib/directus.js'
import { z } from 'zod'

// Schemas
const linkSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  url: z.string().url('URL inválida'),
})

// Listar links do usuário
export const getLinks = async (req, res) => {
  try {
    console.log(`📋 Listando links para usuário: ${req.user.userId}`)
    const links = await directus.request(
      readItems('links', {
        filter: { user_id: { _eq: req.user.userId } },
        sort: ['id'],
        limit: -1
      })
    )
    console.log(`✅ ${links.length} links encontrados para usuário ${req.user.userId}`)
    res.json({ links })
  } catch (err) {
    console.error('❌ Erro ao listar links no Directus:', err)
    res.status(500).json({ error: 'Erro interno do servidor ao listar links' })
  }
}

// Criar link
export const createLink = async (req, res) => {
  try {
    const { title, url } = linkSchema.parse(req.body)
    console.log(`📝 Tentando criar link: "${title}" para usuário ${req.user.userId}`)

    const link = await directus.request(
      createItem('links', {
        title,
        url,
        user_id: req.user.userId
      })
    )
    console.log('✅ Link criado com sucesso no Directus:', link)
    res.status(201).json({ link })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('❌ Erro ao criar link no Directus:', err)
    if (err.errors) {
        console.error('Detalhes do erro Directus:', JSON.stringify(err.errors, null, 2))
    }
    res.status(500).json({ error: 'Erro interno do servidor ao salvar link' })
  }
}

// Buscar link por ID
export const getLinkById = async (req, res) => {
  try {
    const links = await directus.request(
      readItems('links', {
        filter: {
          _and: [
            { id: { _eq: req.params.id } },
            { user_id: { _eq: req.user.userId } }
          ]
        },
        limit: 1
      })
    )

    if (links.length === 0) return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: links[0] })
  } catch (err) {
    console.error('Erro ao buscar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Atualizar link
export const updateLink = async (req, res) => {
  try {
    const { title, url } = linkSchema.parse(req.body)

    // Primeiro verifica se o link pertence ao usuário
    const existingLinks = await directus.request(
      readItems('links', {
        filter: {
          _and: [
            { id: { _eq: req.params.id } },
            { user_id: { _eq: req.user.userId } }
          ]
        },
        limit: 1
      })
    )

    if (existingLinks.length === 0) return res.status(404).json({ error: 'Link não encontrado' })

    const link = await directus.request(
      updateItem('links', req.params.id, {
        title,
        url
      })
    )
    res.json({ link })
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
    // Primeiro verifica se o link pertence ao usuário
    const existingLinks = await directus.request(
      readItems('links', {
        filter: {
          _and: [
            { id: { _eq: req.params.id } },
            { user_id: { _eq: req.user.userId } }
          ]
        },
        limit: 1
      })
    )

    if (existingLinks.length === 0) return res.status(404).json({ error: 'Link não encontrado' })

    await directus.request(deleteItem('links', req.params.id))
    res.json({ message: 'Link deletado com sucesso', link: existingLinks[0] })
  } catch (err) {
    console.error('Erro ao deletar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Backup (Exportar links)
export const backupLinks = async (req, res) => {
  try {
    const links = await directus.request(
      readItems('links', {
        filter: { user_id: { _eq: req.user.userId } },
        fields: ['title', 'url'],
        limit: -1
      })
    )
    res.json({ links })
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
          return { title, url, user_id: req.user.userId }
        } catch {
          return null
        }
      })
      .filter(Boolean)

    if (linksToInsert.length === 0) {
      return res.status(400).json({ error: 'Nenhum link válido para importar.' })
    }

    const insertedLinks = await directus.request(
        createItems('links', linksToInsert)
    )

    res.status(201).json({ message: `${insertedLinks.length} links importados com sucesso.`, links: insertedLinks })
  } catch (err) {
    console.error('Erro ao restaurar links:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
