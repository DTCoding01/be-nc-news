const db = require("../db/connection.js");

exports.removeCommentById = (comment_id) => {
  return db.query(
    `DELETE FROM comments
     WHERE comment_id = $1`,
    [comment_id]
  );
};
