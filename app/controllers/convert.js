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
let choiceGroup;
module.exports.xmlToJson =function(application, req, res) {

    choiceGroup = new Map();

    if (!req.files || !req.files.template_XML) {
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
            if (tagName === "choiceGroup") {
                choiceGroup.set(survey.childNodes[i].attributes.getNamedItem("id").nodeValue,buildChoiceGroup(survey.childNodes[i]));
            } else if (tagName === "questionPage") {
                let header = survey.childNodes[i].childNodes[0].tagName === "header" ? survey.childNodes[i].childNodes[0].firstChild.data : "";
                let branchNode = survey.childNodes[i].childNodes[survey.childNodes[i].childNodes.length-1].tagName === "branch" ? survey.childNodes[i].childNodes[survey.childNodes[i].childNodes.length-1] : null;
                let startNode = 0;
                if(header !== ""){
                    startNode = 1;
                }
                questions = getQuestions(questions,survey.childNodes[i].childNodes[startNode],header,branchNode);
            }
        }
    });
    surveyJson.itemContainer = questions;
    res.status(200).render("home/index");
};

function buildChoiceGroup(ehrChoiceGroup) {
    let choiceGroup = [];
    let ehrChoiceGroupLength = ehrChoiceGroup.childNodes.length - 1;
    for(let i = 0; i < ehrChoiceGroupLength; i++){
        choiceGroup.push({
            "extents" : "StudioObject",
            "objectType" : "AnswerOption",
            "dataType" : "Integer",
            "label" : {
                "ptBR" : {
                    "extends" : "StudioObject",
                        "objectType" : "Label",
                        "oid" : "",
                        "plainText" : ehrChoiceGroup.childNodes[i].attributes.getNamedItem("label").nodeValue,
                        "formattedText" : ehrChoiceGroup.childNodes[i].attributes.getNamedItem("label").nodeValue
                },
                "enUS" : {
                    "extends" : "StudioObject",
                        "objectType" : "Label",
                        "oid" : "",
                        "plainText" : "",
                        "formattedText" : ""
                },
                "esES" : {
                    "extends" : "StudioObject",
                        "objectType" : "Label",
                        "oid" : "",
                        "plainText" : "",
                        "formattedText" : ""
                }
            },
                "value" : i+1,
                "extractionValue" : ehrChoiceGroup.childNodes[i].attributes.getNamedItem("value").nodeValue
            })
    }

    return choiceGroup
}

function getQuestions(questions,nextSibling,header,branchNode) {
        if(nextSibling.tagName && nextSibling.tagName !== "branch" && nextSibling.tagName !== "header") {
            if (nextSibling.tagName === "basicQuestionGroup") {
                return getQuestions(questions, nextSibling.childNodes[0], header, branchNode);
            }

            if (nextSibling.tagName === "booleanQuestion") {
                let lastQuestionPosition = questions.length-1;
                if(questions.length > 0 && questions[lastQuestionPosition].objectType === "CheckboxQuestion"){
                    questions[lastQuestionPosition].options.push(buildOptionStructure(nextSibling));
                } else {
                    questions.push(buildQuestionItem(nextSibling));
                }
            } else {
                questions.push(buildQuestionItem(nextSibling));
            }

            if (nextSibling.nextSibling) {
                return getQuestions(questions, nextSibling.nextSibling, header, branchNode);
            } else if (nextSibling.parentNode.tagName === "basicQuestionGroup" && nextSibling.parentNode.nextSibling) {
                return getQuestions(questions, nextSibling.parentNode.nextSibling, header, branchNode);
            }
        }
        return questions
}

function buildOptionStructure(option) {
    return {
        "extents": "StudioObject",
        "objectType": "CheckboxAnswerOption",
        "optionID": option.attributes.getNamedItem("id").nodeValue,
        "customOptionID": option.attributes.getNamedItem("id").nodeValue,
        "dataType": "Boolean",
        "label": {
            "ptBR": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": fixString(option.attributes.getNamedItem("label").nodeValue),
                "formattedText": fixString(option.attributes.getNamedItem("label").nodeValue)
            },
            "enUS": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            },
            "esES": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            }
        }
    }
}

