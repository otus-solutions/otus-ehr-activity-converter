const globalVars = require('./globalVars');
const Expression = require('./Expression');
const NavigationHandler = require('./NavigationHandler');

class Condition {

    constructor(ehrExpressions){
        this.rules = ehrExpressions;
        
        this._extractExpressions(ehrRule);
    }

    _extractExpressions(ehrRule){
        let ehrRuleArr = ehrRule.rule;
        for(let exprObj of ehrRuleArr){
            for(let expr of exprObj.expression){
                let questionId = globalVars.dictQuestionNameId[expr.questionName];
                this.rules.push(new Expression(questionId, expr));
            }
        }
    }

    equals(otherRule){
        if(!otherRule instanceof Rule){
            throw `Rule.equals: received object is not a Rule - ${JSON.stringify(otherRule, null, 4)}`;
        }
        return (
            otherRule.originPageId === this.originPageId &&
            otherRule.targetPageId === this.targetPageId);
    }

    toOtusTemplate(){
        let expressions = [];
        for(let expr of this.rules){
            expressions.push(expr.toOtusTemplate());
        }

        //return NavigationHandler.getNonDefaultRoutesObj(this.origin, this.target, expressions);
    }

    extractExpressionsWithQuestionId(questionId){
        return this.rules.filter(expr => expr.questionId === questionId);
    }
}

module.exports = Condition;