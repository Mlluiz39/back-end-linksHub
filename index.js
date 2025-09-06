import express from 'express'
import linkRoutes from './src/routes/linkRoutes.js'

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

// Rotas
app.use('/links', linkRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
