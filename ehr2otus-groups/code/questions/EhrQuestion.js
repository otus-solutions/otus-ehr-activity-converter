const globalVars = require('../globalVars');
//const HiddenQuestion = require('./questions/HiddenQuestion');

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
        let metaDataOptions = [];
        if(this.metaDataGroupId){
            metaDataOptions = this._getQuestionMetadataObj()
        }
        return {
            "extents": "SurveyItem",
            "objectType": this.questionType,
            "templateID": this.id,
            "customID": this.id,
            "dataType": this.dataType,
            "label": this._getLabelObj(),
            "metadata": {
                "extents": "StudioObject",
                "objectType": "MetadataGroup",
                "options": metaDataOptions
            },
            "fillingRules": {
                "extends": "StudioObject",
                "objectType": "FillingRules",
                "options": {
                    "mandatory": {
                        "extends": "StudioObject",
                        "objectType": "Rule",
                        "validatorType": "mandatory",
                        "data": {
                            "canBeIgnored": false,
                            "reference": true
                        }
                    }
                }
            }
        };
    }

    _getQuestionMetadataObj(){
        const labels = globalVars.metaDataGroups[this.metaDataGroupId];
        let options = [];
        let value = 1;
        for(let label of labels) {
            options.push({
                "extends": "StudioObject",
                "objectType": "MetadataAnswer",
                "dataType": "Integer",
                "value": value,
                "extractionValue": value,
                "label": this._getLabelObj()
            });
            value++;
        }
        return options;
    }

    _getLabelObj(){
        return EhrQuestion.getLabelObj(this.label);
    }

    static getLabelObj(label){
        label = label.replace("[\/b]", "").replace("[b]", "");
        return {
            "ptBR": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": label,
                "formattedText": label
            },
            "enUS": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            },
            "esES": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            }
        };
    }

}

module.exports = EhrQuestion;