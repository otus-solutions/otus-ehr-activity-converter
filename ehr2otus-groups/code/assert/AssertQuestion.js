class AssertQuestion {

    constructor(id, questionType, dataType, index=-1) {
        this.id = id;
        this.questionType = questionType;
        this.dataType = dataType;
        this.index = index;
    }

    equals(other){
        if(!other){
            console.log(`AssertQuestion.equals method received something ${other})'`);
            return false;
        }
        if(!other instanceof AssertQuestion){
            console.log(`AssertQuestion.equals method received something that is not a AssertQuestion instance (${typeof other})'`);
            return false;
        }

        // const matcher = {
        //     id: (this.id === other.id),
        //     index: (this.index === other.index),
        //     questionType: (this.questionType === other.questionType),
        //     dataType: (this.dataType === other.dataType)
        // };
        // if(! (matcher.id && matcher.index && matcher.questionType && matcher.dataType) ){
        //     console.log(matcher);
        // }

        return (
            this.id === other.id && this.index === other.index &&
            this.questionType === other.questionType && this.dataType === other.dataType);
    }
}

module.exports = AssertQuestion;