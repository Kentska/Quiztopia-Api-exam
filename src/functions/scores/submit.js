const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')
const { v4: uuidv4 } = require('uuid')

const client = new DynamoDBClient({})

const submitResult = async (event) => {
  const { score } = event.body
  const userId = event.user.username // från decoded JWT

  const command = new PutItemCommand({
    TableName: process.env.RESULT_TABLE,
    Item: {
      resultId: { S: uuidv4() },
      userId: { S: userId },
      score: { N: score.toString() },
    },
  })

  await client.send(command)

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Result submitted' }),
  }
}

module.exports.main = middy(submitResult)
  .use(jsonBodyParser())
  .use(verifyToken())