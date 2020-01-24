class BasicQuestionGroup {

    constructor(){
        this.name = undefined;
        this.id = undefined;
        this.questionIdArr = [];
    }

    addQuestionId(questionId){
        this.questionIdArr.push(questionId);
    }

    getFirstQuestionId(){
        return this.questionIdArr[0];
    }

    getLastQuestionId(){
        return this.questionIdArr[this.questionIdArr.length-1];
    }

    hasQuestion(questionId){
        return this.questionIdArr.includes(questionId);
    }
}

module.exports = BasicQuestionGroup;