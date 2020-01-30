const AssertQuestion = require('./AssertQuestion');
const AssertTemplate = require('./AssertTemplate');

function extractRules(questionPage){
    // TODO
    return {};
}

let basicQuestionGroupId = [];
let basicQuestionGroupCounter = 0;

function extractQuestionsFromBasicGroup(questionArr, outputQuestions){
    for(let [key, subQuestionArr]  of questionArr){
        if(key === 'basicQuestionGroup'){
            for(let question of subQuestionArr){
                if(basicQuestionGroupCounter === 0) {
                    basicQuestionGroupId.push(question.id);
                }
                basicQuestionGroupCounter++;
                const subSubQuestionArr = Object.entries(question).filter(([key,value]) => key.includes('Question'));
                extractQuestionsFromBasicGroup(subSubQuestionArr, outputQuestions);
                basicQuestionGroupCounter--;
                basicQuestionGroupId.pop();
            }
        }
        else{
            for (let question of subQuestionArr){
                question['type'] = key;
                question['basicGroup'] = basicQuestionGroupId[basicQuestionGroupId.length-1];
                outputQuestions.push(question);
            }
        }
    }
}

function convertQuestionsOfQuestionPageIntoObject(questionsArr){
    let questionsObj = {};
    for(let question of questionsArr){
        const id = question.id;
        question.id = undefined;
        questionsObj[id] = Object.assign(question);
    }
    return questionsObj;
}

function indexOf(questionName, questions, attributeName){
    for (let i = 0; i < questions.length; i++) {
        if(questions[i][attributeName] === questionName){
            return i;
        }
    }
}

function reallocHiddenQuestions(questions){
    for (let i = 0; i < questions.length; i++) {
        let hiddenQuestionName = questions[i].hiddenQuestion;
        if(hiddenQuestionName){
            let j = indexOf(hiddenQuestionName, questions, "name");
            if(!j){
                j = indexOf(hiddenQuestionName, questions, "basicGroup");
            }

            if(j !== i+1){
                console.log(`question ${i} (${questions[i].id}) hide ${j} (${questions[j].id})`);
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
        }
    }
}

function extractQuestionsFromArrays(template, filterLevel){
    let outputQuestionPages = [];
    const questionPages = template.questionPage;
    for(let questionPage of questionPages){
        let outputQuestions = [];
        const questionArr = Object.entries(questionPage).filter(([key,value]) => key.includes('Question'));
        extractQuestionsFromBasicGroup(questionArr, outputQuestions);

        reallocHiddenQuestions(outputQuestions);

        if(filterLevel > 1) {
            outputQuestions = convertQuestionsOfQuestionPageIntoObject(outputQuestions);
        }

        outputQuestionPages.push({
            id: questionPage.id,
            nextPageId: questionPage.nextPageId,
            header: questionPage.header,
            questions: outputQuestions,
            branch: questionPage.branch
        });

        // if(questionPage.branch && questionPage.branch.length > 1){
        //     console.log(questionPage.id, questionPage.branch.length);
        // }
    }
    return {
        metaDataGroup: template.metaDataGroup,
        choiceGroup: template.choiceGroup,
        questionPage: outputQuestionPages
    };
}


module.exports = {
    extractQuestionsFromArrays: extractQuestionsFromArrays
};