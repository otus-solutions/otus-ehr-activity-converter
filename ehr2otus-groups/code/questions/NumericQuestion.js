const EhrQuestion = require('./EhrQuestion');

class NumericQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "IntegerQuestion","Integer");
        this.lowerLimit = parseInt(ehrQuestionObj["lowerLimit"]);
        this.upperLimit = parseInt(ehrQuestionObj["upperLimit"]);
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader();
        const limits = {
            "lowerLimit": this.lowerLimit,
            "upperLimit": this.upperLimit
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
        questionObj["unit"] = {
            "ptBR": {
                "extends": "StudioObject",
                "objectType": "Unit",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            },
            "enUS": {
                "extends": "StudioObject",
                "objectType": "Unit",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            },
            "esES": {
                "extends": "StudioObject",
                "objectType": "Unit",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            }
        };
        return questionObj;
    }

}

module.exports = NumericQuestion;