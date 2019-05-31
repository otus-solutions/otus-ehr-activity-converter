module.exports = function(application) {
  application.get('/', function(req, res) {
    application.app.controllers.home.index(application, req, res);
  });

  application.post('/convert', function(req, res) {
    application.app.controllers.convert.xmlToJson(application, req, res);
  });
};
