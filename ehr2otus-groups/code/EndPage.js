const globalVars = require('./globalVars');
const QuestionPage = require('./QuestionPage');
const BooleanQuestion = require('./questions/BooleanQuestion');

class EndPage extends QuestionPage{

    constructor(){
        super();
        this.id = globalVars.END_PAGE_ID;
    }

    readFromJsonObj(ehrEndPageObj){
        const questionObjArr = ehrEndPageObj["booleanQuestion"];
        for (let questionObj of questionObjArr) {
            let question = new BooleanQuestion(questionObj, this.id);
            this.questions.push(question);

        }
    }

    getSentencesLabelList(){
        return this.questions.map(q => q.label);
    }

    getSentencesObject(){
        return {
            "sentences": this.questions.map(function (q) {
                return {
                    id: q.id,
                    label: q.label
                }
            })
        }
    }

}

module.exports = EndPage;