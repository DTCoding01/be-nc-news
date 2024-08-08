const usersRouter = require('express').Router();
const { 
  getUsers, 
  getUserByUsername 
} = require('../controllers/users-controller');

const {
  followTopic,
  unfollowTopic,
  followUser,
  unfollowUser
} = require('../controllers/follow-controller'); 


usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUserByUsername);

usersRouter.post('/:username/follow-topic', followTopic);
usersRouter.delete('/:username/unfollow-topic', unfollowTopic);

usersRouter.post('/:followerUsername/follow-user', followUser);
usersRouter.delete('/:followerUsername/unfollow-user', unfollowUser);

module.exports = usersRouter;
