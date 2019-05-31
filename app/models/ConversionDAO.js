function ConversionDAO(connection) {
  this._connection = connection;
}

ConversionDAO.prototype.saveXMLInJson = function(jsonXML, callback) {
  this._connection.collection("XML").insert(JSON.parse(jsonXML),function(err, result) {
    callback(result);
  });
};

ConversionDAO.prototype.buildModel = function(oid, callback) {
  this._connection.collection("XML").aggregate({ $project : {
      _id : 1
    }},
      {$group:{_id:"$_id"}},function(err, result) {
    callback(result);

  });
};

module.exports = function() {
  return ConversionDAO;
};
