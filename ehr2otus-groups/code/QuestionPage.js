const globalVars = require('./globalVars');
const NavigationHandler = require('./NavigationHandler');

const AutoCompleteQuestion = require('./questions/AutoCompleteQuestion');
const BasicQuestionGroup = require('./questions/BasicQuestionGroup');
const BooleanQuestion = require('./questions/BooleanQuestion');
const DateQuestion = require('./questions/DateQuestion');
const NumericQuestion = require('./questions/NumericQuestion');
const SingleSelectionQuestion = require('./questions/SingleSelectionQuestion');
const TextQuestion = require('./questions/TextQuestion');

const HiddenQuestionGroup = require("./HiddenQuestionGroup");
const Rule = require('./Rule');

let _basicQuestionGroupStack = {
    stack: [],
    size: 0,
    reset: function () {
        this.stack = [];
        this.size = 0
    },
    push: function (basicQuestionGroup) {
        this.stack.push(basicQuestionGroup);
        this.size++;
    },
    pop: function () {
        this.stack.pop();
        if(this.size > 0) {
            this.size--;
        }
    },
    getTop: function () {
        return this.stack[this.size-1];
    },
    addQuestionId: function (questionId) {
        if(this.size > 0){
            this.getTop().addQuestionId(questionId);
        }
    }
};

const OTUS_QUESTIONS_LIST = globalVars.OTUS_TEMPLATE_ATTRIBUTES.QUESTIONS;
const OTUS_NAVIGATION_LIST = globalVars.OTUS_TEMPLATE_ATTRIBUTES.NAVIGATION_LIST;
const OTUS_GROUP_LIST = globalVars.OTUS_TEMPLATE_ATTRIBUTES.GROUPS_LIST;

class QuestionPage {

    constructor(){
        this.id = '';
        this.nextPageId = '';
        this.questions = [];
        this.rules = [];
        this.splitedQuestions = [];
        this.basicQuestionGroups = [];
        this.hiddenQuestions = [];
    }

    // toJSON(){
    //     return {id: this.id};
    // }

    /*-----------------------------------------------------
     * Getters
     */

    getFirstQuestion(){
        return this.questions[0];
    }

    getLastQuestion(){
        return this.questions[this.questions.length-1];
    }

    _indexOfQuestionById(questionId){
        return _indexOfQuestionByIdInArr(questionId, this.questions);
    }

    _getQuestionsWithHiddenQuestion(){
        return this.questions.filter((q) => q.hiddenQuestion !== undefined);
    }

    _getBasicQuestionGroupThatIncludes(questionId){
        return this.basicQuestionGroups.filter((b) => b.hasQuestion(questionId))[0];
    }

    _getNextQuestionId(questionIndex){
        try{
            return this.questions[questionIndex+1].id;
        }
        catch (e) { // this is the last question => search at next page
            return _getQuestionIdDefaultRouteToNextPage(this.nextPageId);
        }
    }

    /*-----------------------------------------------------
    * Read methods
    */

    readFromJsonObj(ehrQuestionPageObj){
        this.id = ehrQuestionPageObj.id;
        this.nextPageId = ehrQuestionPageObj.nextPageId;
        
        let questionObjsArr = Object.entries(ehrQuestionPageObj).filter(([key,value]) => key.includes('Question'));
        this._readQuestions(questionObjsArr);
        _basicQuestionGroupStack.reset();

        this._readRules(ehrQuestionPageObj);
    }

