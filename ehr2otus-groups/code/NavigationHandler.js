const DEFAULT_NODES = require('./globalVars').DEFAULT_NODES;

class NavigationHandler {

    static getInNavigationObj(prevQuestionId, prevQuestionIndex){
        return {
            "origin": prevQuestionId,
            "index": prevQuestionIndex
        }
    }

    static navigationBeginNodeItem(firstQuestionId) {
        const BEGIN_NODE = DEFAULT_NODES.BEGIN.id;
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Navigation",
            "origin": BEGIN_NODE,
            "index": 0,
            "inNavigations": [],
            "routes": [
                {
                    "extents": "SurveyTemplateObject",
                    "objectType": "Route",
                    "origin": BEGIN_NODE,
                    "destination": firstQuestionId,
                    "name": `${BEGIN_NODE}_${firstQuestionId}`,
                    "isDefault": true,
                    "conditions": []
                }
            ]
        }
    }

    static navigationEndNodeItem(lastQuestionId, lastQuestionIndex) {
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Navigation",
            "origin": DEFAULT_NODES.END.id,
            "index": DEFAULT_NODES.END.index,
            "inNavigations": [
                NavigationHandler.getInNavigationObj(lastQuestionId, lastQuestionIndex)
            ],
            "routes": []
        };
    }

    static _getRouteObject(originTemplateId, destinationTemplateId, isDefault=true, conditions=[]){
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

    static getDefaultRouteObj(originQuestionId, destinationQuestionId){
        return NavigationHandler._getRouteObject(originQuestionId, destinationQuestionId);
    }

    static getNonDefaultRoutesObj(originQuestionId, destinationQuestionId, expressions){
        const conditions = [
            {
                "extents": "StudioObject",
                "objectType": "RouteCondition",
                "name": "ROUTE_CONDITION_0",
                "rules": expressions
            }
        ];
        return NavigationHandler._getRouteObject(originQuestionId, destinationQuestionId, false, conditions);
    }

    static navigationListQuestionNode(questionInfo, prevQuestionInfo, nextQuestionInfo){

    }

    static getNavigationListQuestionElementObj(questionId, questionIndex, inNavigationsArr, routesArr){
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Navigation",
            "origin": questionId,
            "index": questionIndex,
            "inNavigations": inNavigationsArr,
            "routes": routesArr
        }
    }
}

module.exports = NavigationHandler;