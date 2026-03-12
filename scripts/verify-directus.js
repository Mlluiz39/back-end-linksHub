import directus from '../src/lib/directus.js'
import { readItems, readCollections } from '@directus/sdk'

async function verify() {
  try {
    console.log('🔍 Verificando conexão com Directus...')
    
    // Tenta ler as coleções acessíveis
    try {
        const collections = await directus.request(readCollections())
        console.log('✅ Coleções acessíveis:', collections.map(c => c.collection).join(', '))
    } catch (err) {
        console.log('⚠️ Não foi possível listar coleções (pode ser falta de permissão de admin).')
    }

    // Tenta ler a coleção "users"
    try {
        await directus.request(readItems('users', { limit: 1 }))
        console.log('✅ Collection "users" acessível.')
    } catch (err) {
        console.log('❌ Collection "users" não acessível ou não existe.')
    }

    // Tenta ler a coleção "links"
    try {
        await directus.request(readItems('links', { limit: 1 }))
        console.log('✅ Collection "links" acessível.')
    } catch (err) {
        console.log('❌ Collection "links" não acessível ou não existe.')
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message)
  }
}

verify()
