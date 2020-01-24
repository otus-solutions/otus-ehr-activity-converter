class HiddenQuestionGroup {

    constructor(hiddenQuestions, questionThatCanHiddenGroup, nextQuestionId){
        this.hiddenQuestions = hiddenQuestions;
        this.hiddenBy = {
            id: questionThatCanHiddenGroup.id,
            answer: questionThatCanHiddenGroup.hiddenQuestion.isVisibleWhenThisAnswerIs
        };
        this.next = nextQuestionId;
    }

    getFirstQuestion(){
        return this.hiddenQuestions[0];
    }

    getLastQuestion(){
        return this.hiddenQuestions[this.hiddenQuestions.length-1];
    }

    hasUnitSize(){
        return (this.hiddenQuestions.length === 1);
    }
}

module.exports = HiddenQuestionGroup;