var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Cache = mongoose.model('Cache');

router.get('/:key', function(req, res, next) {
  Cache.findOne({key: req.param.key}).then(function(cacheEntry) {
    console.log(cacheEntry)
    if (!cacheEntry) {
      console.log("Cache mmissed")
      return res.sendStatus(404);
    } else {
      return res.json({
        value : cacheEntry.value
      });
    }
  }).catch(next);
});

module.exports = router;
