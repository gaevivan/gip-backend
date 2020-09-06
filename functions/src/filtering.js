module.exports = {
    compare,
    filter
}

function compare(data, filter) {
    const [key, operation, value] = filter; 
    if (operation === "=") {
        return data[key] === value;
    } else if (operation === "!=" || operation === "<>") {
        return data[key] !== value;
    }
    return true;
}

function filter(dataItem, filterItem) {
    if (!filterItem) {
        return true;
    }
    if (filterItem.length > 2 && filterItem[1] === "and") {
        return filter(dataItem, filterItem[0]) && filter(dataItem, filterItem[2]);
    } else if (filterItem.length > 2 && filterItem[1] === "or") {
        return filter(dataItem, filterItem[0]) || filter(dataItem, filterItem[2])
    } else {
        return this.compare(dataItem, filterItem);
    }
}
