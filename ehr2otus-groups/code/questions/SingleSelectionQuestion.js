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
    
    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader();
        const choiceGroupObjArr = choiceGroups.choiceObj[this.choiceGroupId];
        let options = [];
        for(let choiceObj of choiceGroupObjArr){
            let numericValue = choiceObj["value"];
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