const globalVars = require('./globalVars');
const QuestionPage = require('./QuestionPage');
const EndPage = require('./EndPage');
const NavigationHandler = require('./NavigationHandler');

class EhrQuestionnaire {

    constructor(){
        this.metaDataGroups = {};
        this.choiceGroups = {};
        this.questionPages = [];
        this.endPage = new EndPage();
        this.defaultRouteQuestionIds = [];
        globalVars.ehrQuestionnaire = this;
    }

    get getFirstQuestionPage(){
        return this.questionPages[0];
    }

    get getLastQuestionPage(){
        return this.questionPages[this.questionPages.length-1];
    }

    getQuestionPage(searchQuestionPageId){
        return (this.questionPages.filter((questionPage) => questionPage.id === searchQuestionPageId))[0];
    }
    getQuestionPageByNumber(searchQuestionPageNumber){
        const searchQuestionPageId = "PAGE_" + String(searchQuestionPageNumber).padStart(3, '0');
        return (this.questionPages.filter((questionPage) => questionPage.id === searchQuestionPageId))[0];
    }

    getPreviousQuestionPageOf(searchQuestionPageId){
        let searchQuestionPageIndex = this.defaultRouteQuestionIds.indexOf(searchQuestionPageId);
        if(searchQuestionPageIndex === 0){
            throw globalVars.DEFAULT_NODES.BEGIN;
        }
        let prevQuestionPageId = this.defaultRouteQuestionIds[searchQuestionPageIndex-1];
        return (this.questionPages.filter((questionPage) => questionPage.id === prevQuestionPageId))[0];
    }

    getFirstQuestionIdFromQuestionPage(searchQuestionPageId){
        if(searchQuestionPageId === this.endPage.id){
            throw this.endPage.id;
        }
        return this.getQuestionPage(searchQuestionPageId).getFirstQuestion().id;
    }

    getLastQuestionIdFromQuestionPage(searchQuestionPageId){
        return this.getQuestionPage(searchQuestionPageId).getLastQuestion().id;
    }

    readFromJsonObj(ehrTemplate){
        for(let metadataObj of ehrTemplate["metaDataGroup"]){
            let id = metadataObj["id"];
            this.metaDataGroups[id] = metadataObj["metaDataValue"];
        }
        globalVars.metaDataGroups = this.metaDataGroups;

        for(let choiceObj of ehrTemplate["choiceGroup"]){
            let id = choiceObj["id"];
            this.choiceGroups[id] = choiceObj["choice"];
        }
        globalVars.choiceGroups.set(this.choiceGroups);

        const ehrQuestionPages = ehrTemplate.questionPage.filter((questionPage) => questionPage.id !== this.endPage.id);

        let setFirstQuestionPage = false;

        for(let ehrQuestionPage of ehrQuestionPages){
            let questionPage = new QuestionPage();
            questionPage.readFromJsonObj(ehrQuestionPage);
            this.questionPages.push(questionPage);

            if(this.defaultRouteQuestionIds.includes(questionPage.id)){
                this.defaultRouteQuestionIds.push(questionPage.nextPageId);
            } else if(!setFirstQuestionPage){
                setFirstQuestionPage = true;
                this.defaultRouteQuestionIds.push(questionPage.id, questionPage.nextPageId);
            }
        }

        const ehrEndPageObj = ehrTemplate.questionPage.filter((questionPage) => questionPage.id === this.endPage.id)[0];
        this.endPage.readFromJsonObj(ehrEndPageObj);

        this._readRoutes();
    }

    _readRoutes(){
        for(let ehrQuestionPage of this.questionPages){
            ehrQuestionPage.setRoutesByCutIndexes();
        }
    }

    resume(){
        let content = "";
        for (let question of this.questionPages) {
            content += question.resume() + "\n";
        }
        return content;
    }

    resumeWithCuts(){
        let content = "";
        for (let question of this.questionPages) {
            content += question.resumeWithCuts() + "\n";
        }
        return content;
    }

    toOtusStudioTemplate(emptyOtusStudioTemplate){
        const firstQuestionId = this.getFirstQuestionPage.getFirstQuestion().id;
        emptyOtusStudioTemplate["navigationList"].push(
            NavigationHandler.navigationBeginNodeItem(firstQuestionId));

        const lastQuestion = this.getLastQuestionPage.getLastQuestion();
        emptyOtusStudioTemplate["navigationList"].push(
            NavigationHandler.navigationEndNodeItem(lastQuestion.id, lastQuestion.index));

        for(let questionPage of this.questionPages){
            questionPage.toOtusStudioTemplate(emptyOtusStudioTemplate);
        }
    }

    findPageOfQuestionId(questionId){
        let i = 0, found = false;
        while( i < this.questionPages.length && !found){
            found = this.questionPages[i].hasQuestion(questionId);
            i++;
        }
        if(!found){
            return null;
        }
        return this.questionPages[i-1].id;
    }

}

module.exports = EhrQuestionnaire;