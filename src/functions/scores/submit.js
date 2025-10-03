const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const verifyToken = require('../../middleware/verifyToken')
const { v4: uuidv4 } = require('uuid')

const client = new DynamoDBClient({})

const submitResult = async (event) => {
  const { score } = event.body
  const userId = event.user.username // från decoded JWT
  const quizId = event.pathParameters.quizId

  if(!score || !userId || !quizId) {
	return {
		statusCode: 400,
		body: JSON.stringify({ message: 'Missing score, userId, or quizId' }),
   }
  }
  const command = new PutItemCommand({
    TableName: process.env.RESULT_TABLE,
    Item: {
      resultId: { S: uuidv4() },
      quizId: { S: quizId },
      userId: { S: userId },
      score: { N: score.toString() },
    },
  })

  await client.send(command)

  return {
    statusCode: 201,
    body: JSON.stringify({ message: 'Result submitted successfully' }),
  }
}

module.exports.main = middy(submitResult)
  .use(jsonBodyParser())
  .use(verifyToken())