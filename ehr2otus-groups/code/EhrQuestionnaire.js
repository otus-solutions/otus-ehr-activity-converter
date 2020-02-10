const globalVars = require('./globalVars');
const QuestionPage = require('./QuestionPage');
const OtusTemplatePartsGenerator = require('./OtusTemplatePartsGenerator');
const GraphViz = require('./GraphViz');

class EhrQuestionnaire {

    constructor(){
        this.metaDataGroups = {};
        this.choiceGroups = {};
        this.questionPages = [];
        this.defaultRouteQuestionIds = [];
        globalVars.ehrQuestionnaire = this;
        this.defaultRoutePageIds = [];
    }

    get getFirstQuestionPage(){
        return this.questionPages[0];
    }

    getQuestionPage(searchQuestionPageId){
        return (this.questionPages.filter((questionPage) => questionPage.id === searchQuestionPageId))[0];
    }

    getFirstQuestionIdFromQuestionPage(searchQuestionPageId){
        return this.getQuestionPage(searchQuestionPageId).getFirstQuestion().id;
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

        const ehrQuestionPages = ehrTemplate.questionPage.filter((questionPage) => questionPage.id !== globalVars.CONDITIONS_END_PAGE_ID);

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

        let prevOfFirstQuestion = globalVars.DEFAULT_NODES.BEGIN;
        this.defaultRoutePageIds = [this.questionPages[0].id];

        for(let questionPage of this.questionPages){
            prevOfFirstQuestion = questionPage.setRoutes(prevOfFirstQuestion);

            if(this.defaultRoutePageIds.includes(questionPage.id)){
                this.defaultRoutePageIds.push(questionPage.nextPageId);
            }
        }

        this.defaultRoutePageIds.pop(); // take off END PAGE
    }

    toOtusStudioTemplate(emptyOtusStudioTemplate){
        const firstQuestionId = this.getFirstQuestionPage.getFirstQuestion().id;
        emptyOtusStudioTemplate["navigationList"].push(
            OtusTemplatePartsGenerator.getNavigationBeginNode(firstQuestionId));

        const lastQuestionPageId = this.defaultRoutePageIds.pop();
        const lastQuestion = this.questionPages.filter(qp => qp.id === lastQuestionPageId)[0].getLastQuestionNotHidden();
        emptyOtusStudioTemplate["navigationList"].push(
            OtusTemplatePartsGenerator.getNavigationEndNode(lastQuestion.id, lastQuestion.index));

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

    findQuestionById(questionId){
        let i = 0, question = null;
        while(!question && i < this.questionPages.length){
            question = this.questionPages[i].getQuestionById(questionId);
            i++;
        }
        return question;
    }


    /*
     * Debug
     */

    resume(){
        let content = "";
        for (let questionPage of this.questionPages) {
            content += questionPage.resume() + "\n";
        }
        return content;
    }

    resumeBranches(){
        let content = "";
        for (let questionPage of this.questionPages) {
            content += questionPage.resumeBranches() + "\n";
        }
        return content;
    }

    resumeBranchesWithQuestions(){
        let content = "";
        for (let questionPage of this.questionPages) {
            content += questionPage.resumeBranchesWithQuestions();
        }
        return content;
    }

    resumeCuts(){
        let content = "";
        for (let questionPage of this.questionPages) {
            content += questionPage.resumeCuts() + "\n";
        }
        return content;
    }

    resumeRoutesJson(){
        let json = {};
        for (let questionPage of this.questionPages) {
            json[questionPage.id] = questionPage.routes;
        }
        return json;
    }

    resumeGroupsJson(){
        let json = {};
        for (let questionPage of this.questionPages) {
            if(questionPage.groups.length > 0){
                json[questionPage.id] = questionPage.groups;
            }
        }
        return json;
    }

    toGraphViz(outputPath){
        const totalPages = this.questionPages.length,
              numPagesByFile = 5;

        for (let k = 0; k < totalPages; k=k+numPagesByFile) {
            const start = k, 
                  end = Math.min(k+numPagesByFile, totalPages-1),
                  ehrGraphViz = new GraphViz(),
                  otusGraphViz = new GraphViz();

            for (let i = start; i < end; i++) {
                this.questionPages[i].fillEHRGraphViz(ehrGraphViz);
                this.questionPages[i].fillOtusGraphViz(otusGraphViz);
            }

            ehrGraphViz.save(`${outputPath}${this.questionPages[start].id}-${this.questionPages[end].id}-ehr`);
            otusGraphViz.save(`${outputPath}${this.questionPages[start].id}-${this.questionPages[end].id}-otus`);
        }
    }

}

module.exports = EhrQuestionnaire;