const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

const getOneQuiz = async (event) => {
  const quizId = event.pathParameters.quizId

  const params = {
    TableName: process.env.QUIZ_TABLE,
    Key: { quizId } // korrekt format
  }

  const result = await dynamoDb.get(params).promise()

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Quiz not found' })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  }
}

