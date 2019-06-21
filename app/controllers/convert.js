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

let metaDataMap = new Map([
    ["DOES_NOT_WANT_TO_ANSWER",1],
    ["DOES_NOT_KNOW",2],
    ["DOES_NOT_APPLY",3]
]);

let jumpValidationCorrelationMap = new Map([
    ["EQ","equal"],
    ["GT","grater"]
]);

let choiceGroup;
let firstQuestionInPageMap;
let idXNameQuestionCorrelation;
let inNavigationMap;
let booleanCheckboxCorrelation;
let questionNameXParentNameCorrelation;

module.exports.xmlToJson =function(application, req, res) {

    choiceGroup = new Map();
    firstQuestionInPageMap = new Map();
    idXNameQuestionCorrelation = new Map();
    inNavigationMap = new Map();
    booleanCheckboxCorrelation = new Map();
    questionNameXParentNameCorrelation = new Map();

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
            } else if (tagName === "questionPage" || tagName === "finalPage") {
                let headerIsPresent = survey.childNodes[i].childNodes[0].tagName === "header";
                let startNode = 0;
                if(headerIsPresent){
                    startNode = 1;
                }
                fillFirstQuestionInPageMap(firstQuestionInPageMap,survey.childNodes[i].childNodes[0]);
                questions = getQuestions(questions,survey.childNodes[i].childNodes[0]);
            }
        }
    });
    surveyJson.itemContainer = questions;
    surveyJson.navigationList = buildNavigation(questions);
    fillInNavigation(surveyJson);
    res.status(200).render("home/index");
};

