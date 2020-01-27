const globalVars = require('./globalVars');
const Expression = require('./Expression');

class ANDExpression {

    constructor(ehrExpressionArr) {
        this.expressions = [];
        for(let expr of ehrExpressionArr){
            let questionId = globalVars.dictQuestionNameId[expr.questionName];
            this.expressions.push(new Expression(questionId, expr));
        }
    }

    toOtusTemplate(){
        let result = [];
        for(let expr of this.expressions){
            result.push(expr.toOtusTemplate());
        }
        return result;
    }
}

module.exports = ANDExpression;