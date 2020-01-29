
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
        const members = [{
            "id": this.getFirstQuestion(),
            "position": "start"
        }];

        for (let i = 1; i < this.questions.length-1; i++) {
            members.push({
                "id": this.questions[i],
                "position": "middle"
            });
        }

        members.push({
            "id": this.getLastQuestion(),
            "position": "end"
        });

        return {
			"objectType": "SurveyItemGroup",
			"start": this.getFirstQuestion(),
			"end": this.getLastQuestion(),
			"members": members
		};
    }

}

module.exports = Group;
