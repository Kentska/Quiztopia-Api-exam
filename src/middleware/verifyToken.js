const jwt = require('jsonwebtoken')

const verifyToken = () => {
  return {
    before: async (request) => {
      const authHeader = request.event.headers.Authorization || request.event.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized: Missing or invalid token')
      }

      const token = authHeader.split(' ')[1]
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        request.event.user = decoded
      } catch (err) {
        throw new Error('Unauthorized: Invalid token')
      }
    }
  }
}

module.exports = verifyToken