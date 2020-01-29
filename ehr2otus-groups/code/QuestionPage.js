const globalVars = require('./globalVars');

const AutoCompleteQuestion = require('./questions/AutoCompleteQuestion');
const BooleanQuestion = require('./questions/BooleanQuestion');
const DateQuestion = require('./questions/DateQuestion');
const NumericQuestion = require('./questions/NumericQuestion');
const SingleSelectionQuestion = require('./questions/SingleSelectionQuestion');
const TextQuestion = require('./questions/TextQuestion');

const NavigationHandler = require('./NavigationHandler');
const Branch = require('./Branch');
const Route = require('./Route');
const Expression = require('./Expression');
const Group = require('./Group');

const OTUS_QUESTIONS_LIST = globalVars.OTUS_TEMPLATE_ATTRIBUTES.QUESTIONS;
const OTUS_NAVIGATION_LIST = globalVars.OTUS_TEMPLATE_ATTRIBUTES.NAVIGATION_LIST;
const OTUS_GROUP_LIST = globalVars.OTUS_TEMPLATE_ATTRIBUTES.GROUPS_LIST;

class QuestionPage {

    constructor(){
        this.id = '';
        this.nextPageId = '';
        this.questions = [];
        this.branches = [];
        this.basicQuestionGroups = {};
        this.hiddenQuestions = [];

        this.hiddenIndexes = [];
        this.cutIndexes = [];
        this.routes = {};
        this.groups = [];
    }

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

        this._readQuestions(ehrQuestionPageObj.questions);
        this._reorganizeQuestionsThatHiddenQuestion2();
        this._setCutIndexes();

        if(ehrQuestionPageObj.branch){
            this._readRules(ehrQuestionPageObj.branch);
        }
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
            for (let questionObj of questionObjsArr) {
                let questionClazz = questionFuncDict[questionObj.type];
                let question = new questionClazz(questionObj, this.id);
                this.questions.push(question);
                globalVars.dictQuestionNameId[question.name] = question.id;

                if (questionObj.basicGroup) {
                   this. _addQuestionInQuestionGroup(question.id, question.basicGroup);
                }

                if(question.hiddenQuestion){
                    this.hiddenQuestions.push({
                        hidden: question.hiddenQuestion.name,
                        hiddenBy: question.id
                    });
                }
            }
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    _addQuestionInQuestionGroup(questionId, basicQuestionGroupId){
        try{
            this.basicQuestionGroups[basicQuestionGroupId].push(questionId);
        }
        catch(e){
            if(this.basicQuestionGroups[basicQuestionGroupId]){
                throw e;
            }
            this.basicQuestionGroups[basicQuestionGroupId] = [questionId];
        }
    }

    _getBasicGroupFirstQuestion(basicQuestionGroupId){
        return this.basicQuestionGroups[basicQuestionGroupId][0];
    }

    _reorganizeQuestionsThatHiddenQuestion2(){
        for(let hiddenQuestion of this.hiddenQuestions){
            const id = hiddenQuestion.hiddenBy;
            const hiddenQuestionId = globalVars.dictQuestionNameId[hiddenQuestion.hidden];
            const index = this._indexOfQuestionById(id);
            let hiddenIndex = this._indexOfQuestionById(hiddenQuestionId);

            if(hiddenIndex < 0){
                const id = this._getBasicGroupFirstQuestion(hiddenQuestion.hidden);
                hiddenIndex = this._indexOfQuestionById(id);
            }

            if(hiddenIndex === index-1){
                [this.questions[index], this.questions[hiddenIndex]] = [this.questions[hiddenIndex], this.questions[index]];
                hiddenIndex = index;
            }

            this.hiddenIndexes.push(hiddenIndex);
        }
    }

    _setCutIndexes(){
        const lastPageQuestionIndex = this.questions.length-1;
        let groupCutIndexes = [];
        for(let arr of Object.values(this.basicQuestionGroups)){
            let n = arr.length;
            if(n > 1){
                const firstIndex = this._indexOfQuestionById(arr[0]);
                if(this.hiddenIndexes.includes(firstIndex)){
                    this.hiddenIndexes = this.hiddenIndexes.filter(x => x !== firstIndex);
                }
                if(firstIndex-1 >= 0){
                    groupCutIndexes.push(firstIndex-1);
                }

                const lastIndex = this._indexOfQuestionById(arr[n-1]);
                if(!this.hiddenIndexes.includes(lastIndex) && lastIndex !== lastPageQuestionIndex){
                    groupCutIndexes.push(lastIndex);
                }
            }
        }

        for(let index of this.hiddenIndexes){
            this.cutIndexes.push(index);
            if(index > 0 && !this.cutIndexes.includes(index-1)) {
                this.cutIndexes.push(index - 1);
            }
        }

        this.cutIndexes = this.cutIndexes.filter(x => x < lastPageQuestionIndex && !groupCutIndexes.includes(x))
            .concat(groupCutIndexes).sort();
    }

