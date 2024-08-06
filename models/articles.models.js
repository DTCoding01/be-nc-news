const db = require("../db/connection.js");

exports.fetchArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  p = 1
) => {
  const allowedSortByInputs = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    'comment_count'
  ];

  const allowedOrderInputs = ["ASC", "DESC"];

  if (
    !allowedSortByInputs.includes(sort_by) ||
    !allowedOrderInputs.includes(order.toUpperCase())
  ) {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }

  const offset = (p - 1) * limit;
  const queryValues = [limit, offset];

  let queryStr = `
    SELECT
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id `;

  let totalCountQuery = `
    SELECT COUNT(*) AS total_count
    FROM articles`;

  if (topic) {
    queryStr += `WHERE articles.topic = $3 `;
    queryValues.push(topic);
    totalCountQuery += ` WHERE topic = $1`;
  }

  queryStr += `GROUP BY 
    articles.article_id
  ORDER BY ${sort_by} ${order.toUpperCase()}
  LIMIT $1 OFFSET $2`;

  return db
    .query(totalCountQuery, topic ? [topic] : [])
    .then((totalCountResult) => {
      return Promise.all([db.query(queryStr, queryValues), totalCountResult]);
    })
    .then(([articlesResult, totalCountResult]) => {
      return {
        articles: articlesResult.rows,
        total_count: parseInt(totalCountResult.rows[0].total_count, 10),
      };
    });
};

exports.fetchArticleById = (article_id) => {
  return db.query(
    `SELECT 
       articles.*,
       COUNT(comments.comment_id) AS comment_count
     FROM articles
     LEFT JOIN comments ON articles.article_id = comments.article_id
     WHERE articles.article_id = $1
     GROUP BY articles.article_id`,
    [article_id]
  );
};

exports.fetchArticleCommentsById = (article_id, limit, p) => {
  let queryStr = `
    SELECT 
      comments.comment_id, 
      comments.votes, 
      comments.created_at, 
      comments.author, 
      comments.body,
      comments.article_id
    FROM comments
    WHERE comments.article_id = $1
    ORDER BY comments.created_at DESC
  `;

  const queryValues = [article_id];

  if (limit && p) {
    queryStr += ` LIMIT $2 OFFSET $3`;
    const offset = (p - 1) * limit;
    queryValues.push(limit, offset);
  }

  return db.query(queryStr, queryValues);
};

exports.addCommentToArticleId = (comment, article_id) => {
  const { username, body } = comment;

  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "invalid comment input" });
  }

  return db.query(
    `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
    [username, body, article_id]
  );
};

exports.updateArticleById = (article_id, voteObj) => {
  const { inc_votes } = voteObj;
  if (!inc_votes || typeof inc_votes != "number") {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }
  return db.query(
    `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
    [inc_votes, article_id]
  );
};

exports.addArticle = (article) => {
  const { author, title, body, topic, article_img_url } = article;

  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }

  const queryParams = [author, title, body, topic];
  let queryStr = `
  WITH inserted_article AS (
    INSERT INTO articles (author, title, body, topic`;

  if (article_img_url) {
    queryStr += `, article_img_url) VALUES ($1, $2, $3, $4, $5)`;
    queryParams.push(article_img_url);
  } else {
    queryStr += `) VALUES ($1, $2, $3, $4)`;
  }

  queryStr += ` RETURNING article_id, author, title, body, topic, article_img_url, votes, created_at
  )
  SELECT 
    inserted_article.*,
    COUNT(comments.comment_id) AS comment_count
  FROM inserted_article
  LEFT JOIN comments ON inserted_article.article_id = comments.article_id
  GROUP BY 
    inserted_article.article_id,
    inserted_article.author,
    inserted_article.title,
    inserted_article.body,
    inserted_article.topic,
    inserted_article.article_img_url,
    inserted_article.votes,
    inserted_article.created_at`;

  return db.query(queryStr, queryParams);
};

exports.removeArticleById = (article_id) => {
  return db.query("DELETE FROM articles WHERE article_id = $1", [article_id]);
};

exports.removeCommentsByArticleId = (article_id) => {
  return db.query("DELETE FROM comments WHERE article_id = $1", [article_id]);
};
