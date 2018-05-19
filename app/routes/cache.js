var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const Cache = mongoose.model('Cache');
const randomstring = require("randomstring");
const config = require('../constant/constant');


router.get('/allKeys', function(req, res, next) {
  Cache.find({}, {'cacheKey': 1}).lean().then(function(cacheEntries) {
      return res.json({
        allKeys : cacheEntries.map(entry => entry.cacheKey)
      });
  }).catch(errorHandler(res));
});

/**
 * returns a value for key from cache
 */
router.get('/:cacheKey', function(req, res, next) {
  Cache.findOne({"cacheKey": req.params.cacheKey}).then(function(cacheEntry) {
    if (!cacheEntry) {
      console.log("Cache missed");
      let cacheE = new Cache();
      cacheE.cacheKey = req.params.cacheKey;
      return saveWithRandomValue(cacheE)
        .then(newValue => res.json({ value : newValue}))
        .catch(errorHandler(res));
    } else {
      console.log("Cache hit");
      return validateTTL(cacheEntry)
        .then(validatedEntry => res.json({ value : validatedEntry.value}))
        .catch(errorHandler(res));
    }
  }).catch(errorHandler(res));
});

router.post('/', function(req, res, next) {
  let cacheE = new Cache();
  cacheE.cacheKey = req.body.key;
  cacheE.value = req.body.value;
  return validateCacheLimit()
    .then(() => cacheE.save())
    .then(() => res.json({value : req.body.value, key: req.body.key}))
    .catch(errorHandler(res));
});

router.put("/:cacheKey", function(req, res, next) {
  Cache.findOne({"cacheKey": req.params.cacheKey}).then(function(cacheEntry) {
    if (!cacheEntry) {
     res.status(404).send("not found");
    } else {
      cacheEntry.value = req.body.value;
      return cacheEntry.save().then(function(){
        return res.json({value : req.body.value});
      }).catch(errorHandler(res));
    }
  }).catch(errorHandler(res));
});

router.delete("/:cacheKey", function(req, res, next) {
   Cache.remove({"cacheKey": req.params.cacheKey}).then(function() {
    return res.json({
      success : true
    });
  }).catch(errorHandler(res));
});

router.delete("/", function(req, res, next) {
   Cache.remove().then(function() {
    return res.json({
      success : true
    });
  }).catch(errorHandler(res));
});

module.exports = router;

//========================
function validateCacheLimit(key) {
  //get cache entries in sorted order. and delete old entries if cache exceeds limit;
  return Cache.find({'cacheKey': {$ne : key}}, {}, { sort: { 'TTL' : -1 }})
    .then(function(allentries) {
      if(allentries.length >= config.MAX_CACHE_ENTRIES) {
        console.log("cache overflowing")
        let boundryEntry = allentries[config.MAX_CACHE_ENTRIES - 2];
        return Cache.remove({ TTL : {"$lt" : boundryEntry.TTL } }).then(arr => {
          return true;
        })
      } else {
        return true;
      }
    });
}

function saveWithRandomValue(cacheE) {
  const str = randomstring.generate({
    length: 12,
    charset: 'alphabetic'
  })
  cacheE.value = str;
  return validateCacheLimit(cacheE.cacheKey)
    .then(() => cacheE.save())
    .then(() => str)
}

function validateTTL(cache) {
  return  new Promise(function(resolve, reject) {
    let TTL = new Date(cache.TTL).getTime();
    let currentTime = new Date().getTime();
    if(TTL < currentTime) {
      console.log("TTL exceeds")
      saveWithRandomValue(cache)
        .then((value) => {
          cache.value = value;
          resolve(cache)
        })
        .catch(() => reject("Failed Validating TTL"))
    } else {
      resolve(cache);
    }
  });
}

function errorHandler(res) {
  return (error) => res.status(500).send(error.errmsg)
}