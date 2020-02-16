const EhrQuestion = require('./EhrQuestion');
const choiceGroups = require('../globalVars').choiceGroups;
const OtusTemplatePartsGenerator = require("../OtusTemplatePartsGenerator");

class SingleSelectionQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "SingleSelectionQuestion","Integer");
        this.answerIsCustom = false;
        this.choiceGroupId = ehrQuestionObj.choiceGroupId;
    }

    getAnswerValue(answer, isMetadata){
        if(isMetadata){
            return super.getAnswerValue(answer, isMetadata);
        }
        const choice = choiceGroups.choiceObj[this.choiceGroupId].filter(choice => choice.name === answer)[0];
        return (1 + parseInt(choice.value, 10)); // +1 because option values start in 1 not in 0
    }

    getAnswerToShowHiddenQuestion(){
        const answers = super.getAnswerToShowHiddenQuestion();
        return answers.map(answer => parseInt(choiceGroups.findChoiceValueInSpecificChoiceGroup(this.choiceGroupId, answer), 10));
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader();
        const choiceGroupObjArr = choiceGroups.choiceObj[this.choiceGroupId]
            .sort(function(a,b){
                const va = parseInt(a["value"], 10);
                const vb = parseInt(b["value"], 10);
                return va - vb;
            });
        let options = [];
        let value = 1;
        for(let choiceObj of choiceGroupObjArr){
            options.push({
                "extents": "StudioObject",
                "objectType": "AnswerOption",
                "value": value++,
                "extractionValue": parseInt(choiceObj["value"], 10),
                "dataType": "Integer",
                "label":  OtusTemplatePartsGenerator.getLabel(choiceObj["label"])
            });
        }
        questionObj["options"] = options;
        return questionObj;
    }
}

module.exports = SingleSelectionQuestion;