const EhrQuestion = require('./EhrQuestion');
const globalVars = require('../globalVars');

class AutoCompleteQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "AutocompleteQuestion", "String");
        this.itemValue = ehrQuestionObj.itemValue;
    }

    toOtusTemplate(){
        globalVars.ehrQuestionnaire.addQuestionInDataSource(this.itemValue, this.id);
        let questionObj = this.getOtusStudioQuestionHeader();
        questionObj['dataSources'] = [this.itemValue];
        return questionObj;
    }
}

module.exports = AutoCompleteQuestion;