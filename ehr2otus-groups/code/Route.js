
class Route {

    constructor(originQuestion, destinyQuestion, conditionsArr=[]) {
        this.origin = originQuestion;
        this.destination = destinyQuestion;
        this.conditions = conditionsArr;
    }

    toOtusTemplate(){
        let conditions = [];
        const n = this.conditions.length;

        for (let i = 0; i < n; i++) {

            let rules = [];

            for(let expr of this.conditions[i]){
                rules.push(expr.toOtusTemplate());
            }

            conditions.push({
                "extents": "StudioObject",
                "objectType": "RouteCondition",
                "name": `ROUTE_CONDITION_${i}`,
                "rules": rules
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