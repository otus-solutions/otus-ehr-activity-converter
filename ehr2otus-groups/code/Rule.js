const globalVars = require('./globalVars');
const Expression = require('./Expression');

class Rule {

    constructor(ehrAndExpressionArr) {
        this.expressions = [];
        for(let expr of ehrAndExpressionArr.expression){
            const isMetadata = (expr.questionName.includes("Metadata"));
            const questionName = expr.questionName.replace("Metadata", "");
            const questionId = globalVars.dictQuestionNameId[questionName];
            const expression = new Expression(questionName, questionId, expr.operator, expr.value, isMetadata);
            this.expressions.push(expression);
        }
    }

}

module.exports = Rule;