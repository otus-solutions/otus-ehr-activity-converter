
const OtusTemplatePartsGenerator = require("./OtusTemplatePartsGenerator");

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

            conditions.push(
                OtusTemplatePartsGenerator.getConditionRoute(i, rules)
            );
        }

        return OtusTemplatePartsGenerator.getRoute(this.origin, this.destination, (n==0), conditions);
    }
}

module.exports = Route;