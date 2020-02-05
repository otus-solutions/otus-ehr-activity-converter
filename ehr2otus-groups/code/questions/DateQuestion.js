const EhrQuestion = require('./EhrQuestion');

class DateQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId) {
        super(ehrQuestionObj, pageId, "CalendarQuestion", "LocalDate");
        this.maxDate = ehrQuestionObj.maxdate;
    }

    toOtusTemplate() {
        const questionObj = this.getOtusStudioQuestionHeader();
        if (this.maxDate) {
            questionObj.fillingRules.options["pastDate"] = {
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