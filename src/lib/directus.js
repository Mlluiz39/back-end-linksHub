import { createDirectus, rest, staticToken } from '@directus/sdk'
import dotenv from 'dotenv'

dotenv.config()

const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_PUBLIC_TOKEN || process.env.DIRECTUS_TOKEN))

export default directus
