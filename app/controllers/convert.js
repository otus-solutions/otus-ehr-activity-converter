var parser = require('xml2json');
let ObjectID = require('mongodb').ObjectID;
module.exports.xmlToJson =function(application, req, res) {
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let xmlTemplate = req.files.template_XML.data;
    var json = parser.toJson(xmlTemplate);
    let connection = application.config.dbConnection();
    connection.then(function(db) {
        f(db,json);
    }, function(err) {
        console.log(err);
    });



    function f(db,json) {
        let convertModel = new application.app.models.ConversionDAO(db);
        convertModel.saveXMLInJson(json, function(result) {
            let oid = new ObjectID(result.insertedIds[0].id);
            convertModel.buildModel(oid,function (result) {
                result.forEach(elements=> {
                    console.log(elements);
                })
                // res.redirect('/');
            })
        });
    }
};
