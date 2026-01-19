
import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LinksHub API',
      version: '1.0.0',
      description: 'API para gerenciamento de links (LinksHub)',
      contact: {
        name: 'Marcelo Luiz',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor Local',
      },
      {
         url: 'https://back-end-linkshub.onrender.com',
         description: 'Servidor Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rotas
}

const specs = swaggerJsdoc(options)

export default specs
