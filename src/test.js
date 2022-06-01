const child_process = require('child_process')
const { resolve } = require('path')
const stream = require('stream')


function extensionLoc(haystack, extensionText) {
  let reg = new RegExp('\\w*\\.' + extensionText)

  return haystack.search(reg)
}

const cmd = child_process.spawn('python test.py', [], {
  shell: 'cmd.exe', // true false or shell path
  stdio: [],
  encoding: 'utf-8',
  windowsHide: false, // on windows a new console window would open
  cwd: process.env.HOME, //working directory of subprocess
});


cmd.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

cmd.stdin.on('data', (data) => {
  process.stdout.write(data.toString());
});

cmd.stderr.on('data', (data) => {
  process.stdout.write(data.toString());
});

// child process close all stdio and exitted
cmd.on('close', (code) => {
  process.stdout.write(`Child exited with code ${code}\n`);
});








// async function blockuntilclose(command) {
//   await cmd.on('exit', () => {
//     return new Promise()
//   })
// }

// console.log('waiting')
// blockuntilclose()
// console.log('done')


