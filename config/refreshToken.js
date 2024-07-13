const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
    return jwt.sign( 
        {id},
         process.env.JWT_ACCESS_TOKEN,
         { expiresIn: "10m"}
    );
}

module.exports = generateRefreshToken;