const globalVars = require('./globalVars');
const OtusTemplatePartsGenerator = require("./OtusTemplatePartsGenerator");

class Expression {

    constructor(questionName, questionId, operator, value, isMetadata=false){
        this.questionName = questionName;
        this.questionId = questionId;
        this.operator = operator;
        this.value = value;
        this.isMetadata = isMetadata;
    }

    static equalOperator(){
        return "EQ";
    }

    toOtusTemplate(){
        const operatorDict = {
            "EQ": OtusTemplatePartsGenerator.operators.EQ,
            "GT": OtusTemplatePartsGenerator.operators.GT
        };
        return OtusTemplatePartsGenerator.getExpression(this.questionId, operatorDict[this.operator], this.value, this.isMetadata);
    }
    
    // toJSON(){
    //     return `${this.questionName} (${this.questionId}) ${this.operator} ${this.value}`;
    // }
}

module.exports = Expression;