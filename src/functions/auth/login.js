/ src/functions/auth/login.js
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { sign } from 'jsonwebtoken'

const login = async (event) => {
  const { username } = event.body
  const token = sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' })
  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  }
}

export const main = middy(login).use(jsonBodyParser())