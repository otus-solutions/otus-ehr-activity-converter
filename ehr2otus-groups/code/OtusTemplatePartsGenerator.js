const DEFAULT_NODES = require('./globalVars').DEFAULT_NODES;

class OtusTemplatePartsGenerator {

    static get operators(){
        return {
            EQ: "equal",
            GT: "greater"
        };
    }

    static get groupPositions(){
        return {
            first: "start",
            middle: "middle",
            last: "end"
        }
    }

    static getEmptyTemplate(name, acronym) {
        return {
            "extents": "StudioObject",
            "objectType": "Survey",
            "oid": generateTemplateOID(),
            "identity": {
                "extents": "StudioObject",
                "objectType": "SurveyIdentity",
                "name": name,
                "acronym": acronym,
                "recommendedTo": "",
                "description": "",
                "keywords": []
            },
            "metainfo": {
                "extents": "StudioObject",
                "objectType": "SurveyMetaInfo",
                "creationDatetime": "2019-10-01T18:53:18.725Z",
                "otusStudioVersion": ""
            },
            "dataSources": [],
            "itemContainer": [],
            "navigationList": [],
            "staticVariableList": [],
            "surveyItemGroupList": []
        }
    }

    static getLabel(label){
        label = label.replace("[\/b]", "").replace("[b]", "");
        return {
            "ptBR": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": label,
                "formattedText": label
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
        };
    }

    static getQuestionHeader(questionType, id, dataType, label, metaDataOptions){
        return {
            "extents": "SurveyItem",
            "objectType": questionType,
            "templateID": id,
            "customID": id,
            "dataType": dataType,
            "label": label,
            "metadata": {
                "extents": "StudioObject",
                "objectType": "MetadataGroup",
                "options": metaDataOptions
            },
            "fillingRules": {
                "extends": "StudioObject",
                "objectType": "FillingRules",
                "options": {
                    "mandatory": {
                        "extends": "StudioObject",
                        "objectType": "Rule",
                        "validatorType": "mandatory",
                        "data": {
                            "canBeIgnored": false,
                            "reference": true
                        }
                    }
                }
            }
        };
    }

    static getQuestionMetadata(value, label){
        return {
            "extends": "StudioObject",
            "objectType": "MetadataAnswer",
            "dataType": "Integer",
            "value": value,
            "extractionValue": value,
            "label": label
        };
    }

    static getGroupItem(questionId, position){
        return {
            "id": questionId,
            "position": position
        }
    }

    static getGroup(firstQuestionId, lastQuestionId, groupItemsArr){
        return {
			"objectType": "SurveyItemGroup",
			"start": firstQuestionId,
			"end": lastQuestionId,
			"members": groupItemsArr
		}
    }

    static getNavigationNode(originId, originIndex, prevQuestionId, prevQuestionIndex, routes=[]) {
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Navigation",
            "origin": originId,
            "index": originIndex,
            "inNavigations": [
                {
                    "origin": prevQuestionId,
                    "index": prevQuestionIndex
                }
            ],
            "routes": routes
        }
    }

    static getNavigationBeginNode(firstQuestionId) {
        const BEGIN_NODE = DEFAULT_NODES.BEGIN;
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Navigation",
            "origin": BEGIN_NODE.id,
            "index": BEGIN_NODE.index,
            "inNavigations": [],
            "routes": [
                {
                    "extents": "SurveyTemplateObject",
                    "objectType": "Route",
                    "origin": BEGIN_NODE.ID,
                    "destination": firstQuestionId,
                    "name": `${BEGIN_NODE.id}_${firstQuestionId}`,
                    "isDefault": true,
                    "conditions": []
                }
            ]
        }
    }

    static getNavigationEndNode(lastQuestionId, lastQuestionIndex) {
        const END_NODE = DEFAULT_NODES.END;
        return OtusTemplatePartsGenerator.getNavigationNode(lastQuestionId, lastQuestionIndex, END_NODE.id, END_NODE.index);
    }

    static getRoute(originTemplateId, destinationTemplateId, isDefault=true, conditions=[]){
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Route",
            "origin": originTemplateId,
            "destination": destinationTemplateId,
            "name": `${originTemplateId}_${destinationTemplateId}`,
            "isDefault": isDefault,
            "conditions": conditions
        };
    }

    static getConditionRoute(index, rulesArr){
        return {
            "extents": "StudioObject",
            "objectType": "RouteCondition",
            "name": `ROUTE_CONDITION_${index}`,
            "rules": rulesArr
        };
    }

    static getExpression(questionId, operator, answer, isMetadata){
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Rule",
            "when": questionId,
            "operator": operator,
            "answer": answer,
            "isMetadata": isMetadata,
            "isCustom": true
        };
    }
}

module.exports = OtusTemplatePartsGenerator;

function generateTemplateOID(){
    //TODO
    return "eleaOtusSUQ6W3VuZGVmaW5lZF1zdXJ2ZXlVVUlEOltiYmFjYzM1MC1lNDdjLTExZTktOGVmNy02MTUwOTJlYjNkOTFdcmVwb3NpdG9yeVVVSUQ6WyBOb3QgZG9uZSB5ZXQgXQ==";
}