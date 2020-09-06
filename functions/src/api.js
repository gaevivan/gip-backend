const filtering = require('./filtering');
const crypto = require('crypto');
const entities = require("./entity");
const storage = require("./storage");

module.exports = {
    auth,
    update,
    remove,
    create,
    select,
}

const tokenKey = "13.05.1993";

/** Авторизация. */
async function auth(request, response, database) {
    try {
        const login = request.body.login;
        if (!login) {
            return response.status(500).send("Необходимо поле: login");
        }
        const password = request.body.password;
        if (!password) {
            return response.status(500).send("Необходимо поле: password");
        }
        const filterItem = ["login", "=", login];
        const users = storage.select(entities.user, filterItem, database);
        if (!users.length) {
            return response.status(500).send("Нет такого пользователя.");
        }
        const user = users[0];
        if (user.password !== password) {
            return response.status(500).send("Неправильный пароль.");
        }
        let head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64')
        let body = Buffer.from(user.id).toString('base64')
        let signature = crypto
            .createHmac('SHA256', tokenKey)
            .update(`${head}.${body}`)
            .digest('base64')
        const token = `${head}.${body}.${signature}`;
        return response.status(200).send(token);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Создание данных. */
async function create(request, response, database) {
    try {
        const isAuth = await isAuthorized(request.headers, database);
        if (!isAuth) {
            return response.status(401).send();
        }
        const entity = request.body.entity;
        if (!entity) {
            return response.status(500).send("Необходимо поле: entity");
        }
        const data = request.body.data;
        if (!data) {
            return response.status(500).send("Необходимо поле: data");
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
        const isAuth = await isAuthorized(request.headers, database);
        if (!isAuth) {
            return response.status(401).send();
        }
        const entity = request.body.entity;
        if (!entity) {
            return response.status(500).send("Необходимо поле: entity");
        }
        const id = request.body.id;
        if (!id) {
            return response.status(500).send("Необходимо поле: id");
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
        const isAuth = await isAuthorized(request.headers, database);
        if (!isAuth) {
            return response.status(401).send();
        }
        const entity = request.body.entity;
        if (!entity) {
            return response.status(500).send("Необходимо поле: entity");
        }
        const id = request.body.id;
        if (!id) {
            return response.status(500).send("Необходимо поле: id");
        }
        const data = request.body.data;
        if (!data) {
            return response.status(500).send("Необходимо поле: data");
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
        const isAuth = await isAuthorized(request.headers, database);
        if (!isAuth) {
            return response.status(401).send();
        }
        const entity = request.body.entity;
        if (!entity) {
            return response.status(500).send("Необходимо поле: entity");
        }
        const filterItem = request.body.filter;
        const result = await storage.select(entity, filterItem, database);
        return response.status(200).send(result);
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
}

/** Авторизован ли пользователь. */
async function isAuthorized(headers, database) {
    const jwt = headers.jwt;
    if (!jwt) {
        return false;
    }
    const payload64 = jwt.split(".")[1];
    if (!payload64) {
        return false;
    }
    const id = new Buffer(payload64, "base64").toString("ascii");
    users = await storage.select(entities.user, ["id", "=", id], database);
    if (!users.length) {
        return false;
    }
    return true;
}


