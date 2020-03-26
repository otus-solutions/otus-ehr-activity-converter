const EhrQuestion = require('./EhrQuestion');

class BooleanQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "CheckboxQuestion", "Array");
    }

    getAnswerToShowHiddenQuestion(){
        if(super.getAnswerToShowHiddenQuestion()[0] !== "true"){
            console.log(`ATTENTION! getAnswerToShowHiddenQuestion method for boolean question ${this.id} found value = 'false'`);
        }
        return [generateOptionID(this.id)];
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader(false);
        let checkboxOption = {
            "extents": "SurveyItem",
            "objectType": "CheckboxAnswerOption",
            "optionID": generateOptionID(this.id),
            "customOptionID": generateOptionID(this.id),
            "dataType": "Boolean",
            "value": false,
            "label": this.label2Otus()
        };
        questionObj['options'] = [checkboxOption];
        return questionObj;
    }

}

module.exports = BooleanQuestion;

function generateOptionID(questionID){
    return questionID+"_check";
}