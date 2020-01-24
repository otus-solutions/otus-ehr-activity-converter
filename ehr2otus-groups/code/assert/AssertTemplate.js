class AssertTemplate {
    constructor(questions, rules){
        this.questions = questions;
        this.rules = rules;
    }

    equals(other){
        return (
            assertObjectArraysAreEquals(this.questions, other.questions, "Questions") &&
            assertObjectArraysAreEquals(this.rules, other.rules, "Rules")
            // todas as rotas do otus estao no ehr e vice-versa
        );
    }
}

module.exports = AssertTemplate;

/* Private functions */

function assertObjectArraysAreEquals(array, otherArray, label){
    const n = array.length;
    if(n !== otherArray.length){
        console.log(`${label} arrays has different size`);
        return false;
    }
    let logs = [], areEquals = true;
    for(let i = 0; i < n; i++){
        if(!array[i].equals(otherArray[i])){
            areEquals = false;
            logs.push(`${label} arrays does not match at index=${i}\n` +
                JSON.stringify(array[i], null, 2) + '\n' +
                JSON.stringify(otherArray[i], null, 2));
        }
    }
    if(!areEquals){
        console.log(logs.join("\n"));
        return false;
    }
    return true;
}