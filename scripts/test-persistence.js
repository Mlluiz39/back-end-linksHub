import directus from '../src/lib/directus.js'
import { createItem, readItems, deleteItem } from '@directus/sdk'

async function testFlow() {
  const testEmail = `test_${Date.now()}@example.com`
  try {
    console.log(`🧪 Testando fluxo completo com email: ${testEmail}`)

    // 1. Criar usuário
    console.log('👤 Criando usuário...')
    const user = await directus.request(
      createItem('users', {
        name: 'Test User',
        email: testEmail,
        password: 'password123'
      })
    )
    console.log('✅ Usuário criado:', user)

    // 2. Criar link para esse usuário
    console.log('🔗 Criando link...')
    const link = await directus.request(
      createItem('links', {
        title: 'Test Link',
        url: 'https://example.com',
        user_id: user.id
      })
    )
    console.log('✅ Link criado:', link)

    // 3. Listar links
    console.log('📋 Listando links...')
    const links = await directus.request(
      readItems('links', {
        filter: { user_id: { _eq: user.id } }
      })
    )
    console.log('✅ Links encontrados:', links)

    // Limpeza (opcional)
    // await directus.request(deleteItem('links', link.id))
    // await directus.request(deleteItem('users', user.id))

  } catch (err) {
    console.error('❌ Erro no teste:', err.message)
    if (err.errors) {
      console.error('Detalhes:', JSON.stringify(err.errors, null, 2))
    }
  }
}

testFlow()
