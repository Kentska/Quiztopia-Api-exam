const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')

const client = new DynamoDBClient({})

const getAllQuizzes = async () => {
  const command = new QueryCommand({
    TableName: process.env.QUIZ_TABLE,
    IndexName: 'type-index',
    KeyConditionExpression: 'type = :t',
    ExpressionAttributeValues: {
      ':t': { S: 'quiz' },
    },
  })

  try {
    const result = await client.send(command)

    const quizzes = result.Items.map(item => ({
      quizId: item.quizId.S,
      title: item.title.S,
      ownerId: item.ownerId.S,
    }))

    return {
      statusCode: 200,
      body: JSON.stringify({ quizzes }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch quizzes', error: err.message }),
    }
  }
}

module.exports.main = middy(getAllQuizzes).use(jsonBodyParser())