function buildQuestionItem(question){
    let questionItem = {};
    questionItem.objectType = "";
    questionItem.label = buildQuestionLabel(question);
    questionItem.metadata = {
        "extents": "StudioObject",
            "objectType": "MetadataGroup",
            "options": []
    };
    if (question.attributes.getNamedItem("metaDataGroupId")){
        questionItem.metadata.options = [{"extends":"StudioObject","objectType":"MetadataAnswer","dataType":"Integer","value":1,"extractionValue":".Q","label":{"ptBR":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"Não quer responder","formattedText":"Não quer responder"},"enUS":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""},"esES":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""}}},{"extends":"StudioObject","objectType":"MetadataAnswer","dataType":"Integer","value":2,"extractionValue":".S","label":{"ptBR":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"Não sabe","formattedText":"Não sabe"},"enUS":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""},"esES":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""}}},{"extends":"StudioObject","objectType":"MetadataAnswer","dataType":"Integer","value":3,"extractionValue":".A","label":{"ptBR":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"Não se aplica","formattedText":"Não se aplica"},"enUS":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""},"esES":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""}}},{"extends":"StudioObject","objectType":"MetadataAnswer","dataType":"Integer","value":4,"extractionValue":".F","label":{"ptBR":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"Não há dados","formattedText":"Não há dados"},"enUS":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""},"esES":{"extends":"StudioObject","objectType":"Label","oid":"","plainText":"","formattedText":""}}}]
    }
    questionItem.fillingRules = buildFillingRules(question);
    questionItem.extents = "SurveyItem";
    questionItem.templateID = question.attributes.getNamedItem("id").nodeValue;
    questionItem.customID = question.attributes.getNamedItem("id").nodeValue;
    questionItem.QuestionName = question.attributes.getNamedItem("name").nodeValue;

    if(question.tagName === "numericQuestion" ){
        questionItem.objectType = (question.attributes.getNamedItem("decimalNumber") && question.attributes.getNamedItem("decimalNumber").nodeValue === "false") ? "IntegerQuestion" : "DecimalQuestion"
    } else if(question.tagName === "textQuestion"){
        questionItem.objectType = "TextQuestion"
    } else if(question.tagName === "singleSelectionQuestion"){
        questionItem.options = choiceGroup.get(question.attributes.getNamedItem("choiceGroupId").nodeValue);
        questionItem.objectType = "SingleSelectionQuestion";
    } else if(question.tagName === "autocompleteQuestion"){
        questionItem.objectType = "AutocompleteQuestion";
    } else if(question.tagName === "dateQuestion"){
        questionItem.objectType = "CalendarQuestion";
    }else if(question.tagName === "booleanQuestion"){
        questionItem.objectType = "CheckboxQuestion";
        questionItem.label = "";
        questionItem.options = [];
        questionItem.options.push(buildOptionStructure(question));
        questionItem.templateID ="CheckboxQuestion" + questionItem.templateID;
        questionItem.customID = "CheckboxQuestion" + questionItem.customID;

    } else {
        questionItem.objectType=question.tagName;
    }

    questionItem.dataType = questionsDataTypeMap.get(questionItem.objectType);

    return questionItem;
}

function buildQuestionLabel(question){
    let header = question.parentNode.firstChild.tagName === "header" ? question.parentNode.firstChild.firstChild.data : "";
    let questionLabel = question.attributes.getNamedItem("label").nodeValue;
    let plainText = "";
    let formattedText = "";

    if (question.tagName === "booleanQuestion" && header !== ""){

    } else if(header !== ""){
        plainText = header + questionLabel;
        formattedText ="<div>" + header + "<br>" + questionLabel + "</div>"
    } else {
        plainText =  questionLabel;
        formattedText = "<div>"+questionLabel+"</div>"
    }

    return {
        "ptBR" : {
        "extends" : "StudioObject",
                "objectType" : "Label",
                "oid" : "",
                "plainText" : fixString(plainText),
                "formattedText" : fixString(formattedText)
        },
        "enUS" : {
        "extends" : "StudioObject",
                "objectType" : "Label",
                "oid" : "",
                "plainText" : "",
                "formattedText" : ""
        },
        "esES" : {
        "extends" : "StudioObject",
                "objectType" : "Label",
                "oid" : "",
                "plainText" : "",
                "formattedText" : ""
        }
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
    string = string
        .replace(/\[i\]/g,"<i>")
        .replace(/\[\/i\]/g,"</i>")
        .replace(/\[b\]/g,"<b>")
        .replace(/\[\/b\]/g,"</b>")
        .replace(/\[br\]/g,"<br>");
    return string;
}