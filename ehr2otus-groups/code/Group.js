
class Group {

    constructor(questionIds, groupId='') {
        this.questions = questionIds;
        //this.id = groupId;
    }

    getFirstQuestion(){
        return this.questions[0];
    }

    getLastQuestion(){
        return this.questions[this.questions.length-1];
    }

    containsQuestion(questionId){
        return this.questions.includes(questionId);
    }

    toOtusTemplate(){
        // TODO
    }

}

module.exports = Group;
