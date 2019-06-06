let xmldom = require('xmldom');
let xpath = require('xpath');
let prettyData = require("pretty-data");
let questionsDataTypeMap = new Map([
    ["ImageItem","String"],
    ["EmailQuestion","String"],
    ["FileUploadQuestion","Binary"],
    ["TextQuestion","String"],
    ["GridIntegerQuestion",null],
    ["AutocompleteQuestion","String"],
    ["TimeQuestion","LocalTime"],
    ["IntegerQuestion","Integer"],
    ["CalendarQuestion","LocalDate"],
    ["SingleSelectionQuestion","Integer"],
    ["TextItem","String"],
    ["PhoneQuestion","Integer"],
    ["CheckboxQuestion","Array"],
    ["DecimalQuestion","Decimal"],
    ["GridTextQuestion",null]
]);

module.exports.xmlToJson =function(application, req, res) {
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let xmlTemplate = req.files.template_XML;
    let parser = new xmldom.DOMParser();
    let SXML = prettyData.pd.xmlmin(xmlTemplate.data.toString());
    let root = parser.parseFromString(SXML, 'text/xml');

    let nodes =xpath.select('//survey', root);
    let questions = [];
    let surveyJson = {};

    nodes.forEach(function (survey) {
        surveyJson = {
            "extents": "StudioObject",
            "objectType": "Survey",
            "oid": "",
            "identity": {
                "extents": "StudioObject",
                "objectType": "SurveyIdentity",
                "name": survey.attributes.getNamedItem("title").value,
                "acronym": survey.attributes.getNamedItem("shortName").value + survey.attributes.getNamedItem("version").value,
                "recommendedTo": "",
                "description": "",
                "keywords": []
            },
            "dataSources" : [ ],
            "metainfo" : {
                "extents" : "StudioObject",
                "objectType" : "SurveyMetaInfo",
                "creationDatetime" : "2017-02-21T11:33:30.223Z",
                "otusStudioVersion" : ""
            },
        };
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
    surveyJson.itemContainer = questions;
    console.log(surveyJson)
};

function getQuestions(questions,nextSibling,header,branchNode) {
        if(nextSibling.tagName && nextSibling.tagName !== "branch" && nextSibling.tagName !== "header") {
            if (nextSibling.tagName === "basicQuestionGroup") {
                return getQuestions(questions, nextSibling.childNodes[0], header, branchNode);
            } else if (nextSibling.nextSibling) {
                questions.push(buildQuestionItem(nextSibling));
                return getQuestions(questions, nextSibling.nextSibling, header, branchNode);
            } else if (nextSibling.parentNode.tagName === "basicQuestionGroup" && nextSibling.parentNode.nextSibling) {
                questions.push(buildQuestionItem(nextSibling));
                return getQuestions(questions, nextSibling.parentNode.nextSibling, header, branchNode);
            }
        }
        return questions
}

function buildQuestionItem(question){
    let objectType = "";
    if(question.tagName === "numericQuestion" ){
        objectType = (question.attributes.getNamedItem("decimalNumber") && question.attributes.getNamedItem("decimalNumber").nodeValue === "false") ? "IntegerQuestion" : "DecimalQuestion"
    } else if(question.tagName === "textQuestion"){
        objectType = "TextQuestion"
    } else if(question.tagName === "singleSelectionQuestion"){
        objectType = "SingleSelectionQuestion";
    } else if(question.tagName === "autocompleteQuestion"){
        objectType = "AutocompleteQuestion";
    } else if(question.tagName === "dateQuestion"){
        objectType = "CalendarQuestion";
    } else {
        objectType=question.tagName;
    }

    return {
        "fillingRules": buildFillingRules(question),
        "extents" : "SurveyItem",
        "objectType" : objectType,
        "templateID" : question.attributes.getNamedItem("id").nodeValue,
        "customID" : question.attributes.getNamedItem("id").nodeValue,
        "QuestionName" : question.attributes.getNamedItem("name").nodeValue,
        "dataType" : questionsDataTypeMap.get(objectType)
    }
}

function buildFillingRules(question){
    let fillingRules = {
        "extends" : "StudioObject",
        "objectType" : "FillingRules",
        "options" : {}
    };

    fillingRules.options.mandatory = {
        "extends": "StudioObject",
        "objectType": "Rule",
        "validatorType": "mandatory",
        "data": {
            "canBeIgnored": false,
            "reference": true
        }
    };

    let maxLength = question.attributes.getNamedItem("maxLength");
    if(maxLength){
        fillingRules.options.upperLimit = {
            "data" : {
                "reference" : Number(maxLength.value),
                "canBeIgnored" : false
            },
            "extends" : "StudioObject",
            "objectType" : "Rule",
            "validatorType" : "maxLength"
        }
    }

    let minLength = question.attributes.getNamedItem("minLength");
    if(maxLength){
        fillingRules.options.upperLimit = {
            "data" : {
                "reference" : Number(minLength.value),
                "canBeIgnored" : false
            },
            "extends" : "StudioObject",
            "objectType" : "Rule",
            "validatorType" : "maxLength"
        }
    }

    let lowerLimit = question.attributes.getNamedItem("lowerLimit");
    if(lowerLimit){
        fillingRules.options.upperLimit = {
            "extends": "StudioObject",
            "objectType": "Rule",
            "validatorType": "lowerLimit",
            "data": {
                "canBeIgnored": true,
                "reference": Number(lowerLimit.value),
            }
        }
    }

    return fillingRules;
}

function fixString(string){
    string = string.replace(/([[][/]i])([/]i])/g, "</i>","<i>");
    return string;
}