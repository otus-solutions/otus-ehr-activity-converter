let parser = require('xml2json');
let ObjectID = require('mongodb').ObjectID;
let xmldom = require('xmldom');
let xpath = require('xpath');
var prettyData = require("pretty-data")

module.exports.xmlToJson =function(application, req, res) {
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let xmlTemplate = req.files.template_XML;
    let options = {
        reversible: true
    };
    let parser = new xmldom.DOMParser();
    let SXML = prettyData.pd.xmlmin(xmlTemplate.data.toString());
    let root = parser.parseFromString(SXML, 'text/xml');

    let nodes =xpath.select('//survey', root);
    let survey = {};
    let questions = [];
    nodes.forEach(function (survey) {
        let surveyLength = survey.childNodes.length;
        for(let i =0; i < surveyLength; i++){
            let tagName = survey.childNodes[i].tagName;
            if (tagName === "metaDataGroup"){

            } else if (tagName === "choiceGroup") {

            } else if (tagName === "questionPage") {
                let header = survey.childNodes[i].childNodes[0].tagName === "header" ? survey.childNodes[i].childNodes[0].firstChild.data : "";
                let branchNode = survey.childNodes[i].childNodes[survey.childNodes[i].childNodes.length-1].tagName === "branch" ? survey.childNodes[i].childNodes[survey.childNodes[i].childNodes.length-1] : null;
                let startNode = 0;
                if(header !== ""){
                    startNode = 1;
                }
                questions = getQuestions(questions,survey.childNodes[i].childNodes[startNode],header,branchNode);
                console.log(questions)
            }
        }
    });
    console.log(questions)
};

function getQuestions(questions,nextSibling,header,branchNode) {
        if(nextSibling.tagName && nextSibling.tagName !== "branch" && nextSibling.tagName !== "header") {
            questions.push(nextSibling.tagName);
            if (nextSibling.tagName === "basicQuestionGroup") {
                return getQuestions(questions, nextSibling.childNodes[0], header, branchNode);
            } else if (nextSibling.nextSibling) {
                return getQuestions(questions, nextSibling.nextSibling, header, branchNode);
            } else if (nextSibling.parentNode.tagName === "basicQuestionGroup" && nextSibling.parentNode.nextSibling) {
                return getQuestions(questions, nextSibling.parentNode.nextSibling, header, branchNode);
            }
        }
        return questions
}
