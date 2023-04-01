function formatResponseText(text) {
    text = String(text);

    if (text.includes("InvalidImage")) {
        return "Image is either corrupted, not supported, or got moderated.";
    }

    return text;
}

module.exports = function(...args) {
    let res = args[0];
    let code = args[1];

    if (typeof(res) === "string") {
        return { success: false, errorMessage: args[0], code: (code || null) };
    } else {
        if (!res["statusText"]) {
            return { success: false, errorMessage: "Unknown", code: (code || null) };
        }
        return { success: false, errorMessage: `${res.statusText} | ${formatResponseText(res.data.message)}`, code: res.status }
    }
}