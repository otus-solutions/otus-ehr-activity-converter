const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const ehrTemplateFilter = require('./code/assert/ehrTemplateFilter');

const outputDirPath = process.cwd() + "/output/";

function generateTemplateOID(){
    //TODO
    return "eleaOtusSUQ6W3VuZGVmaW5lZF1zdXJ2ZXlVVUlEOltiYmFjYzM1MC1lNDdjLTExZTktOGVmNy02MTUwOTJlYjNkOTFdcmVwb3NpdG9yeVVVSUQ6WyBOb3QgZG9uZSB5ZXQgXQ==";
}

function createEmptyOtusSutioTemplateObj(name, acronym, oid) {
    return {
        "extents": "StudioObject",
        "objectType": "Survey",
        "oid": oid,
        "identity": {
            "extents": "StudioObject",
            "objectType": "SurveyIdentity",
            "name": name,
            "acronym": acronym,
            "recommendedTo": "",
            "description": "",
            "keywords": []
        },
        "metainfo": {
            "extents": "StudioObject",
            "objectType": "SurveyMetaInfo",
            "creationDatetime": "2019-10-01T18:53:18.725Z",
            "otusStudioVersion": ""
        },
        "dataSources": [],
        "itemContainer": [],
        "navigationList": [],
        "staticVariableList": [],
        "surveyItemGroupList": []
    }
}


function readEhrXMLAndFilter(outputPath, filename, path){
    const xmlFilePath = process.cwd() + "/input/" + filename;
    let ehrTemplate = FileHandler.xml2json(xmlFilePath, ehrTemplateFilter.TAG_SEPARATOR).survey;
    FileHandler.writeJson(path+".json", ehrTemplate);

    ehrTemplate = ehrTemplateFilter.extractQuestionsFromArrays(ehrTemplate, 1);
    FileHandler.writeJson(path+"-filtered.json", ehrTemplate);
}

function makeConversionEhr2OtusTemplate(acronym, templateInfo, path){
    const ehrTemplate = FileHandler.readJsonSync(path +"-filtered.json");

    const ehr = new EhrQuestionnaire();
    ehr.readFromJsonObj(ehrTemplate);

    FileHandler.write(path + "-resume0-questions.txt", ehr.resume());
    // FileHandler.write(path + "-resume1-cuts.txt", ehr.resumeCuts());
    // FileHandler.writeJson(path + "-resume2-routes.json", ehr.resumeRoutesJson());
    // FileHandler.writeJson(path + "-resume3-groups.json", ehr.resumeGroupsJson());
    // FileHandler.writeJson("dictQuestionNameId.json", globalVars.dictQuestionNameId);

    let otusTemplate = createEmptyOtusSutioTemplateObj(templateInfo.name, acronym, generateTemplateOID());
    ehr.toOtusStudioTemplate(otusTemplate);
    FileHandler.writeJson(path+"-otus-result.json", otusTemplate);

    // const endPageSentences = ehr.endPage.getSentencesObject();
    // FileHandler.writeJson(templateInfo.acronym+"-end-page-sentences.json", endPageSentences);
}

function main(){
    const func = process.argv[process.argv.length-1];

    const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/templateInfo.json");
    for(let [acronym, info] of Object.entries(templatesInfo)){

        const path = outputDirPath + acronym + "/";
        FileHandler.mkdir(path);

        switch (func) {
            case 'read':
                readEhrXMLAndFilter(acronym, info.filename, path + acronym);
                break;
            case 'parse':
                makeConversionEhr2OtusTemplate(acronym, info, path + acronym);
                break;
        }

        // edit templat manually to reallocate hiddenQuestions
    }
}

main();