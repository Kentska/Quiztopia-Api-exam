import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import jwt from 'jsonwebtoken'

const loginHandler = async (event) => {
  const { username, password } = event.body

  // 🔐 Här kan du koppla mot DynamoDB för riktig användarverifiering
  if (username === 'testuser' && password === 'testpass') {
    const token = jwt.sign(
      { username }, // payload
      process.env.JWT_SECRET, // secret från .env
      { expiresIn: '1h' } // token gäller i 1 timme
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    }
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: 'Invalid credentials' }),
  }
}

export const main = middy(loginHandler).use(jsonBodyParser())