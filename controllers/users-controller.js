const {fetchUsers} = require('../models/users-models.js')

exports.getUsers = (req, res, next) => {
    fetchUsers().then(({rows}) => {
        res.status(200).send({users: rows})
    })
    .catch(next)
}