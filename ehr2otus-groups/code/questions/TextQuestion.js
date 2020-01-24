const EhrQuestion = require('./EhrQuestion');

class TextQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "TextQuestion","String");
        this.minLength = parseInt(ehrQuestionObj["minLength"]);
        this.maxLength = parseInt(ehrQuestionObj["maxLength"]);
    }

    toOtusStudioObj(){
        if(this.name.toLowerCase().includes("phone") || this.label.toLowerCase().includes("telefone")){
            this.questionType = "PhoneQuestion";
            this.dataType = "Integer";
            return this.getOtusStudioQuestionHeader();
        }
        let questionObj =  this.getOtusStudioQuestionHeader();
        const limits = {
            "minLength": this.minLength,
            "maxLength": this.maxLength
        };
        for(let [limit, value] of Object.entries(limits)){
            if(!isNaN(value)){
                questionObj["fillingRules"]["options"][limit] = {
                    "extends": "StudioObject",
                    "objectType": "Rule",
                    "validatorType": limit,
                    "data": {
                        "canBeIgnored": true,
                        "reference": value
                    }
                };
            }
        }
        return questionObj;
    }

}

module.exports = TextQuestion;