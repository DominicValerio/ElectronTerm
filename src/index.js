const electron = require('electron')
const {ipcRenderer} = electron
const {Terminal} = require('xterm')
const { FitAddon } =  require('xterm-addon-fit');

const term = new Terminal()
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();

term.onData((e) => {
  ipcRenderer.send('usecommand', e)
})

ipcRenderer.on('program', (e, program) => {
  term.write(program)
})