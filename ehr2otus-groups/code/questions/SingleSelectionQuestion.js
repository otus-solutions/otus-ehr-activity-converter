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
        const sortedChoiceArr = choiceGroups.choiceObj[this.choiceGroupId].sort(compareOptionValues);
        const choice = sortedChoiceArr.filter(choice => choice.name === answer)[0];
        return parseChoiceValue(choice.value, sortedChoiceArr[0].value);
    }

    getAnswerToShowHiddenQuestion(){
        const answers = super.getAnswerToShowHiddenQuestion();
        const firstChoiceValueOfGroup = choiceGroups.choiceObj[this.choiceGroupId].sort(compareOptionValues)[0].value;
        return answers.map(answer => parseChoiceValue(choiceGroups.findChoiceValueInSpecificChoiceGroup(this.choiceGroupId, answer), firstChoiceValueOfGroup));
    }

    toOtusTemplate(){
        let questionObj = this.getOtusStudioQuestionHeader();
        const sortedChoiceArr = choiceGroups.choiceObj[this.choiceGroupId].sort(compareOptionValues);
        const firstChoiceValueOfArr = sortedChoiceArr[0].value;
        let options = [];
        for(let choiceObj of sortedChoiceArr){
            options.push({
                "extents": "StudioObject",
                "objectType": "AnswerOption",
                "value": parseChoiceValue(choiceObj.value, firstChoiceValueOfArr),
                "extractionValue": choiceObj.value,
                "dataType": "Integer",
                "label":  OtusTemplatePartsGenerator.getLabel(choiceObj.label)
            });
        }
        questionObj["options"] = options;
        return questionObj;
    }
}

function compareOptionValues(a,b){
    const va = parseInt(a.value, 10);
    const vb = parseInt(b.value, 10);
    return va - vb;
}

function parseChoiceValue(choiceValue, firstChoiceValueOfArr){
    return parseInt(choiceValue, 10) + (firstChoiceValueOfArr === "0" ? 1 : 0);
}

module.exports = SingleSelectionQuestion;