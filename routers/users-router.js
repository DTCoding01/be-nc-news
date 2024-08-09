const usersRouter = require('express').Router();
const { 
  getUsers, 
  getUserByUsername 
} = require('../controllers/users-controller');

const {
  followTopic,
  unfollowTopic,
  followUser,
  unfollowUser,
  getUsersFollowings
} = require('../controllers/follow-controller'); 


usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUserByUsername);

usersRouter.post('/:username/follow-topic', followTopic);
usersRouter.delete('/:username/unfollow-topic/:topicSlug', unfollowTopic);


usersRouter.post('/:followerUsername/follow-user', followUser);
usersRouter.delete('/:followerUsername/unfollow-user/:followeeUsername', unfollowUser);
usersRouter.get('/:username/followings', getUsersFollowings)

module.exports = usersRouter;
