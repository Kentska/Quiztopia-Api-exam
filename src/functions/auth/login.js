const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
      username: { S: username } // ✅ matchar tabellens partition key
    }
  })

  try {
    const data = await client.send(command)

    if (!data.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Login failed', error: 'User not found' }),
      }
    }

    const storedHash = data.Item.password.S
    const isValid = await bcrypt.compare(password, storedHash)

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Login failed', error: 'Invalid password' }),
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
    console.error('Login error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: err.message }),
    }
  }
}

module.exports.main = middy(loginHandler)
  .use(jsonBodyParser())
  .use(httpErrorHandler())
