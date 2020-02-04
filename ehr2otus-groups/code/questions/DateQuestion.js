const EhrQuestion = require('./EhrQuestion');

class DateQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId,"CalendarQuestion","LocalDate");
        this.maxDate = ehrQuestionObj.maxDate;
    }

    toOtusTemplate(){
        const questionObj = this.getOtusStudioQuestionHeader();
        if(this.maxDate){
            questionObj.fillingRules["pastDate"] = {
                "extends": "StudioObject",
                    "objectType": "Rule",
                    "validatorType": "pastDate",
                    "data": {
                        "canBeIgnored": false,
                        "reference": true
                }
            };
        }
        return questionObj;
    }

}

module.exports = DateQuestion;