    _readRules(ehrBranchArr){        
        for(let ehrBranch of ehrBranchArr) {
            //const branch = new Branch(this.id, ehrBranch);//.
            this.branches.push(new Branch(this.id, ehrBranch));
        }
    }

    /* -----------------------------------------------------
     * After read all questionnaire
     */

    setRoutes(){
        this._setGroups();
        this._setRoutesByCutIndexes();
        this._setRoutesFromBranches();
    }

    _setGroups(){
        const n = this.questions.length;
        let start=0;
        for(let index of this.cutIndexes.concat([n-1])){
            const group = this.questions.slice(start, index+1).map(q => q.id);
            if(group.length >= 2){
                this.groups.push(new Group(group, group[0].basicGroup));
            }
            start = index+1;
        }
    }

    _someGroupContainsQuestion(questionId){
        for(let group of this.groups){
            if(group.containsQuestion(questionId)){
                return group;
            }
        }
    }

    _setRoutesByCutIndexes(){
        const n = this.questions.length;
        for (let i = 0; i < n-1; i++) {
            if(this.hiddenIndexes.includes(i+1)){
                this._addNewRoute(i, i+2);

                let question = this.questions[i];
                const operator = Expression.equalOperator();
                const value = question.hiddenQuestion.isVisibleWhenThisAnswerIs;
                const expression = new Expression(question.name, question.id, operator, value);
                this._addNewRoute(i, i+1, [expression]);
            }
            else{
                this._addNewRoute(i, i+1);
            }
        }
        this._addNewRoute(n-1, n);
    }

    _setRoutesFromBranches(){
        for(let branch of this.branches) {
            let originId =  this.questions[0].id;
            let group = this._someGroupContainsQuestion(originId);
            if(group){
                originId = group.getLastQuestion();
            }

            const targetId = _getQuestionIdDefaultRouteToNextPage(branch.targetPageId);

            let conditions = [];
            for(let condition of branch.rules){
                conditions.push(condition.expressions);
            }

            this.routes[originId].push(new Route(originId, targetId, conditions));
        }
    }

    _addNewRoute(originIndex, targetIndex, conditions){
        const originId = this.questions[originIndex].id;
        const targetId = this._getNextQuestionId(targetIndex-1);// -1 coz method look for arg+1
        try{
            this.routes[originId].push(new Route(originId, targetId, conditions));
        }catch (e) {
            this.routes[originId] = [new Route(originId, targetId, conditions)];
        }
    }

    /* -----------------------------------------------------
     * Conversion To Otus
     */

    toOtusStudioTemplate(otusStudioTemplate){

        for(let question of this.questions){
            otusStudioTemplate[OTUS_QUESTIONS_LIST].push(question.toOtusTemplate());

            for(let route of this.routes[question.id]){
                otusStudioTemplate[OTUS_NAVIGATION_LIST].push(route.toOtusTemplate());
            }
        }

        for(let group of this.groups){
            otusStudioTemplate[OTUS_GROUP_LIST].push(group.toOtusTemplate());
        }
    }


    /*
     * Debug
     */

    hasQuestion(questionId){
        return (this.questions.filter(question => question.id === questionId).length > 0);
    }

    resume(){
        let content = this.id + "\n";
        for (let i = 0; i < this.questions.length; i++) {
            const questionId = this.questions[i].id;
            const isHiddenBySomebody = (this.hiddenIndexes.includes(i) ? "\t*h" : "");
            let isInSomeBasicGroup = "";
            for(let [id, arr] of Object.entries(this.basicQuestionGroups)){
                if(arr.includes(questionId)){
                    isInSomeBasicGroup = "\t" + id;
                    break;
                }
            }
            let indexStr = `${i}`;
            indexStr = indexStr.padStart(2, ' ');
            content += `\t(${indexStr})\t${questionId}${isInSomeBasicGroup}${isHiddenBySomebody}\n`;
        }
        return content;
    }

    resumeWithCuts(){
        let content = this.id + "\n";
        for (let i = 0; i < this.questions.length; i++) {
            const questionId = this.questions[i].id;
            const isHiddenBySomebody = (this.hiddenIndexes.includes(i) ? "\t*h" : "");
            let isInSomeBasicGroup = "";
            for(let [id, arr] of Object.entries(this.basicQuestionGroups)){
                if(arr.includes(questionId)){
                    isInSomeBasicGroup = "\t" + id;
                    break;
                }
            }
            let indexStr = `${i}`;
            indexStr = indexStr.padStart(2, ' ');
            content += `\t(${indexStr})\t${questionId}${isInSomeBasicGroup}${isHiddenBySomebody}\n`;

            if(this.cutIndexes.includes(i)){
                content += '\t----------------------------------\n';
            }
        }
        return content;
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