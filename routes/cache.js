var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const Cache = mongoose.model('Cache');
const randomstring = require("randomstring");


router.get('/', function(req, res, next) {
  Cache.find({}, {'cacheKey': 1}).lean().then(function(cacheEntries) {
      return res.json({
        allKeys : cacheEntries.map(entry => entry.cacheKey)
      });
  }).catch(next);
});

/**
 * returns a value for key from cache
 */
router.get('/:cacheKey', function(req, res, next) {
  Cache.findOne({"cacheKey": req.params.cacheKey}).then(function(cacheEntry) {
    if (!cacheEntry) {
      console.log("Cache missed");

      const str = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
      })
      let cacheE = new Cache();
      cacheE.cacheKey = req.params.cacheKey;
      cacheE.value = str;
      return cacheE.save().then(function(){
        return res.json({value : str});
      });
    } else {
      console.log("Cache hit");
      return res.json({
        value : cacheEntry.value
      });
    }
  }).catch(next);
});

router.post('/', function(req, res, next) {
  let cacheE = new Cache();
  cacheE.cacheKey = req.body.key;
  cacheE.value = req.body.value;
  return cacheE.save().then(function(){
    return res.json({value : req.body.value, key: req.body.key});
  }).catch(next);
});

router.put("/:cacheKey", function(req, res, next) {
  console.log(req.params.cacheKey, req.body.value)

  Cache.findOne({"cacheKey": req.params.cacheKey}).then(function(cacheEntry) {
    if (!cacheEntry) {
      res.error("not found");
    } else {
      cacheEntry.value = req.body.value;
      return cacheEntry.save().then(function(){
        return res.json({value : req.body.value});
      }).catch(next);
    }
  }).catch(next);
});

router.delete("/:cacheKey", function(req, res, next) {
  console.log(req.params.cacheKey, req.body.value)
   Cache.remove({"cacheKey": req.params.cacheKey}).then(function() {
    return res.json({
      success : true
    });
  }).catch(next);
});

router.delete("/", function(req, res, next) {
   Cache.remove().then(function() {
    return res.json({
      success : true
    });
  }).catch(next);
});

module.exports = router;
