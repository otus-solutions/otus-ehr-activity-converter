const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const ehrTemplateFilter = require('./code/ehrTemplateFilter');
const OtusTemplatePartsGenerator = require("./code/OtusTemplatePartsGenerator");
const Expression = require('./code/Expression');

function outputDirPath(){
    return process.cwd() + "/output/";
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

    const ehr = new EhrQuestionnaire();
    ehr.readFromJsonObj(ehrTemplate);
    exportResumes(ehr, acronym, outputPath);

    let otusTemplate = OtusTemplatePartsGenerator.getEmptyTemplate(templateName, acronym, templateInfo.oid, templateInfo.creationDate);
    ehr.toOtusStudioTemplate(otusTemplate);
    FileHandler.writeJson(outputPath + acronym + "-otus-result.json", otusTemplate);

    resumeOtusTemplateNavigation(outputPath + "/resume/" + acronym + "-otus-result-navigation-resume.txt", otusTemplate.navigationList);
}

function exportResumes(ehr, acronym, path){
    path += "resume/";
    FileHandler.mkdir(path);
    path += acronym;
    FileHandler.write(path + "-resume0-questions.txt", ehr.resume());
    FileHandler.write(path + "-resume0-branches.txt", ehr.resumeBranches());
    FileHandler.write(path + "-resume0-branches-with-questions.txt", ehr.resumeBranchesWithQuestions());
    FileHandler.write(path + "-resume1-cuts.txt", ehr.resumeCuts());
    FileHandler.writeJson(path + "-resume2-routes.json", ehr.resumeRoutesJson());
    FileHandler.writeJson(path + "-resume3-groups.json", ehr.resumeGroupsJson());
    // FileHandler.writeJson("dictQuestionNameId.json", globalVars.dictQuestionNameId);
}

function resumeOtusTemplateNavigation(outputPath, otusTemplateNavigationList){

    FileHandler.write(outputPath, "");

    for(let item of otusTemplateNavigationList){
        const origin = item.origin;
        for(let route of item.routes){
            let content = `${origin} -> ${route.destination} `;
            if(route.isDefault){
                content += "*";
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
                content += "\t" + JSON.stringify(conditions) ;
            }

            FileHandler.append(outputPath, content + "\n");
        }
    }
}