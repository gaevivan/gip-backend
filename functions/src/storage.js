const { v4: uuidv4 } = require('uuid');
const filtering = require('./filtering');

module.exports = {
    select,
    update,
    remove,
    create
}

/** Чтение данных. */
async function select(entity, filterItem, database) {
    let query = database.collection(entity);
    let result = [];
    await query.get().then(querySnapshot => {
        let docs = querySnapshot.docs;
        for (let doc of docs) {
            const dataItem = doc.data();
            const selectedItem = {
                id: doc.id,
                ...dataItem
            };
            if (filtering.filter(dataItem, filterItem)) {
                result.push(selectedItem);
            }
        }
    });
    return result;
}

/** Обновление данных. */
async function update(entity, id, data, database) {
    const document = database.collection(entity).doc(id);
    await document.set(data);
    const result = await document.get();
    return result;
}

/** Удаление данных. */
async function remove(entity, id, database) {
    const document = database.collection(entity).doc(id);
    const result = await document.get();
    await document.delete();
    return result;
}

/** Создание данных. */
async function create(entity, data, database) {
    const id = uuidv4();
    const document = database.collection(entity).doc(`/${id}/`);
    data.id = id;
    await document.create(data);
    const result = await document.get();
    return result;
}