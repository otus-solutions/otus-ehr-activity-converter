const FileHandler = require('./code/FileHandler');

function IDCList(){
    const dirPath = process.cwd() + "/output/";
    const cidList = FileHandler.read(dirPath + "listaCID10.txt").split("\n")
        .map(x => {
            let parts = x.split(";");
            return { code: parts[0], description: parts[1] }
        })
        .filter(x => !x.code.includes("."));

    //console.log(JSON.stringify(cidList.slice(0,50), null, 2));

    let content = "";

    for (let cid of cidList){
        content += `${cid.description};${cid.code}\n`;
    }

    // const n = cidList.length;
    // for (let i = 0; i < n; i++) {
    //     const code = cidList[i];
    //     if(!code.includes(".") && cidList.slice(i, n).includes(code+".0")){
    //         //console.log(code);
    //     }
    //     else{
    //         //content += originalContent[i].replace(";", " - ") + "\n";
    //         content += originalContent[i].split(" - ").reverse().join(";") + "\n";
    //     }
    // }

    FileHandler.write(dirPath + "listaCID10.csv", content);
}

IDCList();