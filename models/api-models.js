const endpoints = require('../endpoints.json')

exports.fetchApi = () => {
    return new Promise((resolve) => {
        resolve(endpoints)
    })
}