const AWS = require('aws-sdk')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const getAllQuizzes = async () => {
  const params = {
    TableName: process.env.QUIZ_TABLE,
    IndexName: 'type-index',
    KeyConditionExpression: '#type = :type',
    ExpressionAttributeNames: {
      '#type': 'type'
    },
    ExpressionAttributeValues: {
      ':type': 'quiz'
    }
  }

  try {
    const result = await dynamoDb.query(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    }
  } catch (err) {
    console.error('GetAllQuizzes error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch quizzes', error: err.message })
    }
  }
}

module.exports.main = middy(getAllQuizzes).use(httpErrorHandler())

