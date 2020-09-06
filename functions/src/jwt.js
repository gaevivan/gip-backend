const jwt = require('jsonwebtoken');

function getAccessToken(payload) {
    return jwt.sign({user: payload}, jwtSecretString, { expiresIn: '15min' });
}