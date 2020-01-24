const globalVars = require('./globalVars');
const ExpressionEhr = require('./ExpressionEhr');
const NavigationHandler = require('./NavigationHandler');

class Rule {

    constructor(questionPageId, ehrRule){
        this.originPageId = questionPageId;
        this.origin = "";
        this.targetPageId = "";
        this.target = "";
        this.expressions = [];
        if(ehrRule) {
            this.targetPageId = ehrRule.targetPageId;
            this._extractExpressions(ehrRule);
        }
    }

    addEqualExpression(questionId, value){
        let expression = new ExpressionEhr(questionId);
        expression.setValueAndOperator(value);
        this.expressions.push(expression);
    }

    _extractExpressions(ehrRule){
        let ehrRuleArr = ehrRule.rule;
        for(let exprObj of ehrRuleArr){
            for(let expr of exprObj.expression){
                let questionId = globalVars.dictQuestionNameId[expr.questionName];
                this.expressions.push(new ExpressionEhr(questionId, expr));
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

    setOrigin(originQuestionId){
        if(this.origin === ""){
            this.origin = originQuestionId;
        }
    }

    setOriginAndTargetQuestionIds(originQuestionId, targetQuestionId){
        this.setOrigin(originQuestionId);
        if(this.targetPageId === globalVars.END_PAGE_ID){
            this.target = globalVars.DEFAULT_NODES.END.id;
        }
        else{
            this.target = targetQuestionId;
        }
    }

    toOtusStudioObj(){
        let expressions = [];
        for(let expr of this.expressions){
            expressions.push(expr.toOtusStudioObj());
        }

        return NavigationHandler.getNonDefaultRoutesObj(this.origin, this.target, expressions);
    }

    extractExpressionsWithQuestionId(questionId){
        return this.expressions.filter(expr => expr.questionId === questionId);
    }
}

module.exports = Rule;