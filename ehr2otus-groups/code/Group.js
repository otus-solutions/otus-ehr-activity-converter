
class Group {

    constructor(questionIds, groupId='') {
        this.questions = questionIds;
        //this.id = groupId;
    }

    // toJSON(){
    //     return this.questions.map(q => q.id).join(", ");
    // }

    getFirstQuestion(){
        return this.questions[0];
    }

    getLastQuestion(){
        return this.questions[this.questions.length-1];
    }

    containsQuestion(questionId){
        return this.questions.includes(questionId);
    }

}

module.exports = Group;
