const globalVars = require('./globalVars');
const NavigationHandler = require('./NavigationHandler');

const EHR_EQUAL = "EQ";

const operatorDict = {
    "EQ": "equal",
    "GT": "greater"
};

class Expression {

    constructor(questionId, operator, value, isMetadata=false){
        this.questionId = questionId;
        this.operator = operator;
        this.value = value;
        this.isMetadata = isMetadata;
    }

    static equalOperator(){
        return EHR_EQUAL;
    }

    toJSON(){
        return `${this.questionId} ${this.operator} ${this.value}`;
    }

    setValueAndOperator(value, operator=EHR_EQUAL){
        this.operator = operator;
        this.value = value;
    }

    toOtusTemplate(){
        if(!this.isMetadata) {
            const isNumValue = !isNaN(parseInt(this.value));
            const isBoolValue = (this.value === 'true' || this.value === 'false');
            if(!isNumValue && !isBoolValue){
                this.value = globalVars.choiceGroups.findChoiceLabelInAllChoiceGroup(this.value);
            }
        }
        return NavigationHandler.getExpressionObject(this.questionId, operatorDict[this.operator], this.value, this.isMetadata);
    }
    
}

module.exports = Expression;