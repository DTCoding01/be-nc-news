const db = require('../db/connection')

exports.fetchUsers = () => {
 return db.query(`SELECT username, name, avatar_url FROM users`)
}

exports.fetchUserByUsername = (username) => {
    return db.query(`SELECT username, name, avatar_url FROM users WHERE username = $1`, [username])
}