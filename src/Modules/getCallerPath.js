const currentPath = process.cwd();

function getFileName(line) {
    let path;

    path = line.split(" ")[1];
    if (!path) return null;

    path = path.split("(")[1];
    if (!path) return null;

    path = path.split(")")[0];
    if (!path) return null;

    let data = path.split("\\");
    if (!data) return null;

    let ending = data.splice(-1)[0].split(":")[0];
    let fileName = ending.split(".")[0];
    if (!ending) return null;

    data.push(ending);
    path = data.join("\\");

    return {
        path,
        fileName
    };
};

function getCall(currentFileName) {
    let err = new Error();
    Error.captureStackTrace(err, getCall);
    
    const stack = err.stack.split(" at ").slice(1).map((line) => line.replace("\n", "").trim());
    let pointOfEntry = null;
    let forceBreak = false;
    
    for (let i = 0; i < stack.length; i++) {
        const line = stack[i];
        const { fileName, path } = getFileName(line);
        
        if (fileName == currentFileName) {
            forceBreak = true;
            continue;
        }

        if (forceBreak) {
            pointOfEntry = path;
            break;
        };
    }

    return (pointOfEntry == "node") ? null : pointOfEntry;
};

module.exports = getCall;