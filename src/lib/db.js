import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis do .env
const { Client } = pkg;

const client = new Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//  port: process.env.PG_PORT,
user: 'postgres',
host: '163.176.241.248',
database: 'mydatabase',
password: 'Julia2912',
port: 5432,
});

client.connect()
  .then(() => console.log('Conectado ao PostgreSQL'))
  .catch(err => console.error('Erro ao conectar ao PostgreSQL:', err));

export default client;
