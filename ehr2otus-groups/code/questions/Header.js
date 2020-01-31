const EhrQuestion = require('./EhrQuestion');

class Header extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "TextItem","String");
    }

    toOtusTemplate(){
        const questionObj = this.getOtusStudioQuestionHeader();
    }

}

module.exports = Header;