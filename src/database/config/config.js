require('dotenv').config()
module.exports={
  "development": {
      "username": "b0ce2c4eb0499f",
  "password": "5a1e9112",
  "database": "heroku_d395cdae7c166d3",
  "host":"us-cdbr-east-03.cleardb.com" ,
  "dialect": "mysql"

  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "b0ce2c4eb0499f",
    "password": "5a1e9112",
    "database": "heroku_d395cdae7c166d3",
    "host":"us-cdbr-east-03.cleardb.com" ,
    "dialect": "mysql"
   }
}
