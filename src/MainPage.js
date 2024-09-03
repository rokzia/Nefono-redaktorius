//import { app, BrowserWindow } from 'electron';
const { ipcRenderer } = require('electron')






const button1 = document.getElementById("Button1");
const button2 = document.getElementById("Button2");

button1.addEventListener('click', () => {
    //createBrowserWindow();
    //console.log('First');
    ipcRenderer.send("Apie mus");

})

button2.addEventListener('click', () => {
    //createBrowserWindow();
    //console.log('First');
    ipcRenderer.send("Renginiai");

})