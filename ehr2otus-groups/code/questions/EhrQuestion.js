const globalVars = require('../globalVars');
const OtusTemplatePartsGenerator = require("../OtusTemplatePartsGenerator");

let currIndex = globalVars.FIRST_QUESTION_INDEX;

class EhrQuestion {

    constructor(ehrQuestionObj, pageId, questionType, dataType){
        this.id = ehrQuestionObj.id;
        this.name = ehrQuestionObj.name;
        this.label = ehrQuestionObj.label;
        this.metaDataGroupId = ehrQuestionObj.metaDataGroupId;
        this.pageId = pageId;
        this.questionType = questionType;
        this.dataType = dataType;
        this.index = currIndex++;
        this.basicGroup = ehrQuestionObj.basicGroup;
        this.hiddenQuestion = this._extractHiddenQuestion(ehrQuestionObj);
    }

    toJSON(){
        let obj = {
            id: this.id,
            index: this.index,
            questionType: this.questionType
        };
        if(this.hiddenQuestion){
            obj['hiddenQuestion'] =  {
                id: this.hiddenQuestion.id,
                name: this.hiddenQuestion.name,
                isVisibleWhenThisAnswerIs: this.hiddenQuestion.isVisibleWhenThisAnswerIs
            };
        }
        return obj;
    }

    extractIdIndexObj(){
        return {
            id: this.id,
            index: this.index
        };
    }

    _extractHiddenQuestion(ehrQuestionObj){
        if(ehrQuestionObj.hiddenQuestion){
            return {
                name: ehrQuestionObj.hiddenQuestion,
                id: undefined,
                isVisibleWhenThisAnswerIs: ehrQuestionObj.visibleWhen
            }
        }
    }

    setHiddenQuestionIdFromDict(){
        this.hiddenQuestion.id = globalVars.dictQuestionNameId[this.hiddenQuestion.name];
    }

    equals(otherQuestion){
        if(!otherQuestion instanceof EhrQuestion){
            return false;
        }
        return (otherQuestion.id === this.id && otherQuestion.name === this.name);
    }

    // Must be implemented by children classes
    toOtusTemplate(){

    }

    replaceHiddenQuestionInfo(basicQuestionGroups){
        if(this.hiddenQuestion){
            // find id
            let hiddenQuestionId = globalVars.dictQuestionNameId[this.hiddenQuestion.name];
            if(hiddenQuestionId.includes("Group")){ // its a basic question group
                let basicQuestionGroup = basicQuestionGroups.filter((x) => x.name === this.hiddenQuestion.name)[0];
                hiddenQuestionId = basicQuestionGroup.getFirstQuestionId();
            }
            this.hiddenQuestion.id = hiddenQuestionId;
            // find option value
            this.replaceHiddenQuestionAnswerValue();
        }
    }

    // Must be implemented by children classes
    replaceHiddenQuestionAnswerValue(){

    }

    getOtusStudioQuestionHeader(){
        let metaDataOptions = undefined;
        if(this.metaDataGroupId){
            metaDataOptions = this._getQuestionMetadataObj()
        }
        return OtusTemplatePartsGenerator.getQuestionMainInfo(
            this.questionType, this.id, this.dataType, this.label2Otus(), metaDataOptions);
    }

    _getQuestionMetadataObj(){
        const labels = globalVars.metaDataGroups[this.metaDataGroupId];
        let options = [];
        let value = 1;
        for(let label of labels) {
            options.push(
                OtusTemplatePartsGenerator.getQuestionMetadata(value, 
                    label
                    //this.label2Otus() //TODO nao seria o label do for?
                )
            );
            value++;
        }

        if(options.length === 0){
            return undefined;
        }

        return options;
    }

    label2Otus(){
        return OtusTemplatePartsGenerator.getLabel(this.label);
    }

}

module.exports = EhrQuestion;