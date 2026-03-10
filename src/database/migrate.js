import pool from '../lib/db.js'

export const runMigrations = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`)

    console.log('✅ Migrations executadas com sucesso.')
  } catch (err) {
    console.error('❌ Erro ao executar migrations:', err)
    process.exit(1)
  }
}
