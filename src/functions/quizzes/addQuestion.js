const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')

const client = new DynamoDBClient({})

const addQuestion = async (event) => {
  const quizId = event.pathParameters.quizId
  const { question, answer, longitude, latitude } = event.body
  const userId = event.user.username

  if (!question || !answer || !longitude || !latitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'All fields are required' }),
    }
  }

  // Skapa en fråga som ett objekt
  const newQuestion = {
    question: { S: question },
    answer: { S: answer },
    longitude: { N: longitude.toString() },
    latitude: { N: latitude.toString() },
  }

  // Lägg till frågan i quizets questions-array
  const command = new UpdateItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Key: {
      quizId: { S: quizId },
    },
    UpdateExpression: 'SET questions = list_append(if_not_exists(questions, :empty), :q)',
    ExpressionAttributeValues: {
      ':q': { L: [ { M: newQuestion } ] },
      ':empty': { L: [] },
    },
    ConditionExpression: 'ownerId = :u',
    ExpressionAttributeValues: {
      ':u': { S: userId },
      ':q': { L: [ { M: newQuestion } ] },
      ':empty': { L: [] },
    },
  })

  try {
    await client.send(command)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Question added' }),
    }
  } catch (err) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Not authorized or quiz not found', error: err.message }),
    }
  }
}

module.exports.main = middy(addQuestion)
  .use(jsonBodyParser())
  .use(verifyToken())
