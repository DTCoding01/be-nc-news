const db = require("../db/connection.js");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics`);
};

exports.addTopic = (topicObj) => {
  const { slug, description } = topicObj;
  if (!slug || !description) {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }

  return db.query(
    `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`,
    [slug, description]
  );
};
