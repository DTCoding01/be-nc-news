const {
  followTopicInDB,
  unfollowTopicInDB,
  followUserInDB,
  unfollowUserInDB,
  checkUserExists,
  checkTopicExists,
} = require("../models/follow-model");

exports.followTopic = (req, res, next) => {
  const { username } = req.params;
  const { topicSlug } = req.body;

  console.log(`Attempting to follow topic: ${topicSlug} by user: ${username}`);

  if (!username || !topicSlug) {
    return res.status(400).send({ msg: "invalid input" });
  }

  Promise.all([checkUserExists(username), checkTopicExists(topicSlug)])
    .then(([userExists, topicExists]) => {
      if (!userExists) {
        return Promise.reject({ status: 404, msg: "user not found" });
      }
      if (!topicExists) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      }
      return followTopicInDB(username, topicSlug);
    })
    .then(() => {
      console.log(
        `Successfully followed topic: ${topicSlug} by user: ${username}`
      );
      res
        .status(200)
        .send({ msg: `User ${username} followed topic ${topicSlug}` });
    })
    .catch((err) => {
      console.error("Error in followTopic:", err);
      next(err);
    });
};

exports.unfollowTopic = (req, res, next) => {
  const { username } = req.params;
  const { topicSlug } = req.body;

  if (!username || !topicSlug) {
    return res.status(400).send({ msg: "invalid input" });
  }

  Promise.all([checkUserExists(username), checkTopicExists(topicSlug)])
    .then(([userExists, topicExists]) => {
      if (!userExists) {
        return Promise.reject({ status: 404, msg: "user not found" });
      }
      if (!topicExists) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      }
      return unfollowTopicInDB(username, topicSlug);
    })
    .then(() => {
      res
        .status(200)
        .send({ msg: `User ${username} unfollowed topic ${topicSlug}` });
    })
    .catch(next);
};

exports.followUser = (req, res, next) => {
  const { followerUsername } = req.params;
  const { followeeUsername } = req.body;

  if (!followerUsername || !followeeUsername) {
    return res.status(400).send({ msg: "invalid input" });
  }

  Promise.all([
    checkUserExists(followerUsername),
    checkUserExists(followeeUsername),
  ])
    .then(([followerExists, followeeExists]) => {
      if (!followerExists || !followeeExists) {
        return Promise.reject({ status: 404, msg: "user not found" });
      }
      if (followerUsername === followeeUsername) {
        return Promise.reject({
          status: 400,
          msg: "A user cannot follow themselves.",
        });
      }
      return followUserInDB(followerUsername, followeeUsername);
    })
    .then(() => {
      res
        .status(200)
        .send({
          msg: `User ${followerUsername} followed user ${followeeUsername}`,
        });
    })
    .catch(next);
};

exports.unfollowUser = (req, res, next) => {
  const { followerUsername } = req.params;
  const { followeeUsername } = req.body;

  if (!followerUsername || !followeeUsername) {
    return res.status(400).send({ msg: "invalid input" });
  }

  Promise.all([
    checkUserExists(followerUsername),
    checkUserExists(followeeUsername),
  ])
    .then(([followerExists, followeeExists]) => {
      if (!followerExists || !followeeExists) {
        return Promise.reject({ status: 404, msg: "user not found" });
      }
      return unfollowUserInDB(followerUsername, followeeUsername);
    })
    .then(() => {
      res
        .status(200)
        .send({
          msg: `User ${followerUsername} unfollowed user ${followeeUsername}`,
        });
    })
    .catch(next);
};
