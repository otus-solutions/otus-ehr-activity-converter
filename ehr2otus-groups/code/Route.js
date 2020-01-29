
class Route {

    constructor(originQuestion, destinyQuestion, conditionsArr) {
        this.origin = originQuestion;
        this.destination = destinyQuestion;
        this.conditions = conditionsArr;
    }

    toOtusTemplate(){
        const n = this.conditions.length;
        let conditions = [];
        for (let i = 0; i < n; i++) {
            let conditionRules = [];
            for(let ruleArr of  this.conditions[i]){
                conditionRules.push(JSON.parse(JSON.stringify(ruleArr, null, 4))); // TODO
            }
            conditions.push({
                "extents": "StudioObject",
                "objectType": "RouteCondition",
                "name": `ROUTE_CONDITION_${i}`,
                "rules": conditionRules
            });
        }
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Route",
            "origin": this.origin,
            "destination": this.destination,
            "name": `${this.origin}_${this.destination}`,
            "isDefault": (n === 0),
            "conditions": conditions
        };
    }
}

module.exports = Route;