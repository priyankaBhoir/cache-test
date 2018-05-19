var config = {
  production: {
    serverPORT: 3000,
    dbName: 'mongodb://localhost/cache-production',
  },
  //update According to you local setup
  default: {
    serverPORT: 3009,
    dbName: 'mongodb://localhost/cache-local?authSource=admin',
    OPTIONS: {
      user: 'dbuser',
      pass: 'mypwd',
      auth: {
        authdb: 'admin'
      }
    }
  }
  
}

exports.get = function get(env) {
  return config[env] || config.default;
}