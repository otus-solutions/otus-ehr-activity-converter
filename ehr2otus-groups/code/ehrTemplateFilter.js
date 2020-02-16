const TAG_SEPARATOR = "_";

let basicQuestionGroupId = [];

function extractQuestionsFromBasicGroup(questionArr, outputQuestions){
    for(let [key, subQuestionArr]  of questionArr){
        key = key.split(TAG_SEPARATOR)[0];
        if(key === 'basicQuestionGroup'){
            for(let question of subQuestionArr){
                basicQuestionGroupId.push(question.id);
                const subSubQuestionArr = Object.entries(question).filter(([key,value]) => key.includes('Question'));
                extractQuestionsFromBasicGroup(subSubQuestionArr, outputQuestions);
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

function checkHiddenQuestions(questions){
    for (let i = 0; i < questions.length; i++) {
        let hiddenQuestionName = questions[i].hiddenQuestion;
        if(hiddenQuestionName){
            let j = indexOf(hiddenQuestionName, questions, "name");
            if(!j){
                j = indexOf(hiddenQuestionName, questions, "basicGroup");
            }

            if(j !== i+1){
                console.log(`ATTENTION: question index=${i} (${questions[i].id}) hide question index=${j} (${questions[j].id})`);
            }
        }
    }
}

function extractQuestionsFromArrays(template, filterLevel){
    let outputQuestionPages = [];

    for(let questionPage of template.questionPage){
        let outputQuestions = [];

        if(questionPage.header){
            outputQuestions.push({
                id: `${questionPage.id}_header`,
                name: `${questionPage.id}_header`,
                label: questionPage.header[0],
                type: "textItemQuestion"
            });
        }

        const questionArr = Object.entries(questionPage).filter(([key,value]) => key.includes('Question'));
        extractQuestionsFromBasicGroup(questionArr, outputQuestions);
        checkHiddenQuestions(outputQuestions);

        if(filterLevel > 1) {
            outputQuestions = convertQuestionsOfQuestionPageIntoObject(outputQuestions);
        }

        outputQuestionPages.push({
            id: questionPage.id,
            nextPageId: questionPage.nextPageId,
            questions: outputQuestions,
            branch: questionPage.branch
        });
    }

    return {
        metaDataGroup: template.metaDataGroup,
        choiceGroup: template.choiceGroup,
        questionPage: outputQuestionPages
    };
}


module.exports = {
    TAG_SEPARATOR: TAG_SEPARATOR,
    extractQuestionsFromArrays: extractQuestionsFromArrays
};