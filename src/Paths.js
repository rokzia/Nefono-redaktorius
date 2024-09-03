//const { dialog } = require('electron').remote;
const { ipcRenderer } = require("electron");
const fs = require("fs");

const Apie_mus = document.getElementById("Apie_mus");
const Renginiai = document.getElementById("Renginiai");
const Confirmation = document.getElementById("Confirmation");

const TextBox1 = document.getElementById("TextBox1");
const TextBox2 = document.getElementById("TextBox2");



Apie_mus.addEventListener("click", async () => {
    let filePath = await ipcRenderer.invoke("openExplorer_first");
    console.log(filePath);
    if(filePath!==undefined)
    {
        TextBox1.value = filePath;
    }
    else
    {
        TextBox1.value = "No file is selected";
    }
    
});

Renginiai.addEventListener("click", async () => {
    let filePath = await ipcRenderer.invoke("openExplorer_second");
    console.log(filePath);
    if(filePath!==undefined)
    {
        TextBox2.value = filePath;
    }

    else
    {
        TextBox2.value = "No file is selected";
    }
    
});

Confirmation.addEventListener("click", ()=>{
    ipcRenderer.send("Confirmation");
})