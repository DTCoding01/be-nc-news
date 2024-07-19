const { fetchTopics, addTopic } = require("../models/topics-models");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then(({ rows }) => {
      res.status(200).send({ rows });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  const topicObj = req.body
  addTopic(topicObj).then(({rows}) => {
    const topic = rows[0]
    res.status(201).send({topic})
  })
  .catch(next)
}
