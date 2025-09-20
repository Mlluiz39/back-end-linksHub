import express from 'express'
import cors from 'cors'
import linkRoutes from './src/routes/linkRoutes.js'

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)

// Rotas
app.use('/', linkRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`)
})
