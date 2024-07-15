const {fetchApi} = require('../models/api-models')

exports.getApi = (req, res, next) => {
    fetchApi()
    .then((response) => {
      res.status(200).send({ response });
    })
    .catch(next);
}

