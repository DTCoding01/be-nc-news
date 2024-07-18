const {
  fetchUsers,
  fetchUserByUsername,
} = require("../models/users-models.js");

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then(({ rows }) => {
      res.status(200).send({ users: rows });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      const user = rows[0];
      res.status(200).send({ user });
    })
    .catch(next);
};
