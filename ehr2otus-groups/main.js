const xml2js = require('xml2js');
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

function xml2json(ehrXmlFilePath) {
    const ATTR_KEY = 'ATTR';
    let tagIndex = 0;

    function walkJsonObjectToDeleteAttributeKey(jsonObj) {
        for (let key in jsonObj) {
            if(key === ATTR_KEY){
                for (let [key2, value] of Object.entries(jsonObj[ATTR_KEY])){
                    jsonObj[key2] = value;
                }
                delete jsonObj[ATTR_KEY];
            }

            if (jsonObj[key] !== null && typeof(jsonObj[key]) === "object") {
                walkJsonObjectToDeleteAttributeKey(jsonObj[key]);
            }
        }
    }

    function setIndexAtTag(tagName){
        if(tagName.includes("Question"))
            return `${tagName}${ehrTemplateFilter.TAG_SEPARATOR}${tagIndex++}`;

        return tagName;
    }

    try {
        let resultObj = {};
        const xml_string = FileHandler.read(ehrXmlFilePath);
        const parser = new xml2js.Parser({ attrkey: ATTR_KEY , tagNameProcessors: [setIndexAtTag]});
        parser.parseString(xml_string, function (error, result) {
            if (!error) {
                walkJsonObjectToDeleteAttributeKey(result);
                resultObj.result = result;
            } else {
                console.log(error);
            }
        });
        return resultObj.result;
    }
    catch (e) {
        throw e;
    }
}


function readEhrXMLAndFilter(acronym, filename){
    const xmlFilePath = process.cwd() + "/input/" + filename;
    let ehrTemplate = xml2json(xmlFilePath).survey;
    writeOutputJsonFile(acronym+".json", ehrTemplate);
    ehrTemplate = ehrTemplateFilter.extractQuestionsFromArrays(ehrTemplate, 1);
    writeOutputJsonFile(acronym+"-filtered.json", ehrTemplate);
}

function openEhrFilteredTemplate(acronym){
    return FileHandler.readJsonSync(outputDirPath + acronym +"-filtered-manually-edited.json");
}

function writeOutputJsonFile(filename, content){
    const path = outputDirPath + filename;
    FileHandler.write(path, JSON.stringify(content, null, 4));
}

function exportResumes(ehrQuestionnaire, templateOutputDirPath){
    const prefixPath = templateOutputDirPath + "-resume";
    FileHandler.write(prefixPath + "0-questions.txt", ehrQuestionnaire.resume());
    FileHandler.write(prefixPath + "1-cuts.txt", ehrQuestionnaire.resumeWithCuts());
    FileHandler.writeJson(prefixPath + "2-routes.json", ehrQuestionnaire.resumeRoutesJson());
    FileHandler.writeJson(prefixPath + "3-groups.json", ehrQuestionnaire.resumeGroupsJson());
}

function makeConversionEhr2OtusTemplate(acronym, templateInfo){

    const templateOutputDirPath = outputDirPath + acronym + "/";
    FileHandler.mkdir(templateOutputDirPath);

    const ehrTemplate = openEhrFilteredTemplate(acronym);

    const ehr = new EhrQuestionnaire();
    ehr.readFromJsonObj(ehrTemplate);

    exportResumes(ehr, templateOutputDirPath + acronym);
    // writeOutputJsonFile("dictQuestionNameId.json", globalVars.dictQuestionNameId);

    let otusTemplate = createEmptyOtusSutioTemplateObj(templateInfo.name, acronym, generateTemplateOID());
    ehr.toOtusStudioTemplate(otusTemplate);
    writeOutputJsonFile(templateOutputDirPath+acronym+"-otus-result.json", otusTemplate);

    // const endPageSentences = ehr.endPage.getSentencesObject();
    // writeOutputJsonFile(templateInfo.acronym+"-end-page-sentences.json", endPageSentences);
}

function main(){
    const func = process.argv[process.argv.length-1];

    const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/templateInfo.json");
    for(let [acronym, info] of Object.entries(templatesInfo)){

        switch (func) {
            case 'read':
                readEhrXMLAndFilter(acronym, info.filename);
                break;
            case 'parse':
                makeConversionEhr2OtusTemplate(acronym, info);
                break;
        }

        // edit templat manually to reallocate hiddenQuestions
    }
}

main();