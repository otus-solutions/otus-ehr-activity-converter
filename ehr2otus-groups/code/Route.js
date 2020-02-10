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

    fillGraphViz(graphViz){
        graphViz.addNode(this.destination);
        if(this.conditions.length === 0){
            graphViz.addEdge(this.origin, this.destination);
            return;
        }
       
        let orExpressions= [];
        for(let condition of this.conditions){
            let andExpressions = [];
            for(let expression of condition){
                andExpressions.push(expression.toJSON());
            }
            orExpressions.push(andExpressions.join(" and "));
        }
        graphViz.addEdge(this.origin, this.destination, orExpressions.join(" or\n"));
    }

}

module.exports = Route;