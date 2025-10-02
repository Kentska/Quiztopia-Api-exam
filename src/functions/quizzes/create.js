const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')
const { v4: uuidv4 } = require('uuid')

const client = new DynamoDBClient({})

const createQuiz = async (event) => {
  const { title } = event.body
  const ownerId = event.user.username

  if (!title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Quiz title is required' }),
    }
  }

  const command = new PutItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Item: {
      quizId: { S: uuidv4() },
      title: { S: title },
      ownerId: { S: ownerId },
      type: { S: 'quiz' } // 👈 Detta gör att du kan querya via GSI:n
    },
  })

  await client.send(command)

  return {
    statusCode: 201,
    body: JSON.stringify({ message: 'Quiz created successfully' }),
  }
}

module.exports.main = middy(createQuiz)
  .use(jsonBodyParser())
  .use(verifyToken())
