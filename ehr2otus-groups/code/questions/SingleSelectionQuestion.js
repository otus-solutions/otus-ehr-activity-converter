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
        return parseInt(choice.value, 10);
    }

    getAnswerToShowHiddenQuestion(){
        const answer = super.getAnswerToShowHiddenQuestion();
        return parseInt(choiceGroups.findChoiceValueInSpecificChoiceGroup(this.choiceGroupId, answer), 10);
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader();
        const choiceGroupObjArr = choiceGroups.choiceObj[this.choiceGroupId];
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