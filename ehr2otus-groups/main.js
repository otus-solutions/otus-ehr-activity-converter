//require('custom-env').env('staging');
const xml2js = require('xml2js');
const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const otusTemplateReader = require('./code/assert/otusTemplateReader');
const ehrTemplateFilter = require('./code/assert/ehrTemplateFilter');
const assertRoutes = require('./code/assert/assertRoutes');

const outputDirPath = process.cwd() + "/output/";

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

    try {
        let resultObj = {};
        const xml_string = FileHandler.read(ehrXmlFilePath);
        const parser = new xml2js.Parser({ attrkey: ATTR_KEY });
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

function getFilteredTemplateFilename(acronym) {
    return acronym+"-filtered.json";
}

function getFilteredTemplateManuallyEditedFilename(acronym) {
    return acronym+"-filtered-manually-edited.json";
}

function readEhrXMLAndFilter(templateInfo){
    const xmlFilePath = process.cwd() + "/input/" + templateInfo.filename;
    let ehrTemplate = xml2json(xmlFilePath).survey;
    ehrTemplate = ehrTemplateFilter.extractQuestionsFromArrays(ehrTemplate, 1);
    writeOutputJsonFile(getFilteredTemplateFilename(templateInfo.acronym), ehrTemplate);
}

function openEhrFilteredTemplate(acronym){
    return FileHandler.readJsonSync(outputDirPath + getFilteredTemplateManuallyEditedFilename(acronym));
}

function writeOutputJsonFile(filename, content){
    const path = outputDirPath + filename;
    FileHandler.write(path, JSON.stringify(content, null, 4));
}

function exportResumes(ehrQuestionnaire, acronym){
    const prefixPath = outputDirPath + acronym + "-resume-";
    FileHandler.write(prefixPath + "questions.txt", ehr.resume());
    FileHandler.write(prefixPath + "cuts.txt", ehr.resumeWithCuts());
    FileHandler.writeJson(prefixPath + "routes.json", ehr.resumeRoutesJson());
    FileHandler.writeJson(prefixPath + "groups.json", ehr.resumeGroupsJson());
}

function makeConversionEhr2OtusTemplate(templateInfo){

    const ehrTemplate = openEhrFilteredTemplate(templateInfo.acronym);

    const ehr = new EhrQuestionnaire();
    ehr.readFromJsonObj(ehrTemplate);
    
    //exportResumes(ehr, templateInfo.acronym);
    // writeOutputJsonFile("dictQuestionNameId.json", globalVars.dictQuestionNameId);

    const oid = "eleaOtusSUQ6W3VuZGVmaW5lZF1zdXJ2ZXlVVUlEOltiYmFjYzM1MC1lNDdjLTExZTktOGVmNy02MTUwOTJlYjNkOTFdcmVwb3NpdG9yeVVVSUQ6WyBOb3QgZG9uZSB5ZXQgXQ==";
    let otusTemplate = createEmptyOtusSutioTemplateObj(templateInfo.name, templateInfo.acronym, templateInfo.oid);
    ehr.toOtusStudioTemplate(otusTemplate);
    writeOutputJsonFile(templateInfo.acronym+"-otus-result.json", otusTemplate);

    // const endPageSentences = ehr.endPage.getSentencesObject();
    // writeOutputJsonFile(templateInfo.acronym+"-end-page-sentences.json", endPageSentences);
}


function main(){
    try {
        FileHandler.mkdir(outputDirPath);

        const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/input/templateInfo.json").templatesInfo;
        for(let templateInfo of templatesInfo){
            //readEhrXMLAndFilter(templateInfo);
            // edit templat manually to reallocate hiddenQuestions
            makeConversionEhr2OtusTemplate(templateInfo);
        }
    }
    catch (e) {
        console.log(e);
    }
}

main();