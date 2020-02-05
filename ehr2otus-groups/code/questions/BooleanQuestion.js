const EhrQuestion = require('./EhrQuestion');

class BooleanQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "CheckboxQuestion", "Array");
    }

    getAnswerToShowHiddenQuestion(){
        if(super.getAnswerToShowHiddenQuestion() !== "true"){
            console.log(`ATTENTION! getAnswerToShowHiddenQuestion method for boolean question ${this.id} found value = 'false'`);
        }
        return this.label;
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader(false);
        let checkboxOption = {
            "extents": "SurveyItem",
            "objectType": "CheckboxAnswerOption",
            "templateID": this.id,
            "customID": this.id,
            "dataType": "Boolean",
            "value": false,
            "label": this.label2Otus()
        };
        questionObj['options'] = [checkboxOption];
        return questionObj;
    }

}

module.exports = BooleanQuestion;