const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/convertXMLActivity';
const dbName = 'convertXMLActivity';

var connMySQL = function() {
  console.log('Conexao com bd foi estabelecida');
    return new Promise(function(resolve, reject) {
       MongoClient.connect(url,{auth: {user: "writer", password: "password"},useNewUrlParser: true},async function(err, client) {
        if (!err){
            let db = await client.db(dbName);
            resolve(db)
        } else {
            reject(err);
        }
      });
    })
 };

module.exports = function() {
  return connMySQL;
};
