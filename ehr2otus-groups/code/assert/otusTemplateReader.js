const AssertQuestion = require('./AssertQuestion');
const AssertTemplate = require('./AssertTemplate');

function extractQuestions(template){
    let indexDict = {};
    for(let item of template.navigationList){
        indexDict[item.origin] = item.index;
    }
    let questions = [];
    for(let question of template.itemContainer){
        const id = question.templateID;
        const index = indexDict[id];
        questions.push(new AssertQuestion(id, question.objectType, question.dataType, index));
    }
    return questions;
}

function extractRules(template){ // TODO



    return [];
}

function filterTemplate(template){
    return new AssertTemplate(
        extractQuestions(template),
        extractRules(template)
    );
}

module.exports = {
    filterTemplate: filterTemplate
};