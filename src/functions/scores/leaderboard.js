const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')

const client = new DynamoDBClient({})

const leaderboardHandler = async (event) => {
  const quizId = event.queryStringParameters?.quizId

  if (!quizId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'quizId is required' }),
    }
  }

  const command = new QueryCommand({
    TableName: process.env.RESULT_TABLE,
    IndexName: 'quizId-index',
    KeyConditionExpression: 'quizId = :q',
    ExpressionAttributeValues: {
      ':q': { S: quizId },
    },
  })

  try {
    const result = await client.send(command)

    const sorted = result.Items
      .map(item => ({
        userId: item.userId.S,
        score: parseInt(item.score.N),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return {
      statusCode: 200,
      body: JSON.stringify({ leaderboard: sorted }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch leaderboard', error: err.message }),
    }
  }
}

module.exports.main = middy(leaderboardHandler).use(jsonBodyParser())