function getQuestions(questions,nextSibling,branchArray) {
    if(nextSibling.tagName === "header"){
       if(!nextSibling.nextSibling){
           questions.push(buildHeaderQuestionItem(nextSibling.parentNode.attributes.getNamedItem("id").nodeValue,nextSibling.firstChild.nodeValue));
       } else {
           return getQuestions(questions, nextSibling.nextSibling, branchArray);
       }
    } else {
        if (nextSibling.tagName === "basicQuestionGroup") {
            return getQuestions(questions, nextSibling.childNodes[0]);
        }

        if (nextSibling.tagName !== "branch") {
            let lastQuestionPosition;
            if (nextSibling.tagName === "booleanQuestion") {
                lastQuestionPosition = questions.length - 1;
                if (questions.length > 0 && questions[lastQuestionPosition].objectType === "CheckboxQuestion") {
                    booleanCheckboxCorrelation.set(nextSibling.attributes.getNamedItem("id").nodeValue, questions[lastQuestionPosition].templateID);
                    questions[lastQuestionPosition].options.push(buildOptionStructure(nextSibling));
                } else if (nextSibling.tagName) {
                    questions.push(buildQuestionItem(nextSibling));
                    lastQuestionPosition = questions.length - 1;
                    booleanCheckboxCorrelation.set(nextSibling.attributes.getNamedItem("id").nodeValue, questions[lastQuestionPosition].templateID);
                }
                if (nextSibling.attributes.getNamedItem("hiddenQuestion")) {
                    questions[lastQuestionPosition].insideJump = {
                        targetQuestionName: nextSibling.attributes.getNamedItem("hiddenQuestion").nodeValue,
                        targetIsGroup : !!firstQuestionInPageMap.get(nextSibling.attributes.getNamedItem("hiddenQuestion").nodeValue),
                        when: nextSibling.attributes.getNamedItem("id").nodeValue
                    }
                }
            } else if (nextSibling.tagName) {
                if(nextSibling.attributes.getNamedItem("infoLabel")){
                    questions.push(buildHeaderQuestionItem(nextSibling.parentNode.attributes.getNamedItem("id").nodeValue+nextSibling.attributes.getNamedItem("id").nodeValue,nextSibling.attributes.getNamedItem("infoLabel").nodeValue));
                }
                questions.push(buildQuestionItem(nextSibling));
                if(nextSibling.attributes.getNamedItem("postInfoLabel")){
                    questions.push(buildHeaderQuestionItem(nextSibling.parentNode.attributes.getNamedItem("id").nodeValue+nextSibling.attributes.getNamedItem("id").nodeValue,nextSibling.attributes.getNamedItem("postInfoLabel").nodeValue));
                }
            }
            idXNameQuestionCorrelation.set(nextSibling.attributes.getNamedItem("name").nodeValue, {
                id: nextSibling.attributes.getNamedItem("id").nodeValue,
                type: nextSibling.tagName,
                parentName: nextSibling.parentNode.attributes.getNamedItem("id"),
                choiceGroupId: nextSibling.attributes.getNamedItem("choiceGroupId"),
                metaDataGroupId: nextSibling.attributes.getNamedItem("metaDataGroupId")
            });
            questionNameXParentNameCorrelation.set(nextSibling.attributes.getNamedItem("id").nodeValue, {
                parentName: nextSibling.parentNode.attributes.getNamedItem("id").nodeValue,
            });
        } else {
            if (branchArray) {
                branchArray.push(nextSibling);
            } else {
                branchArray = [];
                branchArray.push(nextSibling);
            }
        }

        if (nextSibling.nextSibling) {
            return getQuestions(questions, nextSibling.nextSibling, branchArray);
        } else if (nextSibling.parentNode.tagName === "basicQuestionGroup" && nextSibling.parentNode.nextSibling) {
            return getQuestions(questions, nextSibling.parentNode.nextSibling, branchArray);
        } else if (nextSibling.parentNode.tagName === "questionPage") {
            if (nextSibling.parentNode.attributes.getNamedItem("nextPageId")) {
                questions.push(buildPageLastQuestion(
                    Array.from(firstQuestionInPageMap.keys()).indexOf(nextSibling.parentNode.attributes.getNamedItem("id").nodeValue) + 1,
                    branchArray,
                    firstQuestionInPageMap.get(nextSibling.parentNode.attributes.getNamedItem("nextPageId").nodeValue),
                    idXNameQuestionCorrelation)
                );
            }
        }
    }
    return questions
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

    if(question.attributes.getNamedItem("hiddenQuestion")){
        let visibleWhenValue = (question.tagName === "singleSelectionQuestion") ? choiceGroup.get(question.attributes.getNamedItem("choiceGroupId").nodeValue).map.get(question.attributes.getNamedItem("visibleWhen").nodeValue) : question.attributes.getNamedItem("visibleWhen").nodeValue
        questionItem.insideJump = {
            targetQuestionName:question.attributes.getNamedItem("hiddenQuestion").nodeValue,
            targetIsGroup : !!firstQuestionInPageMap.get(question.attributes.getNamedItem("hiddenQuestion").nodeValue),
            when:visibleWhenValue
        };
    }

    if(question.tagName === "numericQuestion" ){
        questionItem.objectType = (question.attributes.getNamedItem("decimalNumber") && question.attributes.getNamedItem("decimalNumber").nodeValue === "false") ? "IntegerQuestion" : "DecimalQuestion"
        questionItem.unit = {
            "ptBR" : {
                "extends" : "StudioObject",
                "objectType" : "Unit",
                "oid" : "",
                "plainText" : "",
                "formattedText" : ""
            },
            "enUS" : {
                "extends" : "StudioObject",
                "objectType" : "Unit",
                "oid" : "",
                "plainText" : "",
                "formattedText" : ""
            },
            "esES" : {
                "extends" : "StudioObject",
                "objectType" : "Unit",
                "oid" : "",
                "plainText" : "",
                "formattedText" : ""
            }
        }
    } else if(question.tagName === "textQuestion"){
        questionItem.objectType = "TextQuestion"
    } else if(question.tagName === "singleSelectionQuestion"){
        questionItem.options = choiceGroup.get(question.attributes.getNamedItem("choiceGroupId").nodeValue).options;
        questionItem.objectType = "SingleSelectionQuestion";
    } else if(question.tagName === "autocompleteQuestion"){
        questionItem.objectType = "AutocompleteQuestion";
    } else if(question.tagName === "dateQuestion"){
        questionItem.objectType = "CalendarQuestion";
    }else if(question.tagName === "booleanQuestion"){
        questionItem.objectType = "CheckboxQuestion";
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

function buildHeaderQuestionItem(questionId,label) {
    return  {
        "value" : {
            "ptBR" : {
                "extends" : "StudioObject",
                "objectType" : "Label",
                "oid" : "",
                "plainText" : fixPlainText(label),
                "formattedText" : fixFormattedText(label)
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
        "extents" : "SurveyItem",
        "objectType" : "TextItem",
        "templateID" : questionId,
        "customID" : questionId,
        "dataType" : "String"
    };
}

function buildPageLastQuestion(pageIndex, branchArray, defaultRoute, idXNameQuestionCorrelation) {
    let lastQuestion = {
        "value" : {
            "ptBR" : {
                "extends" : "StudioObject",
                "objectType" : "Label",
                "oid" : "",
                "plainText" : "Obrigado, vamos proceguir para a próxima etapa",
                "formattedText" : "<i>Obrigado, vamos prosseguir para a próxima etapa</i><br>"
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
        "extents" : "SurveyItem",
        "objectType" : "TextItem",
        "templateID" : "AGQ"+ pageIndex,
        "customID" : "AGOC"+ pageIndex,
        "dataType" : "String",
        "routes" : []
    };

    lastQuestion.routes.push(
        {
            "extents" : "SurveyTemplateObject",
            "objectType" : "Route",
            "origin" : "AGQ"+ pageIndex,
            "destination" : defaultRoute,
            "name" : "AGQ" + pageIndex+"_" + defaultRoute,
            "isDefault" : true,
            "conditions" : [ ]
        }
    );

    if(branchArray && branchArray.length > 0){
        branchArray.forEach(branchNode => {
            let length = branchNode.childNodes.length;
            let routeDestination = firstQuestionInPageMap.get(branchNode.attributes.getNamedItem("targetPageId").nodeValue);
            let navigation = {
                "extents" : "SurveyTemplateObject",
                "objectType" : "Route",
                "origin" : "AGQ"+ pageIndex,
                "destination" : routeDestination,
                "name" : "AGQ"+ pageIndex +"_"+routeDestination,
                "isDefault" : false,
                "conditions" : []
            };
            //<branch=route --- <rule>=condition --- <expression>=condition.rule
            for (let i=0; i < length;i++){
                let ruleLength = branchNode.childNodes[i].childNodes.length;
                let rules = [];
                for (let j=0; j < ruleLength; j++){
                    let expression = branchNode.childNodes[i].childNodes[j];
                    let isMetadata = false;

                    let questionName = expression.attributes.getNamedItem("questionName").nodeValue;
                    let regExp = /Metadata/gi;
                    if(questionName.match("Metadata")){
                        questionName = questionName.replace(regExp, '');
                        isMetadata = true;
                    }

                    let questionData = idXNameQuestionCorrelation.get(questionName);
                    let questionId = questionData.id;
                    let answer;
                    if(isMetadata){
                        answer = metaDataMap.get(expression.attributes.getNamedItem("value").nodeValue)
                    } else {
                        answer = questionData.type === "singleSelectionQuestion" ? choiceGroup.get(questionData.choiceGroupId.nodeValue).map.get(expression.attributes.getNamedItem("value").nodeValue) : expression.attributes.getNamedItem("value").nodeValue;
                    }
                    rules.push({
                        "extents" : "SurveyTemplateObject",
                        "objectType" : "Rule",
                        "when" : questionId,
                        "operator" : jumpValidationCorrelationMap.get(expression.attributes.getNamedItem("operator").nodeValue),
                        "answer" : answer,
                        "isMetadata" : isMetadata
                    });
                }

                navigation.conditions.push({
                    "extents" : "StudioObject",
                    "objectType" : "RouteCondition",
                    "name" : "ROUTE_CONDITION_"+ (i+1),
                    "rules" : rules
                })
            }
            lastQuestion.routes.push(navigation)
        });

    }
    return lastQuestion;
}

function fillInNavigation(surveyJson){
    surveyJson.navigationList.forEach(navigation=>{
        navigation.routes.forEach(route=>{
            let inNavigation = inNavigationMap.get(route.destination);
            if(inNavigation){
                inNavigation.push(
                    {
                        "origin" : navigation.origin
                    }
                );
                inNavigationMap.set(route.destination,inNavigation)
            } else {
                inNavigationMap.set(route.destination,[{
                    "origin" : navigation.origin
                }])
            }
        });
    });

    surveyJson.navigationList.forEach(navigation=>{
        if(navigation.origin === "BEGIN NODE"){
            navigation.inNavigations = []
        } else {
            navigation.inNavigations = inNavigationMap.get(navigation.origin);
        }
    })
}

function buildNavigation(questions) {
    let itemContainerLength = questions.length;
    let navigations = [];
    navigations.push(
        {
            "extents" : "SurveyTemplateObject",
            "objectType" : "Navigation",
            "origin" : "BEGIN NODE",
            "index" : 0,
            "inNavigations" : [ ],
            "isDefault" : false,
            "routes" : [
                {
                    "extents" : "SurveyTemplateObject",
                    "objectType" : "Route",
                    "origin" : "BEGIN NODE",
                    "destination" : questions[0].templateID,
                    "name" : "BEGIN NODE_"+questions[0].templateID,
                    "isDefault" : true,
                    "conditions" : [ ]
                }
            ]
        },
        {
            "extents" : "SurveyTemplateObject",
            "objectType" : "Navigation",
            "origin" : "END NODE",
            "index" : 1,
            "inNavigations" : [
                {
                    "origin" : questions[itemContainerLength-1].templateID
                }
            ],
            "isDefault" : false,
            "routes" : [ ]
        }
        );
    for (let i=0; i<itemContainerLength; i++){
        let navigation = {
            "extents" : "SurveyTemplateObject",
            "objectType" : "Navigation",
            "origin" : questions[i].templateID,
            "index" : i+2,
            "inNavigations" : [
                {
                    "origin" : "PASC14"
                }
            ],
            "isDefault" : false,
            "routes" : []
        };

        if (i === itemContainerLength-1){
            navigation.routes.push(
                {
                    "extents" : "SurveyTemplateObject",
                    "objectType" : "Route",
                    "origin" : questions[i].templateID,
                    "destination" : "END NODE",
                    "name" : questions[i].templateID+"_END NODE",
                    "isDefault" : true,
                    "conditions" : [ ]
                }
            )
        } else if(questions[i].insideJump){
            let insideJumpDestination = idXNameQuestionCorrelation.get(questions[i].insideJump.targetQuestionName) ? idXNameQuestionCorrelation.get(questions[i].insideJump.targetQuestionName).id : firstQuestionInPageMap.get(questions[i].insideJump.targetQuestionName);
            let defaultRouteIndex = 0;
            if(questions[i].insideJump.targetIsGroup){
                do {
                    defaultRouteIndex++;
                } while (questionNameXParentNameCorrelation.get(questions[i+defaultRouteIndex].templateID).parentName === questions[i].insideJump.targetQuestionName)
            } else if(insideJumpDestination === questions[i+1].templateID){
                defaultRouteIndex = 2;
            } else {
                defaultRouteIndex = 1;
            }

            navigation.routes.push(
                {
                    "extents" : "SurveyTemplateObject",
                    "objectType" : "Route",
                    "origin" : questions[i].templateID,
                    "destination" : questions[i+defaultRouteIndex].templateID,
                    "name" : questions[i].templateID+"_"+questions[i+defaultRouteIndex].templateID,
                    "isDefault" : true,
                    "conditions" : [ ]
                }
            );

            navigation.routes.push(
                {
                    "extents" : "SurveyTemplateObject",
                    "objectType" : "Route",
                    "origin" : questions[i].templateID,
                    "destination" : insideJumpDestination,
                    "name" :questions[i].templateID+"_"+insideJumpDestination,
                    "isDefault" : false,
                    "conditions" : [
                        {
                            "extents" : "StudioObject",
                            "objectType" : "RouteCondition",
                            "name" : "ROUTE_CONDITION_0",
                            "rules" : [
                                {
                                    "extents" : "SurveyTemplateObject",
                                    "objectType" : "Rule",
                                    "when" : questions[i].templateID,
                                    "operator" : "equal",
                                    "answer" : questions[i].insideJump.when,
                                    "isMetadata" : false
                                }
                            ]
                        }
                    ]
                }
            )
        } else if(!questions[i].routes){
            navigation.routes.push(
                {
                    "extents" : "SurveyTemplateObject",
                    "objectType" : "Route",
                    "origin" : questions[i].templateID,
                    "destination" : questions[i+1].templateID,
                    "name" : questions[i].templateID+"_"+questions[i+1].templateID,
                    "isDefault" : true,
                    "conditions" : [ ]
                }
            )
        }

        if(questions[i].routes){
            questions[i].routes.forEach(route=>{
                let checkboxDestination = booleanCheckboxCorrelation.get(route.destination);
                if(checkboxDestination){
                    route = {
                        "extents": "SurveyTemplateObject",
                        "objectType": "Route",
                        "origin": route.origin,
                        "destination": checkboxDestination,
                        "name": route.origin + "_" + checkboxDestination,
                        "isDefault": route.isDefault,
                        "conditions": route.conditions
                    };
                }
                navigation.routes.push(route);
            });
        }
        navigations.push(navigation);
    }
    return navigations;
}

function fillFirstQuestionInPageMap(firstQuestionInPageMap,questionPageChild,questionPage){
    if (!questionPage) {
        questionPage = questionPageChild.parentNode;
    }

    if (questionPageChild.tagName !== "branch") {
        if (questionPageChild.tagName === "basicQuestionGroup" && !firstQuestionInPageMap.has(questionPageChild.attributes.getNamedItem("name").nodeValue)) {
            return fillFirstQuestionInPageMap(firstQuestionInPageMap, questionPageChild.childNodes[0], questionPage)
        } else if (questionPageChild.parentNode.tagName === "basicQuestionGroup" && !firstQuestionInPageMap.has(questionPageChild.parentNode.attributes.getNamedItem("name").nodeValue)) {
            firstQuestionInPageMap.set(questionPageChild.parentNode.attributes.getNamedItem("name").nodeValue, questionPageChild.attributes.getNamedItem("id").nodeValue);
            if(!firstQuestionInPageMap.has(questionPage.attributes.getNamedItem("id").nodeValue)){
                firstQuestionInPageMap.set(questionPage.attributes.getNamedItem("id").nodeValue,questionPageChild.attributes.getNamedItem("id").nodeValue);
            }
            if(questionPageChild.parentNode.nextSibling){
                return fillFirstQuestionInPageMap(firstQuestionInPageMap, questionPageChild.parentNode.nextSibling, questionPage)
            }
        }

        if(!firstQuestionInPageMap.has(questionPage.attributes.getNamedItem("id").nodeValue)){
            if(questionPageChild.tagName !== "header"){
                firstQuestionInPageMap.set(questionPage.attributes.getNamedItem("id").nodeValue,questionPageChild.attributes.getNamedItem("id").nodeValue);
            } else if(!questionPageChild.nextSibling){
                firstQuestionInPageMap.set(questionPage.attributes.getNamedItem("id").nodeValue,questionPage.attributes.getNamedItem("id").nodeValue);
            }
        }

        if(questionPageChild.nextSibling){
            return fillFirstQuestionInPageMap(firstQuestionInPageMap, questionPageChild.nextSibling, questionPage)
        }

        if(questionPage.nextSibling){
            return fillFirstQuestionInPageMap(firstQuestionInPageMap, questionPage.nextSibling.childNodes[0])
        }
    } else {
        return fillFirstQuestionInPageMap(firstQuestionInPageMap, questionPage.nextSibling.childNodes[0])
    }
}

function buildChoiceGroup(ehrChoiceGroup) {
    let choiceGroupMap = {};
    choiceGroupMap.options = [];

    let optionXNameMap = new Map();

    let ehrChoiceGroupLength = ehrChoiceGroup.childNodes.length - 1;
    for(let i = 0; i <= ehrChoiceGroupLength; i++){
        choiceGroupMap.options.push({
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
            });

        optionXNameMap.set(ehrChoiceGroup.childNodes[i].attributes.getNamedItem("name").nodeValue,i+1)
    }
    choiceGroupMap.map = optionXNameMap;

    return choiceGroupMap
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
                "plainText": fixPlainText(option.attributes.getNamedItem("label").nodeValue),
                "formattedText": fixFormattedText(option.attributes.getNamedItem("label").nodeValue)
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

function buildQuestionLabel(question){
    let header ="";
    if(question.parentNode.tagName === "basicQuestionGroup"){
        header = question.parentNode.parentNode.firstChild.tagName === "header" ? question.parentNode.parentNode.firstChild.firstChild.data : ""
    }
    header = (question.parentNode.firstChild.tagName === "header") ? (header !== "") ? header + "<br>" + question.parentNode.firstChild.firstChild.data : question.parentNode.firstChild.firstChild.data : header;
    if(question.parentNode.attributes.getNamedItem("label")){
        header =  header !== "" ? header + "<br>" + question.parentNode.attributes.getNamedItem("label").nodeValue : question.parentNode.attributes.getNamedItem("label").nodeValue
    }
    let questionLabel = question.attributes.getNamedItem("label").nodeValue;
    let plainText = "";
    let formattedText = "";

    if (question.tagName === "booleanQuestion"){
        plainText = header;
        formattedText ="<div>" + header + "<br></div>"
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
                "plainText" : fixPlainText(plainText),
                "formattedText" : fixFormattedText(formattedText)
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
        fillingRules.options.maxLength = {
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
    if(minLength){
        fillingRules.options.minLength = {
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
        fillingRules.options.lowerLimit = {
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

function fixFormattedText(string){
    string = string
        .replace(/\[i\]/g,"<i>")
        .replace(/\[\/i\]/g,"</i>")
        .replace(/\[b\]/g,"<b>")
        .replace(/\[\/b\]/g,"</b>")
        .replace(/\[br\]/g,"<br>")
        .replace(/\n/g,"")
        .replace(/\r/g,"")
        .replace(/\t/g,"");
    return string;
}

function fixPlainText(string){
    string = string
        .replace(/\[i\]/g,"")
        .replace(/\[\/i\]/g,"")
        .replace(/\[b\]/g,"")
        .replace(/\[\/b\]/g,"")
        .replace(/\[br\]/g,"")
        .replace(/\n/g,"")
        .replace(/\r/g,"")
        .replace(/\t/g,"");
    return string;
}