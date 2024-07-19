const db = require("../db/connection.js");

exports.removeCommentById = (comment_id) => {
  return db.query(
    `DELETE FROM comments
     WHERE comment_id = $1`,
    [comment_id]
  );
};

exports.updateCommentById = (comment_id, voteObj) => {
  const { inc_votes } = voteObj;
  if (!inc_votes || typeof inc_votes != "number") {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }
  return db.query(
    `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *`,
    [inc_votes, comment_id]
  );
}
