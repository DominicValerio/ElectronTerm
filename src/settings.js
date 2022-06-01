const fs = require('fs')
const form = document.getElementById('settings')
const settingsList = document.getElementById('settings-list')

// TODO: handle this missing file
const userDataPath = './res/user-data.json'
let userData = JSON.parse(fs.readFileSync(userDataPath))

function addUiElement(name, value, depth) {
  if (typeof value == "object") {
    depth.push(name)
    
    for (let [_name, _value] of Object.entries(value)) {
      _name = name + '.' + _name   // temp fix

      addUiElement(_name, _value, depth)
    }
    return
  }

  const div = document.createElement('div')
  div.id = name
  div.className = "list-item"

  const label = document.createElement('label')
  label.innerText = name

  const input = document.createElement('input')

  switch (typeof value) {
  case "boolean":
    input.defaultValue = value
    input.setAttribute('type', 'checkbox')
  case "string":
    input.defaultValue = value
    input.setAttribute('type', 'text')
  }

  div.appendChild(label)
  div.appendChild(input)
  

  settingsList.appendChild(div)
}


for (const [name, value] of Object.entries(userData.settings)) {
  addUiElement(name, value, [])  
}

form.addEventListener('submit', (e) => {
  e.preventDefault()

  
  userData = JSON.parse(fs.readFileSync(userDataPath))
  let settings = userData.settings

  for (let [_, child] of Object.entries(settingsList.children)) {
    if (child.className == "list-item") {
      let input = child.querySelector("input")
      let label = child.querySelector('label')
      let name = label.innerText

      let v = input.value
      console.log(v)
      if (settings[name] !== undefined)   settings[name]  = v
    }
  }

  userData["settings"] = settings

  fs.writeFileSync(userDataPath, JSON.stringify(userData, null, '\t'))
})