    _readQuestions(questionObjsArr){
        const questionFuncDict = {
            "autocompleteQuestion": AutoCompleteQuestion,
            "booleanQuestion": BooleanQuestion,
            "dateQuestion": DateQuestion,
            "numericQuestion": NumericQuestion,
            "singleSelectionQuestion": SingleSelectionQuestion,
            "textQuestion": TextQuestion
        };
        try {
            for (let [key, questionObjArr] of questionObjsArr) {
                if (key === "basicQuestionGroup") {
                    for (let questionObj of questionObjArr) {
                        let basicQuestionGroup = new BasicQuestionGroup();
                        this.basicQuestionGroups.push(basicQuestionGroup);

                        _basicQuestionGroupStack.push(basicQuestionGroup);
                        globalVars.dictQuestionNameId[questionObj.name] = questionObj.id;
                        basicQuestionGroup.id = questionObj.id;
                        basicQuestionGroup.name = questionObj.name;
                        let subQuestionObjsArr = Object.entries(questionObj).filter(([key, value]) => key.includes('Question'));
                        this._readQuestions(subQuestionObjsArr);

                        _basicQuestionGroupStack.pop();
                    }
                }
                else {
                    for (let questionObj of questionObjArr) {
                        let questionClazz = questionFuncDict[key];
                        let question = new questionClazz(questionObj, this.id);
                        this.questions.push(question);
                        globalVars.dictQuestionNameId[question.name] = question.id;
                        if (_basicQuestionGroupStack.size > 0) {
                            _basicQuestionGroupStack.addQuestionId(question.id);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    _readRules(ehrQuestionPage){
        let branch = ehrQuestionPage.branch;
        if(!branch){
            return;
        }
        for(let ehrRule of branch) {
            this.rules.push(new Rule(this.id, ehrRule));
        }
    }

    /*-----------------------------------------------------
     * Conversion To Otus
     */

    toOtusStudioTemplate(otusStudioTemplate){
        this._reorganizeQuestionsThatHiddenQuestion();

        for(let question of this.questions){
            otusStudioTemplate[OTUS_QUESTIONS_LIST].push(question.toOtusStudioObj());
        }

        if(this.splitedQuestions.length){
            this._setNavigationAndGroupListUsingSplitedQuestions(otusStudioTemplate);
        }
        else {
            this._addNavigationToOtusTemplate(this.questions, otusStudioTemplate[OTUS_NAVIGATION_LIST]);

            if (this.questions.length > 1) {
                otusStudioTemplate[OTUS_GROUP_LIST].push(this._getOtusGroupListObj());
            }
        }
    }

    _reorganizeQuestionsThatHiddenQuestion(){
        for(let question of this.questions){
            question.replaceHiddenQuestionInfo(this.basicQuestionGroups);
        }

        let questionsThatHideOthers = this._getQuestionsWithHiddenQuestion();
        if(questionsThatHideOthers.length === 0){
            return;
        }
        let questionThatHideIndexes = [];
        let hiddenQuestionIndexes = [];
        let lastBasicQuestionGroupIndexes = [];

        for(let question of questionsThatHideOthers) {
            let index = this._indexOfQuestionById(question.id);
            let hiddenIndex = this._indexOfQuestionById(question.hiddenQuestion.id);
            let basicQuestionGroup = this._getBasicQuestionGroupThatIncludes(question.hiddenQuestion.id);
            let lastQuestionId = (basicQuestionGroup?
                basicQuestionGroup.getLastQuestionId() :
                question.hiddenQuestion.id);

            if (index > hiddenIndex) { // swap questions and indexes
                [this.questions[index], this.questions[hiddenIndex]] = [this.questions[hiddenIndex], this.questions[index]];
                [index, hiddenIndex] = [hiddenIndex, index];
            }
            else if(hiddenIndex > index+1 && hiddenIndex < this.questions.length) {
                this._moveQuestion(question, question.hiddenQuestion.id, lastQuestionId);
                index = this._indexOfQuestionById(question.id);
                hiddenIndex = this._indexOfQuestionById(question.hiddenQuestion.id);
            }
            questionThatHideIndexes.push(index);
            hiddenQuestionIndexes.push(hiddenIndex);
            lastBasicQuestionGroupIndexes.push(this._indexOfQuestionById(lastQuestionId));
        }

        const numQuestions = this.questions.length;

        if(hiddenQuestionIndexes.includes(numQuestions-1)){
            const lastHiddenQuestionIndex = hiddenQuestionIndexes[hiddenQuestionIndexes.length-1];
            const lastHiddenQuestion = this.questions[lastHiddenQuestionIndex].id;
            for(let rule of this.rules){
                const expressions = rule.extractExpressionsWithQuestionId(lastHiddenQuestion);
                if(expressions.length > 0){
                    rule.setOrigin(lastHiddenQuestion);
                }
            }
        }

        let questionIndex = 0;
        for (let i = 0; i < hiddenQuestionIndexes.length; i++) {
            const startIndex = hiddenQuestionIndexes[i];
            const endIndex = lastBasicQuestionGroupIndexes[i];

            const sliceStart = this.questions.slice(questionIndex, startIndex)
                                             .map(q => q.extractIdIndexObj());
            this.splitedQuestions.push(sliceStart);
            questionIndex = endIndex+1;

            const questionThatHideAnother = this.questions[questionThatHideIndexes[i]];
            const sliceHidden = this.questions.slice(startIndex, endIndex + 1)
                                              .map(q => q.extractIdIndexObj());
            const nextQuestionId = this._getNextQuestionId(endIndex);
            const hiddenGroup = new HiddenQuestionGroup(sliceHidden, questionThatHideAnother, nextQuestionId);
            this.splitedQuestions.push(hiddenGroup);
        }

        if(questionIndex <= numQuestions-1){
            const sliceEnd = this.questions.slice(questionIndex, numQuestions)
                                              .map(q => q.extractIdIndexObj());
            this.splitedQuestions.push(sliceEnd);
        }
    }

    _moveQuestion(newPrevQuestion, firstQuestionId, lastQuestionId){
        const prevIndex = this._indexOfQuestionById(newPrevQuestion.id);
        const firstIndex = this._indexOfQuestionById(firstQuestionId);
        const lastIndex = (lastQuestionId? this._indexOfQuestionById(lastQuestionId) : firstIndex);

        const sliceStart = this.questions.slice(0, prevIndex+1);
        const sliceMiddle = this.questions.slice(prevIndex+1, firstIndex);
        const sliceHiddenToMove = this.questions.slice(firstIndex, lastIndex+1);
        const sliceEnd = this.questions.slice(lastIndex+1, this.questions.length-1);

        this.questions = sliceStart.concat(sliceHiddenToMove, sliceMiddle, sliceEnd);
    }

    /*
     * Navigation
     */

    _addNavigationToOtusTemplate(questions, navigationList){
        const firstQuestion = questions[0];
        let inNavigation = this._inNavigationArrForFirstQuestion();

        if(questions.length === 1){
            let nextQuestionId = _getQuestionIdDefaultRouteToNextPage(this.nextPageId);
            let routes =  [
                NavigationHandler.getDefaultRouteObj(firstQuestion.id, nextQuestionId)
            ];
            this._pushNonDefaultRoutesOtusObj(questions, routes);
            navigationList.push(_navigationItemListForQuestion(firstQuestion, inNavigation, routes));
            return;
        }

        // First Question: with only 1 route to 2th question
        let routes =  [
            NavigationHandler.getDefaultRouteObj(firstQuestion.id, questions[1].id)
        ];
        navigationList.push(_navigationItemListForQuestion(firstQuestion, inNavigation, routes));

        // Middle Questions
        let endIndex = questions.length-2;
        _addNavigationAtSequence(navigationList, questions, 1, endIndex);

        // Last Question
        const lastQuestion = questions[endIndex+1];
        inNavigation = [
            NavigationHandler.getInNavigationObj(questions[endIndex].id, questions[endIndex].index)
        ];
        let nextQuestionId = _getQuestionIdDefaultRouteToNextPage(this.nextPageId);
        routes =  [
            NavigationHandler.getDefaultRouteObj(lastQuestion.id, nextQuestionId)
        ];
        this._pushNonDefaultRoutesOtusObj(questions, routes);
        navigationList.push(_navigationItemListForQuestion(lastQuestion, inNavigation, routes));
    }

    _setNavigationAndGroupListUsingSplitedQuestions(otusStudioTemplate){
        let navigationList = otusStudioTemplate[OTUS_NAVIGATION_LIST];
        let groupList = otusStudioTemplate[OTUS_GROUP_LIST];
        const questionGroupsForDefaultRoute = this.splitedQuestions.filter(obj => !(obj instanceof HiddenQuestionGroup));
        const questionGroupsForHide = this.splitedQuestions.filter(obj => (obj instanceof HiddenQuestionGroup));

        let result = [];
        for (let i = 0; i < questionGroupsForDefaultRoute.length; i++) {
            let group = questionGroupsForDefaultRoute[i];
            result = result.concat(group);
            if (group.length > 1) {
                groupList.push(
                    _getOtusGroupListObjForGroup(group.map(q => q.id))
                );
            }
        }

        this._addNavigationToOtusTemplate(result, navigationList);

        let hiddenQuestionsDict = {};
        for (let i = 0; i < questionGroupsForHide.length; i++) {
            let questionHiddenGroup = questionGroupsForHide[i];
            let rule = new Rule(this.id);
            rule.targetPageId = this.id;
            let lastQuestionGroup = questionGroupsForDefaultRoute[i];
            let lastQuestion = lastQuestionGroup[lastQuestionGroup.length - 1];
            rule.setOriginAndTargetQuestionIds(lastQuestion.id, questionHiddenGroup.hiddenQuestions[0].id);
            let answer = questionHiddenGroup.hiddenBy.answer;
            for (let value of answer.split(',')) {
                rule.addEqualExpression(questionHiddenGroup.hiddenBy.id, value);
            }
            hiddenQuestionsDict[questionHiddenGroup.hiddenBy.id] = rule;

            let hiddenGroupSize = questionHiddenGroup.hiddenQuestions.length;
            if (hiddenGroupSize === 1) {
                const uniqueHiddenQuestion = questionHiddenGroup.hiddenQuestions[0];
                const nextRegularGroupFirstQuestionId = (uniqueHiddenQuestion.id === this.getLastQuestion().id ?
                    questionHiddenGroup.next :
                    questionGroupsForDefaultRoute[i + 1][0].id);
                _addNavigationDefaulRouteForQuestion(navigationList, uniqueHiddenQuestion, nextRegularGroupFirstQuestionId, null);
            }
            else {
                groupList.push(
                    _getOtusGroupListObjForGroup(questionHiddenGroup.hiddenQuestions.map(q => q.id))
                );

                const firstHiddenQuestion = questionHiddenGroup.hiddenQuestions[0];
                const nextHiddenQuestion = questionHiddenGroup.hiddenQuestions[1];
                _addNavigationDefaulRouteForQuestion(navigationList, firstHiddenQuestion, nextHiddenQuestion.id, null);

                _addNavigationAtSequence(navigationList, questionHiddenGroup.hiddenQuestions, 1, hiddenGroupSize - 2);

                const lastHiddenQuestion = questionHiddenGroup.hiddenQuestions[hiddenGroupSize - 1];
                const prevLastHiddenQuestion = questionHiddenGroup.hiddenQuestions[hiddenGroupSize - 2];
                const nextRegularGroupFirstQuestionId = (lastHiddenQuestion.id === this.getLastQuestion().id ?
                    questionHiddenGroup.next :
                    questionGroupsForDefaultRoute[i + 1][0].id);
                _addNavigationDefaulRouteForQuestion(navigationList, lastHiddenQuestion, nextRegularGroupFirstQuestionId, prevLastHiddenQuestion);
            }
        }

        for (let [id, rule] of Object.entries(hiddenQuestionsDict)) {
            let i = 0, navigationElem = undefined;
            while (!navigationElem && i < navigationList.length) {
                if (navigationList[i].origin === id) {
                    navigationElem = navigationList[i];
                }
                i++;
            }
            navigationElem.routes.push(rule.toOtusStudioObj());
        }
    }

    _inNavigationArrForFirstQuestion(){
        try {
            let prevQuestionPage = globalVars.ehrQuestionnaire.getPreviousQuestionPageOf(this.id);
            let prevQuestion = prevQuestionPage.getLastQuestion();
            return [NavigationHandler.getInNavigationObj(prevQuestion.id, prevQuestion.index)];
        }
        catch (e) {
            const BEGIN_NODE = globalVars.DEFAULT_NODES.BEGIN;
            if(e === BEGIN_NODE){
                return [NavigationHandler.getInNavigationObj(BEGIN_NODE.id, BEGIN_NODE.index)];
            }
            return [];
        }
    }

    _pushNonDefaultRoutesOtusObj(questions, routes){
        const lastQuestion = questions[questions.length-1];
        for (let rule of this.rules) {
            let targetQuestionId = _getQuestionIdDefaultRouteToNextPage(rule.targetPageId);
            rule.setOriginAndTargetQuestionIds(lastQuestion.id, targetQuestionId);
            routes.push(rule.toOtusStudioObj());
        }
    }

    /*
     * Groups
     */

    _getOtusGroupListObj() {
        return _getOtusGroupListObjForGroup(this.questions.map((q) => q.id));//<<
    }


    hasQuestion(questionId){
        return (this.questions.filter(question => question.id === questionId).length > 0);
    }
}

module.exports = QuestionPage;

/***************************************************************
 * Private static functions
 */

function _indexOfQuestionByIdInArr(questionId, questionArr){
    let i=0;
    let found = false;
    while(!found && i <  questionArr.length){
        found = questionArr[i++].id === questionId;
    }
    if(found){
        return i-1;
    }
    return -1;
}

function  _getQuestionIdDefaultRouteToNextPage(nextPageId){
    try {
        return globalVars.ehrQuestionnaire.getFirstQuestionIdFromQuestionPage(nextPageId);
    }
    catch (e) {
        if(e !== globalVars.END_PAGE_ID){
            throw e;
        }
        return globalVars.DEFAULT_NODES.END.id;
    }
}

function _navigationItemListForQuestion(question, inNavigation, routes) {
    return NavigationHandler.getNavigationListQuestionElementObj(question.id, question.index, inNavigation, routes);
}

function _addNavigationDefaulRouteForQuestion(navigationList, originQuestion, destinationQuestionId, prevQuestion){
    let inNavigation = [];
    if(prevQuestion) {
        inNavigation = [
            NavigationHandler.getInNavigationObj(prevQuestion.id, prevQuestion.index)
        ];
    }
    let routes =  [
        NavigationHandler.getDefaultRouteObj(originQuestion.id, destinationQuestionId)
    ];
    navigationList.push(_navigationItemListForQuestion(originQuestion, inNavigation, routes));
}

function _addNavigationAtSequence(navigationList, questions, startIndex, endIndex){
    for (let i = startIndex; i <= endIndex; i++) {
        _addNavigationDefaulRouteForQuestion(navigationList, questions[i], questions[i+1].id, questions[i-1]);
    }
}

function _getOtusGroupListObjForGroup(groupQuestionIds){
    const first = groupQuestionIds[0];
    const last = groupQuestionIds.pop();

    let members = [{
        "id": first,
        "position": "start"
    }];

    for (let i = 1; i < groupQuestionIds.length; i++) {
        members.push({
            "id": groupQuestionIds[i],
            "position": "middle"
        })
    }

    members.push({
        "id": last,
        "position": "end"
    });

    return {
        "objectType": "SurveyItemGroup",
        "start": first,
        "end": last,
        "members": members
    }
}