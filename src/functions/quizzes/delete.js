const { DynamoDBClient, DeleteItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')

const client = new DynamoDBClient({})

const deleteQuiz = async (event) => {
  const quizId = event.pathParameters.quizId
  const userId = event.user.username

  if (!quizId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'quizId is required' }),
    }
  }

  // Hämta quizet först för att kontrollera ägarskap
  const getCommand = new GetItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Key: {
      quizId: { S: quizId },
    },
  })

  const result = await client.send(getCommand)

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Quiz not found' }),
    }
  }

  if (result.Item.ownerId.S !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'You are not authorized to delete this quiz' }),
    }
  }

  // Radera quizet
  const deleteCommand = new DeleteItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Key: {
      quizId: { S: quizId },
    },
  })

  await client.send(deleteCommand)

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Quiz deleted successfully' }),
  }
}

module.exports.main = middy(deleteQuiz)
  .use(jsonBodyParser())
  .use(verifyToken())
