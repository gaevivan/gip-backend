const entities = require("./entity");
const storage = require("./storage");
const jwt = require("./jwt");

module.exports = {
    auth,
    update,
    remove,
    create,
    select,
    updateRefreshToken
}

/** Авторизация. */
async function auth(request, response, database) {
    try {
        // Проверка наличия логина.
        const login = request.body.login;
        if (!login) {
            return response.status(400).send("Необходимо поле: login");
        }
        // Проверка наличия пароля.
        const password = request.body.password;
        if (!password) {
            return response.status(400).send("Необходимо поле: password");
        }
        // Проверка наличия пользователя по логину.
        const filterItem = ["login", "=", login];
        const users = await storage.select(entities.user, filterItem, database);
        if (!users.length) {
            return response.status(401).send("Нет такого пользователя.");
        }
        const user = users[0];
        // Проверка правильности пароля.
        if (user.password !== password) {
            return response.status(401).send("Неправильный пароль.");
        }
        // Получение токенов.
        const tokens = await jwt.createTokens(user.id, database);
        // Подготовка ответа.
        delete user.password;
        delete user.id;
        const result = {...tokens, user};
        return response.status(200).send(result);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Создание данных. */
async function create(request, response, database) {
    try {
        const entity = request.body.entity;
        if (!entity) {
            return response.status(400).send("Необходимо поле: entity");
        }
        const data = request.body.data;
        if (!data) {
            return response.status(400).send("Необходимо поле: data");
        }
        const result = await storage.create(entity, data, database);
        return response.status(200).send(result);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Удаление данных. */
async function remove(request, response, database) {
    try {
        const entity = request.body.entity;
        if (!entity) {
            return response.status(400).send("Необходимо поле: entity");
        }
        const id = request.body.id;
        if (!id) {
            return response.status(400).send("Необходимо поле: id");
        }
        const result = await storage.remove(entity, id, database);
        return response.status(200).send(result);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Обновление данных. */
async function update(request, response, database) {
    try {
        const entity = request.body.entity;
        if (!entity) {
            return response.status(400).send("Необходимо поле: entity");
        }
        const id = request.body.id;
        if (!id) {
            return response.status(400).send("Необходимо поле: id");
        }
        const data = request.body.data;
        if (!data) {
            return response.status(400).send("Необходимо поле: data");
        }
        const result = await storage.update(entity, id, data, database);
        return response.status(200).send(result);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Чтение данных. */
async function select(request, response, database) {
    try {
        const entity = request.body.entity;
        if (!entity) {
            return response.status(400).send("Необходимо поле: entity");
        }
        const filterItem = request.body.filter;
        const result = await storage.select(entity, filterItem, database);
        return response.status(200).send(result);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Обновление токена. */
async function updateRefreshToken(request, response, database) {
    const refreshToken = request.body.refreshToken;
    if (!refreshToken) {
        return response.status(403).send("Access is forbidden");
    } try {
        const newTokens = await jwt.updateTokens(refreshToken, database);
        response.send(newTokens);
    } catch (err) {
        const message = (err && err.message) || err;
        response.status(403).send(message);
    }
}
