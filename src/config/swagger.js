
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
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor Local',
      },
      {
         url: 'https://api-linkshub.mlluizdevtech.com.br',
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
