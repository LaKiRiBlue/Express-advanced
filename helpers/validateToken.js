import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    jwt.verify(token, 'secretKey', (err, decoded) => {
      if (err) {
        console.error('   Error verifying token:', err);
        return res.status(500).json({ error: 'Error verifying token' });
      }
      // Attach the decoded email to the request object for further use
      req.id = decoded.id;
      next();
    });
  };

  export default validateToken;