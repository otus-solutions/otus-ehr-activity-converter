const EhrQuestion = require('./EhrQuestion');

class TimeQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "TimeQuestion","LocalTime");
    }

    toOtusTemplate() {
        const questionObj = this.getOtusStudioQuestionHeader();
        questionObj["options"] = {
            "extends": "StudioObject",
            "objectType": "QuestionOption",
            "data": {}
        };
        return questionObj;
    }
}

module.exports = TimeQuestion;