import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const client = new DynamoDBClient({})

const registerHandler = async (event) => {
  const { username, password } = event.body

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username and password are required' }),
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const userId = uuidv4()

  const command = new PutItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      userId: { S: userId },
      username: { S: username },
      password: { S: hashedPassword },
    },
    ConditionExpression: 'attribute_not_exists(username)',
  })

  try {
    await client.send(command)
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered', userId }),
    }
  } catch (err) {
    return {
      statusCode: 409,
      body: JSON.stringify({ message: 'Username already exists' }),
    }
  }
}

export const main = middy(registerHandler).use(jsonBodyParser())