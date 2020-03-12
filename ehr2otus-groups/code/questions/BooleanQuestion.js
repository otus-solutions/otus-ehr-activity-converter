const EhrQuestion = require('./EhrQuestion');

class BooleanQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "CheckboxQuestion", "Array");
    }

    getAnswerToShowHiddenQuestion(){
        if(super.getAnswerToShowHiddenQuestion()[0] !== "true"){
            console.log(`ATTENTION! getAnswerToShowHiddenQuestion method for boolean question ${this.id} found value = 'false'`);
        }
        return [this.label];
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader(false);
        let checkboxOption = {
            "extents": "SurveyItem",
            "objectType": "CheckboxAnswerOption",
            "optionID": this.id+"_option",
            "customOptionID": this.id+"_option",
            "dataType": "Boolean",
            "value": false,
            "label": this.label2Otus()
        };
        questionObj['options'] = [checkboxOption];
        return questionObj;
    }

}

module.exports = BooleanQuestion;