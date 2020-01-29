const globalVars = require('./globalVars');

const EHR_EQUAL = "EQ";
const operatorDict = {
    "EQ": "equal",
    "GT": "greater"
};

class Expression {

    constructor(questionName, questionId, operator, value, isMetadata=false){
        this.questionName = questionName;
        this.questionId = questionId;
        this.operator = operator;
        this.value = value;
        this.isMetadata = isMetadata;
    }

    static equalOperator(){
        return EHR_EQUAL;
    }

    toJSON(){
        return `${this.questionName} (${this.questionId}) ${this.operator} ${this.value}`;
    }

    toOtusTemplate(){
        if(!this.isMetadata) {
            const isNumValue = !isNaN(parseInt(this.value));
            const isBoolValue = (this.value === 'true' || this.value === 'false');
            if(!isNumValue && !isBoolValue){
                this.value = globalVars.choiceGroups.findChoiceLabelInAllChoiceGroup(this.value);
            }
        }

        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Rule",
            "when": this.questionId,
            "operator": operatorDict[this.operator],
            "answer": this.value,
            "isMetadata": this.isMetadata,
            "isCustom": true
        };
    }
    
}

module.exports = Expression;