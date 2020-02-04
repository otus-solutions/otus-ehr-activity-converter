const fileSystem    = require('file-system');
const fs            = require('fs');
const pathPkg       = require('path');
const loadJsonFile  = require('load-json-file');
const xml2js        = require('xml2js');

class FileHandler {

    static getDirFiles(dirPath){
        return fs.readdirSync(dirPath); // array with  relative path files
    }

    static mkdir (dirPath) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }
    }

    static getBaseName(path) {
        return pathPkg.basename(path);
    }

    static getFileName(path) {
        return pathPkg.parse(path).name;
    }

    static read(path){
        return fs.readFileSync(path, "utf8");
    }

    static write(path, content){
        fileSystem.writeFile(path, content, function(err) {
            if(err) {
                throw err;
            }
        });
        console.log(`The file ${path.replace(process.cwd(), ".")} was saved!`);
    }

    static append(path, content) {
        fs.appendFile(path, content, function (err) {
            if(err) {
                throw err;
            }
        });
        //console.log(`The file ${path.replace(process.cwd(), ".")} was appended!`);
    }

    static delete(path){
        fs.unlink(path, (err) => {
            if (err) {
                throw err;
            }
        });
        //console.log(`The file ${path} was deleted!`);
    }

    // -------------------------------------------------
    // json files

    // sync
    static writeJson(path, obj){
        const content = JSON.stringify(obj, null, 4);
        fileSystem.writeFile(path, content, function(err) {
            if(err) {
                throw err;
            }
        });
        console.log(`The file ${path.replace(process.cwd(), ".")} was saved!`);
    }

    // async
    static async readJson(path) {
        return await loadJsonFile(path);
    }

    static readJsonSync(path) {
        return JSON.parse(FileHandler.read(path));
    }

    static async readJsonAttribute(path, attributeName) {
        let data = await loadJsonFile(path);
        return data[attributeName];
    }


    /*
     * xml 2 json
     */
    static xml2json(ehrXmlFilePath, tagSeparator) {
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
            if(tagName === "finalPage" || tagName.includes("Question"))
                return `${tagName}${tagSeparator}${tagIndex++}`;
    
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
}

module.exports = FileHandler;