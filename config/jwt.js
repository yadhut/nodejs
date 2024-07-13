const jwt = require("jsonwebtoken");

const generateJwt = (id) => {
    return jwt.sign( 
        {id},
         process.env.JWT_ACCESS_TOKEN,
         { expiresIn: "30m"}
    );
}

module.exports = generateJwt;