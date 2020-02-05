const OtusTemplatePartsGenerator = require("./OtusTemplatePartsGenerator");

class Group {

    constructor(questionIds) {
        this.questions = questionIds;
    }

    getFirstQuestion(){
        return this.questions[0];
    }

    getLastQuestion(){
        return this.questions[this.questions.length-1];
    }

    toOtusTemplate(){
        const groupPositions = OtusTemplatePartsGenerator.groupPositions;
        const firstQuestion = this.getFirstQuestion();
        const lastQuestion = this.getLastQuestion();

        const members = [
            OtusTemplatePartsGenerator.getGroupItem(firstQuestion, groupPositions.first)
        ];

        for (let i = 1; i < this.questions.length-1; i++) {
            members.push(
                OtusTemplatePartsGenerator.getGroupItem(this.questions[i], groupPositions.middle)
            );
        }

        members.push(
            OtusTemplatePartsGenerator.getGroupItem(lastQuestion, groupPositions.last)
        );

        return OtusTemplatePartsGenerator.getGroup(firstQuestion, lastQuestion, members);
    }

}

module.exports = Group;
