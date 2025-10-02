const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb')
const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')

const client = new DynamoDBClient({})

const getOneQuiz = async (event) => {
  const quizId = event.pathParameters.quizId

  if (!quizId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'quizId is required' }),
    }
  }

  const command = new GetItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Key: {
      quizId: { S: quizId },
    },
  })

  try {
    const result = await client.send(command)

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Quiz not found' }),
      }
    }

    const quiz = {
      quizId: result.Item.quizId.S,
      title: result.Item.title.S,
      ownerId: result.Item.ownerId.S,
      questions: result.Item.questions?.L?.map(q => ({
        question: q.M.question.S,
        answer: q.M.answer.S,
        longitude: parseFloat(q.M.longitude.N),
        latitude: parseFloat(q.M.latitude.N),
      })) || [],
    }

    return {
      statusCode: 200,
      body: JSON.stringify(quiz),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch quiz', error: err.message }),
    }
  }
}

module.exports.main = middy(getOneQuiz).use(jsonBodyParser())
