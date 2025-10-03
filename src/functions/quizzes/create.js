const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid') // ✅ CommonJS-kompatibel
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const createQuiz = async (event) => {
  try {
    console.log('Incoming event:', JSON.stringify(event))

    const { title } = event.body
    const username = event.user?.username

    if (!title || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing title or user' }),
      }
    }

    const quizId = uuidv4()
    const params = {
      TableName: process.env.QUIZZES_TABLE,
      Item: {
        quizId,
        title,
        ownerId: username,
        type: 'quiz', // ✅ krävs för GSI
      },
    }

    await dynamoDb.put(params).promise()

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Quiz created', quizId }),
    }
  } catch (err) {
    console.error('CreateQuiz error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: err.message }),
    }
  }
}

module.exports.main = middy(createQuiz)
  .use(jsonBodyParser())
  .use(verifyToken())
  .use(httpErrorHandler())

