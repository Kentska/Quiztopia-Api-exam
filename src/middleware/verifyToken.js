const jwt = require('jsonwebtoken')

const verifyToken = () => {
  return {
    before: async (request) => {
      const authHeader =
        request.event.headers.Authorization || request.event.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized: No token provided')
      }

      const token = authHeader.split(' ')[1]

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        request.event.user = decoded // ✅ Lägg till användaren i eventet
      } catch (err) {
        throw new Error('Unauthorized: Invalid token')
      }
    },
  }
}

module.exports = verifyToken