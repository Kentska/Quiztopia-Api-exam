import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const client = new DynamoDBClient({})

const loginHandler = async (event) => {
  const { username, password } = event.body

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username and password are required' }),
    }
  }

  const command = new GetItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      username: { S: username },
    },
  })

  try {
    const result = await client.send(command)

    if (!result.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      }
    }

    const storedHash = result.Item.password.S
    const match = await bcrypt.compare(password, storedHash)

    if (!match) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      }
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Login failed', error: err.message }),
    }
  }
}

export const main = middy(loginHandler).use(jsonBodyParser())