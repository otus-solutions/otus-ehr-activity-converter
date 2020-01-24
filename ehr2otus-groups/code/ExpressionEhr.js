const globalVars = require('./globalVars');

class ExpressionEhr {

    constructor(questionId, ehrExpressionObj){
        this.questionId = questionId;
        if(ehrExpressionObj) {
            this.questionName = ehrExpressionObj.questionName;//.
            this.operator = ehrExpressionObj.operator;
            this.value = ehrExpressionObj.value;
            this.isMetadata = (ehrExpressionObj.questionName.includes("Metadata"));
        }
    }

    toJSON(){
        if(this.isMetadata){
            return `${this.questionName} ${this.operator} ${this.value}`;
        }
        return `${this.questionId} ${this.operator} ${this.value}`;
    }

    setValueAndOperator(value, operator="EQ"){
        this.operator = operator;
        this.value = value;
    }

    toOtusStudioObj(){
        if(!this.isMetadata) {
            const isNumValue = !isNaN(parseInt(this.value));
            const isBoolValue = (this.value === 'true' || this.value === 'false');
            if(!isNumValue && !isBoolValue){
                this.value = globalVars.choiceGroups.findChoiceLabelInAllChoiceGroup(this.value);
            }
        }

        const operatorDict = {
            "EQ": "equal",
            "GT": "greater"
        };
        
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

module.exports = ExpressionEhr;