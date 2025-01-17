const fs = require('fs');

const readData = () => {
    if (fs.existsSync('orders.json')) {
        const data = fs.readFileSync('orders.json');
        return JSON.parse(data);
    }
    return [];
};

const writeData = (data) => {
    fs.writeFileSync('orders.json', JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
