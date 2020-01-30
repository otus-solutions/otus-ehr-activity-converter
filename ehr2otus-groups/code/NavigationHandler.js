const DEFAULT_NODES = require('./globalVars').DEFAULT_NODES;

class NavigationHandler {

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
        return NavigationHandler.getNavigationNode(lastQuestionId, lastQuestionIndex, END_NODE.id, END_NODE.index);
    }

    static getDefaultRouteObj(originQuestionId, destinationQuestionId){
        return NavigationHandler._getRouteObject(originQuestionId, destinationQuestionId);
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

    static getConditionRouteObj(index, rulesArr){
        return {
            "extents": "StudioObject",
            "objectType": "RouteCondition",
            "name": `ROUTE_CONDITION_${index}`,
            "rules": rulesArr
        };
    }

    

}

module.exports = NavigationHandler;

/*
    static getNonDefaultRoutesObj(originQuestionId, destinationQuestionId, index, expressions){
        const conditions = [
            {
                "extents": "StudioObject",
                "objectType": "RouteCondition",
                "name": `ROUTE_CONDITION_${index}`,
                "rules": expressions
            }
        ];
        return NavigationHandler._getRouteObject(originQuestionId, destinationQuestionId, false, conditions);
    }

 */