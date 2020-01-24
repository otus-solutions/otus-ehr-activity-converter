let choiceGroups = {
    choiceObj: {},
    set: function(choiceArr){
        this.choiceObj = choiceArr;
    },
    findChoiceLabelInSpecificChoiceGroup: function(choiceGroupId, choiceName){
        const choiceGroup = this.choiceObj[choiceGroupId];
        for (let choice of choiceGroup) {
            if(choice.name === choiceName){
                return choice.label;
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
    DEFAULT_NODES: {
        BEGIN: {id: "BEGIN NODE", index: 0},
        END: {id: "END NODE", index: 1}
    },
    FIRST_QUESTION_INDEX: 2,
    END_PAGE_ID: "END_PAGE",
    OTUS_TEMPLATE_ATTRIBUTES: {
        QUESTIONS: "itemContainer",
        NAVIGATION_LIST: "navigationList",
        GROUPS_LIST: "surveyItemGroupList"
    },
    // variables
    metaDataGroups: {},
    choiceGroups: choiceGroups,
    dictQuestionNameId: {},
    ehrQuestionnaire: undefined
};