const EhrQuestion = require('./EhrQuestion');
const choiceGroups = require('../globalVars').choiceGroups;
const OtusTemplatePartsGenerator = require("../OtusTemplatePartsGenerator");

class SingleSelectionQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId, "SingleSelectionQuestion","Integer");
        this.choiceGroupId = ehrQuestionObj.choiceGroupId;
    }
    
    replaceHiddenQuestionAnswerValue(){
        this.hiddenQuestionIsVisibleWhenMyAnswerIs = choiceGroups.findChoiceLabelInSpecificChoiceGroup(
            this.choiceGroupId, 
            this.hiddenQuestionIsVisibleWhenMyAnswerIs);
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
        return this.getAnswerValue(answer);
        //const choice = choiceGroups.choiceObj[this.choiceGroupId].filter(choice => choice.name === value)[0];
        //return choice.value;
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader();
        const choiceGroupObjArr = choiceGroups.choiceObj[this.choiceGroupId];
        let options = [];
        for(let choiceObj of choiceGroupObjArr){
            let numericValue = parseInt(choiceObj["value"], 10);
            let label = choiceObj["label"];
            options.push({
                "extents": "StudioObject",
                "objectType": "AnswerOption",
                "value": numericValue,
                "extractionValue": numericValue,
                "dataType": "Integer",
                "label":  OtusTemplatePartsGenerator.getLabel(label)
            });
        }
        questionObj["options"] = options;
        return questionObj;
    }
}

module.exports = SingleSelectionQuestion;