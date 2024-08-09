const db = require('../db/connection');

exports.followTopicInDB = (username, topicSlug) => {
  return db.query(
    `INSERT INTO user_follows_topics (username, topic_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
    [username, topicSlug]
  );
};

exports.unfollowTopicInDB = (username, topicSlug) => {
  return db.query(
    `DELETE FROM user_follows_topics WHERE username = $1 AND topic_slug = $2;`,
    [username, topicSlug]
  );
};

exports.followUserInDB = (followerUsername, followeeUsername) => {
  return db.query(
    `INSERT INTO user_follows_users (follower_username, followee_username) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
    [followerUsername, followeeUsername]
  );
};

exports.unfollowUserInDB = (followerUsername, followeeUsername) => {
  return db.query(
    `DELETE FROM user_follows_users WHERE follower_username = $1 AND followee_username = $2;`,
    [followerUsername, followeeUsername]
  );
};

exports.checkUserExists = (username) => {
  return db.query('SELECT * FROM users WHERE username = $1;', [username])
    .then((result) => {
      return result.rows.length > 0;
    });
};

exports.checkTopicExists = (topicSlug) => {
  return db.query('SELECT * FROM topics WHERE slug = $1;', [topicSlug])
    .then((result) => {
      return result.rows.length > 0;
    });
};

exports.fetchUserFollowings = (username) => {
  return Promise.all([
    db.query(
      `SELECT topic_slug FROM user_follows_topics WHERE username = $1;`,
      [username]
    ),
    db.query(
      `SELECT followee_username FROM user_follows_users WHERE follower_username = $1;`,
      [username]
    )
  ]).then(([topicsResult, usersResult]) => {
    return {
      topics: topicsResult.rows.map(row => row.topic_slug),
      users: usersResult.rows.map(row => row.followee_username),
    };
  });
};
