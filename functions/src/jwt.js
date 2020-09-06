const jsonwebtoken = require("jsonwebtoken");
const entities = require("./entity");
const storage = require("./storage");

module.exports = {
    createTokens,
    jwtMiddleware,
    updateTokens
};

const jwtSecret = "13.05.1993";
const accessTokenExpire = "1min";
const refreshTokenExpire = "30d";

/** Генерация access-token. */
function generateAccessToken(userId) {
    return generateToken(userId, accessTokenExpire);
}

/** Генерация refresh-token. */
function generateRefreshToken(userId) {
    return generateToken(userId, refreshTokenExpire);
}

/** Генерация токена с expiresIn. */
function generateToken(userId, expiresIn) {
    return jsonwebtoken.sign({userId}, jwtSecret, { expiresIn });
}

/** Авторизация. */
async function createTokens(userId, database) {
    // Очистка токенов.
    await clearRefreshTokens(userId, database);
    // Генерация новых токенов.
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    // Запись с refresh-token.
    const refreshTokenItem = {
        userId,
        refreshToken,
    };
    // Запись refresh-token-item в БД.
    await storage.create(entities.token, refreshTokenItem, database);
    return {accessToken, refreshToken};
}

/** Очистка refresh-token. */
async function clearRefreshTokens(userId, database) {
    const userRefreshTokens = await storage.select(
        entities.token,
        ["userId", "=", userId],
        database
    );
    if (userRefreshTokens.length >= 5) {
        userRefreshTokens.forEach(async (token) => {
            await storage.remove(entities.token, token.id, database);
        });
    }
}

/** Проверка токена. */
function verifyJWT(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                return reject(err.message);
            }
            if (!decodedToken || !decodedToken.userId) {
                return reject("invalid token");
            }
            resolve(decodedToken);
        });
    });
}

/** Валидация запросов по токену. */
function jwtMiddleware(request, response, next) {
    const token = request.headers.jwt;
    if (!token) {
        response.status(401).send('invalid token');
    }
    verifyJWT(token).then(decodedToken => {
        request.userId = decodedToken.userId;
        next();
    }).catch(err => {
        response.status(401).send(err);
    });
}

/** Обновление refresh-token. */
async function updateTokens(token, database) {
    // Получаем идентификатор пользователя из токена.
    const decodedToken = jsonwebtoken.verify(token, jwtSecret);
    const userId = decodedToken.userId;
    // Ищем пользователя с таким идентификатором.
    const user = await storage.select(entities.user, ["id", "=", userId], database);
    // Если нет.
    if (!user) {
        throw new Error(`Access is forbidden`);
    }
    // Ищем refresh-token'ы данного пользователя.
    const allTokenItems = await storage.select(entities.token, ["userId", "=", userId], database);
    // Если нет.
    if (!allTokenItems || !allTokenItems.length) {
        throw new Error(`There is no refresh token for the user with`);
    }
    // Находим текущий refresh-token.
    const currentTokenItem = allTokenItems.find(tokenItem => tokenItem.refreshToken === token);
    // Если нет.
    if (!currentTokenItem) {
        throw new Error(`Refresh token is wrong`);
    }
    // Генерация токенов.
    const refreshToken = generateRefreshToken(userId);
    const accessToken = generateAccessToken(userId);
    // Запись с refresh-token.
    const newTokenItem = {
        userId,
        refreshToken,
    };
    // Замена текущего токена новым.
    await storage.update(entities.token, currentTokenItem.id, newTokenItem, database);
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
}
