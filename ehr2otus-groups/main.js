const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const ehrTemplateFilter = require('./code/assert/ehrTemplateFilter');
const OtusTemplatePartsGenerator = require("./code/OtusTemplatePartsGenerator");

function outputDirPath(){
    return process.cwd() + "/output/";
}

function main(){
    const func = process.argv[process.argv.length-1];

    const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/templateInfo.json");
    for(let [acronym, info] of Object.entries(templatesInfo)){

        const path = outputDirPath() + acronym + "/";
        FileHandler.mkdir(path);

        switch (func) {
            case 'read':
                readEhrXMLAndFilter(info.filename, path + acronym);
                break;
            case 'parse':
                makeConversionEhr2OtusTemplate(acronym, info, path);
                break;
        }
    }
}

main();

function readEhrXMLAndFilter(filename, path){
    const xmlFilePath = process.cwd() + "/input/" + filename;
    let ehrTemplate = FileHandler.xml2json(xmlFilePath, ehrTemplateFilter.TAG_SEPARATOR).survey;
    FileHandler.writeJson(path+".json", ehrTemplate);

    ehrTemplate = ehrTemplateFilter.extractQuestionsFromArrays(ehrTemplate, 1);
    FileHandler.writeJson(path+"-filtered.json", ehrTemplate);
}

function makeConversionEhr2OtusTemplate(acronym, templateInfo, path){
    const ehrTemplate = FileHandler.readJsonSync(path + acronym +"-filtered.json");

    const ehr = new EhrQuestionnaire();
    ehr.readFromJsonObj(ehrTemplate);
    exportResumes(ehr, acronym, path);    

    let otusTemplate = OtusTemplatePartsGenerator.getEmptyTemplate(templateInfo.name, acronym);
    ehr.toOtusStudioTemplate(otusTemplate);
    FileHandler.writeJson(path + acronym + "-otus-result.json", otusTemplate);
    
    // FileHandler.writeJson(templateInfo.acronym+"-end-page-sentences.json", ehr.endPage.getSentencesObject());
}

function exportResumes(ehr, acronym, path){
    path += "/resume/";
    FileHandler.mkdir(path);
    path += acronym;
    FileHandler.write(path + "-resume0-questions.txt", ehr.resume());
    FileHandler.write(path + "-resume1-cuts.txt", ehr.resumeCuts());
    FileHandler.writeJson(path + "-resume2-routes.json", ehr.resumeRoutesJson());
    FileHandler.writeJson(path + "-resume3-groups.json", ehr.resumeGroupsJson());
    // FileHandler.writeJson("dictQuestionNameId.json", globalVars.dictQuestionNameId);
}