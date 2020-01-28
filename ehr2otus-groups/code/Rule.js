const globalVars = require('./globalVars');
const Expression = require('./Expression');
const NavigationHandler = require('./NavigationHandler');

/* Its a AND expression in EHR template */

class Rule {

    constructor(ehrAndExpressionArr) {
        this.expressions = [];
        for(let expr of ehrAndExpressionArr.expression){
            const isMetadata = (expr.questionName.includes("Metadata"));
            const questionName = expr.questionName.replace("Metadata", "");
            const questionId = globalVars.dictQuestionNameId[questionName];
            this.expressions.push(new Expression(questionId, expr.operator, expr.value, isMetadata));
        }
    }

    toOtusTemplate(index){
        return NavigationHandler.getConditionRouteObj(index, this.andExpression.toOtusTemplate());
    }

}

module.exports = Rule;