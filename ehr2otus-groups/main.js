const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const ehrTemplateFilter = require('./code/ehrTemplateFilter');
const OtusTemplatePartsGenerator = require("./code/OtusTemplatePartsGenerator");

function outputDirPath(){
    return process.cwd() + "/output/";
}

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

main();

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

    // FileHandler.writeJson(templateInfo.acronym+"-end-page-sentences.json", ehr.endPage.getSentencesObject());
}

function exportResumes(ehr, acronym, path){
    path += "resume/";
    FileHandler.mkdir(path);
    path += acronym;
    FileHandler.write(path + "-resume0-questions.txt", ehr.resume());
    FileHandler.write(path + "-resume1-cuts.txt", ehr.resumeCuts());
    FileHandler.writeJson(path + "-resume2-routes.json", ehr.resumeRoutesJson());
    FileHandler.writeJson(path + "-resume3-groups.json", ehr.resumeGroupsJson());
    // FileHandler.writeJson("dictQuestionNameId.json", globalVars.dictQuestionNameId);
}