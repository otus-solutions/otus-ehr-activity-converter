let choiceGroups = {
    choiceObj: {},
    set: function(choiceArr){
        this.choiceObj = choiceArr;
    },
    findChoiceValueInSpecificChoiceGroup: function(choiceGroupId, choiceName){
        const choiceGroup = this.choiceObj[choiceGroupId];
        for (let choice of choiceGroup) {
            if(choice.name === choiceName){
                return choice.value;
            }
        }
    },
    findChoiceLabelInAllChoiceGroup: function (choiceName){
        for(let [id, choiceGroup] of Object.entries(this.choiceObj)) {
            for (let choice of choiceGroup) {
                if(choice.name === choiceName){
                    return choice.label;
                }
            }
        }
    }
};

module.exports = {
    // constants
    EXPORT_QUESTION_LABEL_WITH_ID: false,
    DEFAULT_NODES: {
        BEGIN: {id: "BEGIN NODE", index: 0},
        END: {id: "END NODE", index: 1}
    },
    FIRST_QUESTION_INDEX: 2,
    END_PAGE_ID: "END_PAGE",
    CONDITIONS_END_PAGE_ID: "CONDITIONS_END_PAGE",
    OTUS_TEMPLATE_ATTRIBUTES: {
        QUESTIONS: "itemContainer",
        NAVIGATION_LIST: "navigationList",
        GROUPS_LIST: "surveyItemGroupList"
    },
    METADATA_LABEL_TRANSLATION: {
        "DOES_NOT_WANT_TO_ANSWER": "Não quer responder",
        "DOES_NOT_KNOW": "Não sabe",
        "DOES_NOT_APPLY": "Não se aplica",
        "ACCEPT_ANSWER": "Aceita resposta"
    },
    // variables
    metaDataGroups: {},
    choiceGroups: choiceGroups,
    dictQuestionNameId: {},
    ehrQuestionnaire: undefined
};