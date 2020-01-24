const EhrQuestion = require('./EhrQuestion');

class BooleanQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "CheckboxQuestion", "Array");
    }

    toOtusStudioObj(){
        let questionObj = this.getOtusStudioQuestionHeader();
        let checkboxOption = {
            "extents": "SurveyItem",
            "objectType": "CheckboxAnswerOption",
            "templateID": this.id,
            "customID": this.id,
            "dataType": "Boolean",
            "value": false,
            "label": this._getLabelObj()
        };
        questionObj['options'] = [checkboxOption];
        return questionObj;
    }

}

module.exports = BooleanQuestion;