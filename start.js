const { exec, fork } = require("child_process");
console.log("Building TypeScript...");
exec("npx tsc", (err, out, std) => console.log(err ? std : out));

/*
console.log("Starting bot...");
const child = fork("./dist/index.js");
child.on("message", m => console.log(m.toString()));
child.on("error", err => console.error(err.toString()));
child.on("exit", m => (console.log(`Exited with ${m}`), process.exit(1)));
child.on("disconnect", () => (console.log("Process exited."), process.exit(0)));*/