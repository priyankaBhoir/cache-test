var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var CacheSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true },
  value: String,
  TTL: Date
}, {timestamps: true});

// CacheSchema  plugin(uniqueValidator, {message: 'is already taken'});

// on every save, add the date
CacheSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.TTL = currentDate;
  next();
});

CacheSchema.methods.toJSONFor = function(user){
  return {
    key: this.key,
    value: this.value
  };
};

mongoose.model('Cache', CacheSchema);

