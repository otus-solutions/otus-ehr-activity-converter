const fileSystem    = require('file-system');
const fs            = require('fs');
const pathPkg       = require('path');
const loadJsonFile  = require('load-json-file');

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
        console.log(`The file ${path} was saved!`);
    }

    static append(path, content) {
        fs.appendFile(path, content, function (err) {
            if(err) {
                throw err;
            }
        });
        console.log(`The file ${path} was appended!`);
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
        console.log(`The file ${path} was saved!`);
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
}

module.exports = FileHandler;