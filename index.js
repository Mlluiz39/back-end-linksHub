import express from 'express'
import linkRoutes from './src/routes/linkRoutes.js'

const app = express()
const PORT = 3000

app.use(express.json())

// Rotas
app.use('/links', linkRoutes)

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
