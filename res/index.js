let fs=require('fs');
const { fdir } = require("fdir");

console.log(process.argv);


const dir = process.argv[2];
// const dir = 'E:\\data\\web\\vue.js\\vue3\\hir';

// 文件类型过滤
let filterArg = process.argv[3];
// const filterArg = '\\.js|\\.vue';
if (filterArg==="*") {
    filterArg = '.+';
}
const filter = new RegExp("("+filterArg+")$",'i');

// 文件夹过滤
const excludeArg = process.argv[4];
// const excludeArg = 'node_modules|dist';
let exclude;
if (excludeArg!=='*') {
    exclude = new RegExp(excludeArg,'i');
}

const codeFilePath = process.argv[5];
// const codeFilePath = './code.txt';

try {
    fs.unlinkSync(codeFilePath);
    console.log(`reset ${codeFilePath}`);
} catch (error) {
    
}

let api = new fdir().withFullPaths().filter(
    (path, isDirectory) => {
        // console.log(path);
        // 文件类型过滤, true 则包含
        return filter.test(path);
    }
)
if (exclude) {
    api = api.exclude((dirName="", dirPath) =>{
        // console.log(dirName);
        return exclude.test(dirName);
    }
    );
}

api.crawl(dir).withPromise().then((files) => {
    for (let index = 0; index < files.length; index++) {
        const filePath = files[index];
        console.log(index+1,filePath);
        const data = fs.readFileSync(filePath);
        const content = data.toString();
        let replaceContent = content.replace(/\s*(\/\*.*?\*\/|<!--.*?-->|\/\/.*?$)/gms, '');
        replaceContent = replaceContent.replace(/^\s*\n/gm, '');
        fs.appendFileSync(codeFilePath, replaceContent);   
    }
    console.log('ok!');
});