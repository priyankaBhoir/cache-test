# Cache manager

# Install
```sh
$ cd path/to/cache-manager
$ npm install -d
```
update db configurations in /config if required

# Start
```sh
$ npm start
```

# APIs 

APIs which are supported by system

* create new entry
```
  curl -X POST -d value=value_update -d key=kay1 localhost:3009/cache/
```

* update entry
``` 
  curl -X PUT -d value=priyanka localhost:3009/cache/kay1
```

* get entry
```
  curl -X GET  localhost:3009/cache/kay1
 ```

* get all keys
``` 
  curl -X GET  localhost:3009/cache/allKeys
```

* remove key
```
curl -X DELETE localhost:3009/cache/kay1
```