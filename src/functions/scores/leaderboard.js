const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')

const client = new DynamoDBClient({})

const leaderboard = async (event) => {
  const quizId = event.queryStringParameters?.quizId
  const userId = event.user?.username

  if (!quizId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'quizId is required' })
    }
  }

  const command = new QueryCommand({
    TableName: process.env.RESULT_TABLE,
    IndexName: 'quizId-index',
    KeyConditionExpression: 'quizId = :quizId',
    ExpressionAttributeValues: {
      ':quizId': { S: quizId }
    }
  })

  const response = await client.send(command)

  const sorted = response.Items
    .map(item => ({
      username: item.userId.S,
      score: parseInt(item.score.N)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return {
    statusCode: 200,
    body: JSON.stringify(sorted)
  }
}

module.exports.main = middy(leaderboard)
  .use(jsonBodyParser())
  .use(verifyToken())
