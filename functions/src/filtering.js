exports.compare = function(data, filter) {
    const [key, operation, value] = filter; 
    if (operation === "=") {
        return data[key] === value;
    } else if (operation === "!=" || operation === "<>") {
        return data[key] !== value;
    }
    return true;
}

exports.filterItem = function(data, filter) {
    if (!filter) {
        return true;
    }
    if (filter.length > 2 && filter[1] === "and") {
        return filterItem(data, filter[0]) && filterItem(data, filter[2]);
    } else if (filter.length > 2 && filter[1] === "or") {
        return filterItem(data, filter[0]) || filterItem(data, filter[2])
    } else {
        return compare(data, filter);
    }
}