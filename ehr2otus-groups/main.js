const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const ehrTemplateFilter = require('./code/ehrTemplateFilter');
const OtusTemplatePartsGenerator = require("./code/OtusTemplatePartsGenerator");

function outputDirPath(){
    return process.cwd() + "/output/";
}

function main(){
    const func = process.argv[process.argv.length-1];

    const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/templateInfo.json");
    for(let [acronym, info] of Object.entries(templatesInfo)){

        console.log("\n\n" + acronym);

        try{
            const path = outputDirPath() + acronym + "/";
            FileHandler.mkdir(path);

            switch (func) {
                case 'read':
                    readEhrXMLAndFilter(info.filename, path + acronym);
                    break;
                case 'parse':
                    makeConversionEhr2OtusTemplate(acronym, info, path);
                    break;
                case 'go':
                    readAndParse(acronym, info, path);
                    break;
            }
        }
        catch(e){
            console.log(e);
        }
    }
}

main();

function readEhrXMLAndFilter(filename, outputPath){
    const xmlFilePath = process.cwd() + "/input/" + filename;
    let ehrTemplate = FileHandler.xml2json(xmlFilePath, ehrTemplateFilter.TAG_SEPARATOR);
    FileHandler.writeJson(outputPath+".json", ehrTemplate);

    const templateName = `${ehrTemplate.survey.title} (${ehrTemplate.survey.version})`;
    console.log(templateName);

    ehrTemplate = ehrTemplateFilter.extractQuestionsFromArrays(ehrTemplate.survey, 1);
    FileHandler.writeJson(outputPath+"-filtered.json", ehrTemplate);
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