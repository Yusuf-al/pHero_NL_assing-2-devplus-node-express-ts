import fs from "fs";
const logger = (req, res, next) => {
    const success = res.statusCode < 400;
    const startTime = Date.now();
    const log = `----------------------------------------  
[${new Date().toLocaleString()}]
Status    : ${success ? "SUCCESS" : "FAILED"}
Method    : ${req.method}
Route     : ${req.originalUrl}
Code      : ${res.statusCode}
Duration  : ${Date.now() - startTime}ms
IP        : ${req.ip}
Success   : ${success}
Agent     : ${req.headers["user-agent"]}
----------------------------------------
`;
    fs.appendFile("logger.txt", log, (err) => {
        console.log(err);
    });
    next();
};
export default logger;
