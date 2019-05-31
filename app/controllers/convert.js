let parser = require('xml2json');
let ObjectID = require('mongodb').ObjectID;
let xmldom = require('xmldom');
let xpath = require('xpath');

module.exports.xmlToJson =function(application, req, res) {
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let xmlTemplate = req.files.template_XML;
    let options = {
        reversible: true
    };
    let parser = new xmldom.DOMParser();

    let root = parser.parseFromString(xmlTemplate.data.toString(), 'text/xml');

    let nodes =xpath.select('//survey', root);
    let survey = {};
    nodes.forEach(function (survey) {
        let surveyLength = survey.childNodes.length;
        for(let i =0; i < surveyLength; i++){
            console.log(survey.childNodes[i].tagName);
            let tagName = survey.childNodes[i].tagName;
            if (tagName === "metaDataGroup"){

            } else if (tagName === "choiceGroup") {

            } else if (tagName === "questionPage") {
                let questionPageLength = survey.childNodes[i].childNodes.length;
                for(let j =0; j < questionPageLength; j++) {
                    let header = "";
                    if (tagName === "header"){
                        header = survey.childNodes[i].childNodes[j].firstChild.data;
                    } else if(tagName === "branch") {

                    }

                    console.log(survey.childNodes[i].childNodes[j])
                }
            }
        }
    });


    // let json = parser.toJson(xmlTemplate,options);
    // let connection = application.config.dbConnection();
    // connection.then(function(db) {
    //     f(db,json);
    // }, function(err) {
    //     console.log(err);
    // });
    //
    //
    //
    // function f(db,json) {
    //     let convertModel = new application.app.models.ConversionDAO(db);
    //     convertModel.saveXMLInJson(json, function(result) {
    //         let oid = new ObjectID(result.insertedIds[0].id);
    //         convertModel.buildModel(oid,function (result) {
    //             result.forEach(elements=> {
    //                 console.log(elements);
    //             });
    //             res.redirect('/');
    //         })
    //     });
    // }
};
