const EhrQuestion = require('./EhrQuestion');
const globalVars = require('../globalVars');

class AutoCompleteQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "AutocompleteQuestion", "String");
        this.dataSource = ehrQuestionObj.itemValue;
    }

    toOtusTemplate(){
        globalVars.ehrQuestionnaire.addQuestionInDataSource(this.dataSource, this.id);
        let questionObj = this.getOtusStudioQuestionHeader();
        questionObj['dataSources'] = [this.dataSource];
        return questionObj;
    }
}

module.exports = AutoCompleteQuestion;