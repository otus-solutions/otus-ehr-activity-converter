const globalVars = require('../globalVars');
const OtusTemplatePartsGenerator = require("../OtusTemplatePartsGenerator");

let currIndex = globalVars.FIRST_QUESTION_INDEX;

class EhrQuestion {

    constructor(ehrQuestionObj, pageId, questionType, dataType) {
        this.id = ehrQuestionObj.id;
        this.name = ehrQuestionObj.name;

        this.label = ehrQuestionObj.label;
        if (ehrQuestionObj.infoLabel) {
            this.label += "[br][br]" + ehrQuestionObj.infoLabel;
        }
        if (ehrQuestionObj.postInfoLabel) {
            this.label += "[br][br]" + ehrQuestionObj.postInfoLabel;
        }
        this.label = this.label.replace(/\[/gi, "<").replace(/\]/gi, ">");

        this.metaDataGroupId = ehrQuestionObj.metaDataGroupId;
        this.pageId = pageId;
        this.questionType = questionType;
        this.dataType = dataType;
        this.index = currIndex++;
        this.basicGroup = ehrQuestionObj.basicGroup;
        this.hiddenQuestion = this._extractHiddenQuestion(ehrQuestionObj);
        this.answerIsCustom = true;
    }

    _extractHiddenQuestion(ehrQuestionObj) {
        if (ehrQuestionObj.hiddenQuestion) {
            return {
                name: ehrQuestionObj.hiddenQuestion,
                id: undefined,
                isVisibleWhenThisAnswerIs: ehrQuestionObj.visibleWhen
            }
        }
    }

    setHiddenQuestionId(id){
        this.hiddenQuestion.id = id;
    }

    // Must be implemented by children classes
    toOtusTemplate() {

    }

    getAnswerValue(answer, isMetadata) {
        if (isMetadata) {
            const index = globalVars.metaDataGroups[this.metaDataGroupId].indexOf(answer);
            if (index < 0) {
                throw `Answer '${answer}' is not in metadata group of question ${this.id}`;
            }
            return (index + 1);
        }

        return answer;
    }

    getAnswerToShowHiddenQuestion() {
        return this.hiddenQuestion.isVisibleWhenThisAnswerIs.split(",");
    }

    getOtusHeader() {
        return OtusTemplatePartsGenerator.getQuestionHeader(this.questionType, this.id, this.dataType);
    }

    getOtusStudioQuestionHeader(fillingIsMandatory = true) {
        let metaDataOptions = [];
        if (this.metaDataGroupId) {
            metaDataOptions = this._getQuestionMetadataObj()
        }
        return OtusTemplatePartsGenerator.getQuestionMainInfo(
            this.questionType, this.id, this.dataType, this.label2Otus(), metaDataOptions, fillingIsMandatory);
    }

    _getQuestionMetadataObj() {
        const labels = globalVars.metaDataGroups[this.metaDataGroupId];
        let options = [];
        let value = 1;
        for (let label of labels) {
            options.push(
                OtusTemplatePartsGenerator.getQuestionMetadataOption(value,
                    globalVars.METADATA_LABEL_TRANSLATION[label])
            );
            value++;
        }
        return options;
    }

    label2Otus() {
        if(globalVars.EXPORT_QUESTION_LABEL_WITH_ID) {
            const formattedId = `\<font color=\"#ff7f7f\"\>${this.id} - ${this.pageId}\</font\>\<br\>`;
            return OtusTemplatePartsGenerator.getLabel(formattedId + this.label);
        }
        return OtusTemplatePartsGenerator.getLabel(this.label);
    }

}

module.exports = EhrQuestion;
