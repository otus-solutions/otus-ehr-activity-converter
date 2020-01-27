const globalVars = require('./globalVars');
const Rule = require('./Rule');
const NavigationHandler = require('./NavigationHandler');

/* Its a route in Otus Template */
class Branch {

    constructor(questionPageId, ehrBranch) {
        this.originPageId = questionPageId;
        this.origin = "";
        this.targetPageId = "";
        this.target = "";
        this.rules = [];
        if(ehrBranch) {
            this.targetPageId = ehrBranch.targetPageId;
            for(let rule of ehrBranch.rule){
                this.rules.push(new Rule(rule));
            }
        }
    }

    addEqualExpression(questionId, value){
        // let expression = new Expression(questionId);
        // expression.setValueAndOperator(value);
        // this.rules.push(expression);
    }

    extractExpressionsWithQuestionId(questionId){
        return this.rules.filter(expr => expr.questionId === questionId);
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

    toOtusTemplate(){
        let conditions = [];
        for (let i = 0; i < this.rules.length; i++) {
            conditions.push(this.rules[i].toOtusTemplate(i));
        }
        return NavigationHandler._getRouteObject(this.origin, this.target, false, conditions);
    }

}

module.exports = Branch;