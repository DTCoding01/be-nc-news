const { removeCommentById, updateCommentById } = require("../models/comments-models.js");
const { checkCommentExists } = require("../utils.js");

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  checkCommentExists(comment_id)
    .then(() => {
      return removeCommentById(comment_id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const votes = req.body
  const {comment_id} = req.params

  updateCommentById(comment_id, votes).then(({rows}) => {
    if (rows.length === 0) {
      return Promise.reject({status: 404, msg: "not found"})
    }
    const comment = rows[0]
    res.status(200).send({comment})
  }).catch(next)
}
