
function extractNodeInfoFromOtusNavigationList(item){
    const node = item.origin;
    let prev = item.inNavigations[0];
    try{ prev = prev.origin; }
    catch (e) {}

    let next = item.routes.filter(r => r.isDefault)[0];
    try{ next = next.destination; }
    catch (e) {}

    let jumps = [];
    for(let route of item.routes.filter(r => !r.isDefault)){
        let rules = [];
        for(let rule of route.conditions[0].rules){
            rules.push(`${rule.when} ${rule.operator} ${rule.answer}`);
        }
        jumps.push({
            destination: route.destination,
            rules: rules
        });
    }

    return {
        id: item.origin,
        prev: prev,
        next: next,
        jumps: jumps
    }
}

function findNodeInEhr(nodeInfo, ehrTemplate, ehrQuestionaire){
    const pageId = ehrQuestionaire.findPageOfQuestionId(nodeInfo.id);
    const questionPage = ehrTemplate.questionPages.filter(qp => qp.id===pageId);
    try{
        const outKeys = ['header', 'id', 'nextPageId', 'branch'];
        const questionTypeArr = Object.keys(questionPage).filter(key => !outKeys.includes(key));
        //console.log(questionPage.id, keys);

        for(let question of questionTypeArr){
            if(key === 'basicQuestionGroup'){
                extractQuestionsFromKey(questionPage, key, questions);
            }
            else{
                extractQuestionsFromKey(questionPage, key, questions);
            }
        }
    }
    catch (e) {

    }
    console.log(nodeInfo.id, pageId);
}

function ehrContainsOtusRoutes(otusTemplate, ehrTemplate, ehrQuestionaire){
    let nodeInfo = null;
    for(let node of otusTemplate.navigationList.slice(2, otusTemplate.navigationList.length-1)){
        nodeInfo = extractNodeInfoFromOtusNavigationList(node);
        findNodeInEhr(nodeInfo, ehrTemplate, ehrQuestionaire);
    }
}

module.exports = {
    ehrContainsOtusRoutes: ehrContainsOtusRoutes
};