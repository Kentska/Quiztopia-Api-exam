const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const createQuiz = async (event) => {
  try {
    console.log('Incoming event:', JSON.stringify(event))

    const { title, questions } = event.body
    const username = event.user?.username

    if (!title || !username || !Array.isArray(questions) || questions.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing title, user, or questions' }),
      }
    }

    // Validera varje fråga
    for (const q of questions) {
      if (
        !q.question ||
        !q.answer ||
        typeof q.latitude !== 'number' ||
        typeof q.longitude !== 'number'
      ) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Each question must include question, answer, and coordinates' }),
        }
      }
    }
	

    const quizId = uuidv4()
    const params = {
      TableName: process.env.QUIZ_TABLE,
      Item: {
        quizId,
        title,
        ownerId: username,
        questions, // ✅ hela frågelistan med koordinater
        type: 'quiz',
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


