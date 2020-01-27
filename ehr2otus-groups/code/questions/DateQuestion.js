const EhrQuestion = require('./EhrQuestion');

class DateQuestion extends EhrQuestion{

    constructor(jsonObject, pageId){
        super(jsonObject, pageId,"CalendarQuestion","LocalDate");
    }

    toOtusTemplate(){
        return this.getOtusStudioQuestionHeader();
    }

}

module.exports = DateQuestion;