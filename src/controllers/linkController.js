import supabase from '../lib/supabase.js'
import { z } from 'zod'

// Schemas
const linkSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  url: z.string().url('URL inválida'),
})

// Listar links do usuário
export const getLinks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('id', { ascending: true })

    if (error) throw error
    res.json({ links: data })
  } catch (err) {
    console.error('Erro ao listar links:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Criar link
export const createLink = async (req, res) => {
  try {
    // Validação
    const { title, url } = linkSchema.parse(req.body)

    const { data, error } = await supabase
      .from('links')
      .insert([{ title, url, user_id: req.user.userId }])
      .select()

    if (error) throw error
    res.status(201).json({ link: data[0] })
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
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: data })
  } catch (err) {
    console.error('Erro ao buscar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Atualizar link
export const updateLink = async (req, res) => {
  try {
    const { title, url } = linkSchema.parse(req.body)

    const { data, error } = await supabase
      .from('links')
      .update({ title, url })
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .select()

    if (error) throw error
    if (!data.length)
      return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ link: data[0] })
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
    const { data, error } = await supabase
      .from('links')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .select()

    if (error) throw error
    if (!data.length)
      return res.status(404).json({ error: 'Link não encontrado' })
    res.json({ message: 'Link deletado com sucesso', link: data[0] })
  } catch (err) {
    console.error('Erro ao deletar link:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
