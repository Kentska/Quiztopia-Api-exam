const jwt = require('jsonwebtoken')

const verifyToken = () => {
  return {
    before: async (request) => {
      const token = request.event.headers.Authorization || request.event.headers.authorization

      if (!token) {
        throw new Error('Missing Authorization header')
      }

      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET)

        // Sätt båda för kompatibilitet
        request.event.user = decoded
        request.event.requestContext = request.event.requestContext || {}
        request.event.requestContext.authorizer = {
          username: decoded.username
        }
      } catch (err) {
        throw new Error('Invalid token')
      }
    }
  }
}

module.exports = verifyToken
