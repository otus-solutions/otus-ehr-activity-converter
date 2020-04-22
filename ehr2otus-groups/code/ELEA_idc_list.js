const FileHandler = require('./code/FileHandler');

function IDCList(){
    const dirPath = process.cwd() + "/output/";
    const cidList = FileHandler.read(dirPath + "listaCID10.txt").split("\n")
        .map(x => {
            let parts = x.split(";");
            return { code: parts[0], description: parts[1] }
        })
        .filter(x => !x.code.includes("."));

    let content = "";

    for (let cid of cidList){
        content += `${cid.description};${cid.code}\n`;
    }

    FileHandler.write(dirPath + "listaCID10.csv", content);
}

IDCList();