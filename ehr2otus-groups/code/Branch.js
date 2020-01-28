const globalVars = require('./globalVars');
const Rule = require('./Rule');
const NavigationHandler = require('./NavigationHandler');

/* Its a route in Otus Template */
class Branch {

    constructor(questionPageId, ehrBranch) {
        this.originPageId = questionPageId;
        this.originId = "";
        this.targetPageId = ehrBranch.targetPageId;
        this.targetId = "";
        this.rules = [];
        for(let rule of ehrBranch.rule){
            this.rules.push(new Rule(rule));
        }
    }

    extractExpressionsWithQuestionId(questionId){
        return this.rules.filter(expr => expr.questionId === questionId);
    }

    setOrigin(originQuestionId){
        if(this.originId === ""){
            this.originId = originQuestionId;
        }
    }

    setOriginAndTargetQuestionIds(originQuestionId, targetQuestionId){
        this.setOrigin(originQuestionId);
        if(this.targetPageId === globalVars.END_PAGE_ID){
            this.targetId = globalVars.DEFAULT_NODES.END.id;
        }
        else{
            this.targetId = targetQuestionId;
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