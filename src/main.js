const url = require('url')
const path = require('path')
const fs = require('fs')

const node_pty = require('node-pty')
const commandExists = require('command-exists');

const {app, BrowserWindow, Menu, ipcMain} = require('electron')

const width = 1000
const height = 700

let mainWindow 
let shell
let userData
let mainMenuTemplate

function initMainWindow() {
  mainWindow = new BrowserWindow(
  {
    width: width, 
    height: height, 
    show: false,
    resizable: true,
    icon: "./res/icon.ico",
    webPreferences: 
    {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

  Menu.setApplicationMenu(mainMenu)

  const temp = fs.readFileSync('./res/user-data.json')
  userData = JSON.parse(temp)
  
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // let defaultPath = process.env.HOME
  // let defaultShell = process.platform === 'darwin' ? "user/bin/sh": "cmd.exe"

  commandExists(userData.settings.defaultShellPath).then( (fulfilled) => {
    shell = node_pty.spawn(userData.settings.defaultShellPath, [], {
      shell: false, // true false or shell path
      stdio: [],
      windowsHide: true, // on windows a new console window would open
      cwd: userData.settings.defaultWorkingDirPath, //working directory of subprocess
    }); 

    shell.onData((data) => {
      mainWindow.webContents.send('program', data)
    })
    
  }, (rejected) => {
    mainWindow.webContents.send('program', {stderr: rejected})
    return
  })

  mainWindow.on('close', app.quit)
}

// App ready
app.on('ready', initMainWindow)

app.on("activate", () => {
  if (mainWindow === null) {
    initMainWindow();
  }
});

function extensionLoc(haystack, extensionText) {
  let reg = new RegExp('\\w*\\.' + extensionText)
  return haystack.search(reg) 
}

let cmd = ""
ipcMain.on('usecommand', (e, value) => {
  cmd += value
  //transform the command
  for (const [fileExt, executor] of Object.entries(userData.settings.shortcutMap)) {
    switch (value) {
    case '\r':
    case '\n':
      if (extensionLoc(cmd, fileExt) === 0) {
        shell.write(`\x1B${cmd.length}\x08`)

        value = `${executor} ${cmd}`
        cmd = ""
      }
    }
  }
  //console.log(cmd)

  if (value == '\r') cmd = ""

  // const cmdname = value.split(' ')[0]

  // //if it's a filename, return
  // try {
  //   if(fs.statSync(value).isFile()) {
  //     return
  //   }
  // } catch (error) {}
  
  if (shell) shell.write(value)
})

/* 
  Main Menu Template/ Top Tool Bar
*/

function onOptionsOpen() {
  optionsWindow = new BrowserWindow(
    {
      width: width/1.5, 
      height: height/1.2, 
      icon: "./res/icon.ico",
      show: false,
      parent: mainWindow,
      webPreferences: 
      {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })

  optionsWindow.loadFile(path.join(__dirname, 'settings.html'))

  //TODO: remove menu bar

  optionsWindow.once('ready-to-show', optionsWindow.show)
}

mainMenuTemplate = [
  {
    label:'Menu',
    submenu:[
      {
        label:'Options',
        click() {
          onOptionsOpen()
        }
      },
      {
        label:'Quit',
        // if mac then the shortcut is this, else that
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit()
        }
      }
    ]
  }
]


// DevTools 
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      },
    ]
  })
}



if (process.platform == 'darwin') {
  mainMenuTemplate.unshift()
}