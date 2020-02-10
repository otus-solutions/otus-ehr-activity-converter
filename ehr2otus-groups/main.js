const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const ehrTemplateFilter = require('./code/ehrTemplateFilter');
const OtusTemplatePartsGenerator = require("./code/OtusTemplatePartsGenerator");
const Expression = require('./code/Expression');

function outputDirPath(){
    return process.cwd() + "/output/";
}

function outputResumePath(acronym){
    return outputDirPath() + acronym + "/resume/" + acronym + "-";
}

main();

function main(){
    const arg = process.argv[process.argv.length-1];
    const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/templateInfo.json");

    if(Object.keys(templatesInfo).includes(arg)){
        parseTemplate(arg, templatesInfo[arg]);
    }
    else{
        for(let [acronym, info] of Object.entries(templatesInfo)){
            parseTemplate(acronym, info);
        }
    }
}

function parseTemplate(acronym, info){
    try{
        console.log("\n" + acronym);
        const path = outputDirPath() + acronym + "/";
        FileHandler.mkdir(path);
        readAndParse(acronym, info, path);
    }
    catch(e){
        console.log(e);
    }
}

function readAndParse(acronym, templateInfo, outputPath){
    const xmlFilePath = process.cwd() + "/input/" + templateInfo.filename;
    let ehrTemplate = FileHandler.xml2json(xmlFilePath, ehrTemplateFilter.TAG_SEPARATOR);
    FileHandler.writeJson(outputPath + acronym+".json", ehrTemplate.survey);

    const templateName = `${ehrTemplate.survey.title} (${ehrTemplate.survey.version})`;

    ehrTemplate = ehrTemplateFilter.extractQuestionsFromArrays(ehrTemplate.survey, 1);
    FileHandler.writeJson(outputPath + acronym+"-filtered.json", ehrTemplate);

    const resumePath = outputResumePath(acronym);

    const ehrQuestionnaire = new EhrQuestionnaire();
    ehrQuestionnaire.readFromJsonObj(ehrTemplate);
    const ehrBranchesQuestions = exportResumes(ehrQuestionnaire, resumePath);

    let otusTemplate = OtusTemplatePartsGenerator.getEmptyTemplate(templateName, acronym, templateInfo.oid, templateInfo.creationDate);
    ehrQuestionnaire.toOtusStudioTemplate(otusTemplate);
    FileHandler.writeJson(outputPath + acronym + "-otus-result.json", otusTemplate);

    const otusNavigationResume = resumeOtusTemplateNavigation(otusTemplate.navigationList, resumePath + "otus-result-navigation-resume.txt");
    compareNavigations(ehrBranchesQuestions, otusNavigationResume, resumePath+"comparison.txt");

    buildAndExportGraph(acronym, ehrQuestionnaire);
}

function exportResumes(ehr, path){
    FileHandler.write(path + "resume0-questions.txt", ehr.resume());
    FileHandler.write(path + "resume0-branches.txt", ehr.resumeBranches());
    const ehrBranchesQuestions = ehr.resumeBranchesWithQuestions();
    FileHandler.write(path + "resume0-branches-with-questions.txt", ehrBranchesQuestions);
    FileHandler.write(path + "resume1-cuts.txt", ehr.resumeCuts());
    FileHandler.writeJson(path + "resume2-routes.json", ehr.resumeRoutesJson());
    FileHandler.writeJson(path + "resume3-groups.json", ehr.resumeGroupsJson());
    return ehrBranchesQuestions.split("\n");
}

function resumeOtusTemplateNavigation(otusTemplateNavigationList, outputPath){
    let content = "";

    for(let item of otusTemplateNavigationList){
        const origin = item.origin;
        for(let route of item.routes){
            content += `${origin} -> ${route.destination} `;
            if(route.isDefault){
                content += "*\n";
            }
            else{
                let conditions = [];
                for(let condition of route.conditions){
                    let rules = [];
                    for(let rule of condition.rules){
                        rules.push(new Expression("", rule.when, rule.operator, rule.answer, rule.isMetadata));
                    }
                    conditions.push(rules);
                }
                content += JSON.stringify(conditions) + "\n";
            }
        }
    }

    FileHandler.write(outputPath, content);

    return content.split("\n");
}

function compareNavigations(ehrBranchesQuestions, otusNavigationResume, outputPath){
    let content = "";
    let found = false;

    const HIDDEN_QUESTION_SiGN = "(*h)";
    const BRANCH_SIGN = " -> ";

    for(let line of ehrBranchesQuestions){
        if(!otusNavigationResume.includes(line)){
            found = true;
            let parts = line.split(BRANCH_SIGN);
            let origins = parts[0];
            const rightHand = parts[1];
            if(!origins.includes(HIDDEN_QUESTION_SiGN)){
                content += line + "\n";
                continue;
            }
            origins = origins.split("/");
            for(let origin of origins){
                let origin2 = origin.replace(HIDDEN_QUESTION_SiGN, "");
                const branch = origin2 + BRANCH_SIGN + rightHand;
                if(!otusNavigationResume.includes(branch)){
                    content += branch + "\n";
                }
            }
        }
    }

    if(!found){
        console.log("All ok!");
        return;
    }

    FileHandler.write(outputPath, content);
}

function buildAndExportGraph(acronym, ehrQuestionnaire){

    const path = 'output/' + acronym + "/graph/";
    FileHandler.mkdir(path);
    //const path = 'output\\' + acronym + "\\graph\\"; on Windows

    ehrQuestionnaire.toGraphViz(path);
}
