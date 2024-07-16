const { removeCommentById } = require("../models/comments-models.js");
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
