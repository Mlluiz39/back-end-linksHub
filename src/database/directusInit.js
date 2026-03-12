import directus from '../lib/directus.js'
import { createCollection, createField, readCollections, readFieldsByCollection, updateField, createRelation, readRelations } from '@directus/sdk'

export async function initDirectus() {
  try {
    console.log('🚀 Iniciando configuração automática do Directus...')

    // 1. Listar coleções existentes
    const collections = await directus.request(readCollections())
    const collectionNames = collections.map((c) => c.collection)

    // 2. Configurar "users"
    if (!collectionNames.includes('users')) {
      console.log('📦 Criando coleção "users"...')
      await directus.request(
        createCollection({
          collection: 'users',
          schema: {},
          meta: {
            display_template: '{{name}} ({{email}})',
            icon: 'person',
          },
        })
      )
    }

    // Verificar e criar campos para "users"
    const userFields = await directus.request(readFieldsByCollection('users'))
    const userFieldNames = userFields.map((f) => f.field)

    const requiredUserFields = [
      { field: 'name', type: 'string', meta: { interface: 'input' } },
      { field: 'email', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } },
      { field: 'password', type: 'string', meta: { interface: 'input-password' } },
    ]

    for (const field of requiredUserFields) {
      if (!userFieldNames.includes(field.field)) {
        console.log(`📝 Adicionando campo "${field.field}" à coleção "users"...`)
        await directus.request(createField('users', field))
      }
    }

    // 3. Configurar "links"
    if (!collectionNames.includes('links')) {
      console.log('📦 Criando coleção "links"...')
      await directus.request(
        createCollection({
          collection: 'links',
          schema: {},
          meta: {
            display_template: '{{title}}',
            icon: 'link',
          },
        })
      )
    }

    // Verificar e criar campos para "links"
    const linkFields = await directus.request(readFieldsByCollection('links'))
    const linkFieldNames = linkFields.map((f) => f.field)

    const requiredLinkFields = [
      { field: 'title', type: 'string', meta: { interface: 'input' } },
      { field: 'url', type: 'string', meta: { interface: 'input' } },
      { field: 'user_id', type: 'integer', meta: { interface: 'numeric' } },
    ]

    for (const field of requiredLinkFields) {
      const existingField = linkFields.find(f => f.field === field.field)
      if (!existingField) {
        console.log(`📝 Adicionando campo "${field.field}" à coleção "links"...`)
        await directus.request(createField('links', field))
      } else if (existingField.type !== field.type && field.field === 'user_id') {
         // Tenta corrigir o tipo se for user_id (pode falhar se houver dados incompatíveis, mas vale tentar)
         try {
            console.log(`🔧 Corrigindo tipo do campo "${field.field}" para ${field.type}...`)
            await directus.request(updateField('links', field))
         } catch (e) {
            console.warn(`⚠️ Não foi possível alterar o tipo de ${field.field}. Erro: ${e.message}`)
         }
      }
    }

    // 4. Configurar Relação (user_id -> users.id)
    try {
        const relations = await directus.request(readRelations())
        const linkRelationExists = relations.some(r => r.collection === 'links' && r.field === 'user_id')
        
        if (!linkRelationExists) {
            console.log('🔗 Criando relação entre "links" e "users"...')
            await directus.request(createRelation({
                collection: 'links',
                field: 'user_id',
                related_collection: 'users',
                schema: {
                    on_delete: 'CASCADE'
                },
                meta: {
                    interface: 'select-dropdown-m2o'
                }
            }))
        }
    } catch (err) {
        console.warn('⚠️ Não foi possível configurar a relação entre coleções:', err.message)
    }

    console.log('✨ Configuração do Directus finalizada com sucesso!')
  } catch (err) {
    console.error('❌ Erro na configuração automática do Directus:')
    if (err.errors) {
      console.error(JSON.stringify(err.errors, null, 2))
    } else {
      console.error(err.message)
    }
  }
}
