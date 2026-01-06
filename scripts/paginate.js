const per_page = 5;

function paginate(data, page) {
    const start = (page - 1) * per_page;
    return data.slice(start, start + per_page);
};