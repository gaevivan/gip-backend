const filtering = require('./filtering');
const { v4: uuidv4 } = require('uuid');

exports.create = function(request, response, database) {
    (async () => {
        try {
            const entity = request.body.entity;
            if (!entity) {
                return response.status(500).send("Необходим entity");
            }
            const id = uuidv4();
            const document = database.collection(entity).doc(`/${id}/`);
            const data = request.body.data;
            data.id = id;
            await document.create(data);
            const result = await document.get();
            return response.status(200).send(result);
        } catch (error) {
            console.log(error);
            return response.status(500).send(error);
        }
    })();
}

exports.remove = function(request, response, database) {
    (async () => {
        try {
            const entity = request.body.entity;
            if (!entity) {
                return response.status(500).send("Необходим entity");
            }
            const id = request.body.id;
            if (!id) {
                return response.status(500).send("Необходим id");
            }
            const document = database.collection(entity).doc(id);
            const result = await document.get();
            await document.delete();
            return response.status(200).send(result);
        } catch (error) {
            console.log(error);
            return response.status(500).send(error);
        }
    })();
}

exports.update = function(request, response, database) {
    (async () => {
        try {
            const entity = request.body.entity;
            if (!entity) {
                return response.status(500).send("Необходим entity");
            }
            const id = request.body.id;
            if (!id) {
                return response.status(500).send("Необходим id");
            }
            const document = database.collection(entity).doc(id);
            const data = request.body.data;
            data.id = id;
            await document.set(data);
            const result = await document.get();
            return response.status(200).send(result);
        } catch (error) {
            console.log(error);
            return response.status(500).send(error);
        }
    })();
}

exports.select = function(request, response, database) {
    (async () => {
        try {
            const entity = request.body.entity;
            if (!entity) {
                return response.status(500).send("Необходим entity");
            }
            let query = database.collection(entity);
            let filter = request.body.filter;
            let result = [];
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const data = doc.data();
                    const selectedItem = {
                        id: doc.id,
                        ...data
                    };
                    if (filtering.filterItem(data, filter)) {
                        result.push(selectedItem);
                    }
                }
            });
            return response.status(200).send(result);
        } catch (error) {
            console.log(error);
            return response.status(500).send(error);
        }
    })();
}