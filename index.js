import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './src/config/swagger.js'
import authRoutes from './src/routes/authRoutes.js'
import linkRoutes from './src/routes/linkRoutes.js'
import { initDirectus } from './src/database/directusInit.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Body parser
app.use(express.json())

// CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://link-tree-hub.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)

// Headers para evitar bloqueio window.postMessage
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
})

// Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 API linksHub rodando com sucesso!')
})

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

// Rotas
app.use('/auth', authRoutes)
app.use('/links', linkRoutes)

// Inicia o servidor
initDirectus().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  })
})
