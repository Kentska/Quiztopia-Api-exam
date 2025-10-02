const { DynamoDBClient, PutItemCommand } = require ('@aws-sdk/client-dynamodb')
const middy = require ('@middy/core')
const jsonBodyParser = require ('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const { v4: uuidv4 } = require ('uuid')
const bcrypt = require ('bcryptjs')

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

module.exports.main = middy(registerHandler)
  .use(jsonBodyParser())
  .use(httpErrorHandler())