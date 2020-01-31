const EhrQuestion = require('./EhrQuestion');


class Header extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "TextItem", "String");
    }

    toOtusTemplate(){
        const questionObj = this.getOtusHeader();
        questionObj["value"] = this.label2Otus();
        return questionObj;
    }

}

module.exports = Header;