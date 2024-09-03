// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const {dialog} = require("electron")
const { File } = require('node:buffer')
const { readFile, copyFile } = require('node:fs')
const path = require('node:path')
var FileSystem = require('fs');
const { rejects } = require('node:assert')
const { electron } = require('node:process')
const electronDialog = require("electron").dialog


const createWindow = (file, x , y ) => {
  // Create the browser window.
  const Window = new BrowserWindow({
    width: x,
    height: y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      
    }




    
  })

  // and load the index.html of the app.
  Window.loadFile(file)

  // Open the DevTools.
  //Window.webContents.openDevTools()

  return Window;





}

function CloneHTML(path, result, script) {


  return new Promise((resolve, reject) => {
    FileSystem.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        console.log(err.message);
        return reject(err);
      }
      
      const dataSplit = data.split('\n');

      //Istrinti pries tai irasyta faila
      FileSystem.writeFile(result,'',(err)=>{
        if(err)
        {
          console.error('Klaida naikinant', err);
        }
      });

      let writer = FileSystem.createWriteStream(result, { flags: 'a' });
      for(i=0; i<dataSplit.length; i++)
      {
        if(dataSplit[i].trim()==='</head>')
        {
          
          dataSplit[i] = '\n'+"<script id='inject' src="+script+" defer></script>"+'\n'+'</head>'+'\n';

          //i++;
        }
        
      }
      for(i=0; i<dataSplit.length; i++)
      {
        writer.write(dataSplit[i], (err) =>{
          if(err){
            console.log("Klaida: ",err.message);
            return reject(err);
          }

        });
      }
      resolve();

  });
})

}

function LineAmount(string){

  console.log("Eiluciu kiekis: ",string.split('\n').length);
  return string.split('\n').length;
}

let Paths = ["", ""];
let Editor;
let PreviewWindow;

ipcMain.handle("ProvidePath", async () =>{


    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths;
    }
    return "";
  })

  ipcMain.handle("ProvideMultiplePaths", async () =>{


    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths;
    }
    return "";
  })



function pathRequest(){
  if(!FileSystem.existsSync('./paths.txt'))
  {
    FileSystem.writeFile('./paths.txt', (err)=>{
      if(err)
      {
        console.log("Klaida kuriant keliu faila: ", err.message);
      }
    });
  }
  FileSystem.readFile('./paths.txt', 'utf-8', (err, data) => {
    if(err)
    {
      console.log("klaida: ", err.message);
      return;
    }

    if(LineAmount(data)!==2)
      {
        //console.log("eiluciu: " , LineAmount(data));
        const pathRequest = createWindow('pathRequest.html',600,800);
  
  
        ipcMain.handle("openExplorer_first", async () => {
          try {
            const result = await dialog.showOpenDialog({
              properties: ['openFile']
            });
      
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              Paths[0] = filePath;
      
              
              await new Promise((resolve, reject) => {
                FileSystem.writeFile('./paths.txt', Paths[0] + '\n' + Paths[1], (err) => {
                  if (err) {
                    console.log("Failed to write file:", err);
                    reject(err);
                  } else {
                    console.log("File written successfully:", filePath);
                    resolve();
                  }
                });
              });
      
              return filePath; 
            }
      
            return ""; 
          } catch (error) {
            console.error('Error in PathRequest Process:', error);
            return ""; 
          }
        });
  
  
        ipcMain.handle("openExplorer_second", async () => {
          try {
            const result = await dialog.showOpenDialog({
              properties: ['openFile']
            });
      
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              Paths[1] = filePath;
      
              
              await new Promise((resolve, reject) => {
                FileSystem.writeFile('./paths.txt', Paths[0] + '\n' + Paths[1], (err) => {
                  if (err) {
                    console.log("Failed to write file:", err);
                    reject(err);
                  } else {
                    console.log("File written successfully:", filePath);
                    resolve();
                  }
                });
              });
      
              return filePath; 
            }
      
            return ""; 
          } catch (error) {
            console.error('Error in Main Process:', error);
            return ""; 
          }
        });
  
  
        
        ipcMain.on("Confirmation", ()=>{
          pathRequest.close();
        })
  
  
      }
      else{
          const dataSplit = data.split('\n');
          console.log("Split :",dataSplit[0]);
          Paths[0] = dataSplit[0];
          Paths[1] = dataSplit[1];
      }

  })

  

}



let mainWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  pathRequest();
  mainWindow = createWindow('index.html',600,800)

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow('index.html', 600, 800)
  })
  
  

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.






ipcMain.on("Apie mus", async (event,data)=>{
  
  await CloneHTML(Paths[0],"./AMClone.html","AMClone_picfix.js");
  ipcMain.handle("PathRequest", async () =>{
    const parts = Paths[0].split('\\');
    parts.pop();
    return parts.join('\\');

  })

  PreviewWindow = createWindow("./AMClone.html",1800,1200);
  Editor = createWindow("./A_MEditor.html", 1200,1200);
  mainWindow.close();

  
})
ipcMain.on("UpdateAMValue", (event,data)=>{
  //console.log(data);
  PreviewWindow.webContents.send("UpdateAMValue", data);
})

function RegexChange(path,pattern,replacement){

  FileSystem.readFile(path, (err,data)=>{
    if(err)
    {
      console.log(err.message);
      return;
    }
    data = data.toString();
    const match = data.match(pattern);
    console.log(replacement);
    console.log("Radinys: ",match);
    if(match)
    {/*
      let Lines = match[0].split('\n');
      Lines[1] = replacement;
      const Modification = Lines.join('\n');*/
      const NewData = data.replace(pattern,replacement);
      FileSystem.writeFile(path,NewData, (err) =>{
        if(err)
        {
          console.log("Write did not succeed in RegexChange: ",err.message)
          return;
        }
      })
    }
    else
    {
      console.log("Nepavyko rasti keičiamo elemento");
      return;
    }

  })

}

ipcMain.handle("ValueReceive", async (event,data)=>{

  PreviewWindow.webContents.send("GetValue");

  return new Promise((resolve)=>{
    ipcMain.once("SetTextValue", (event,string)=>{
      console.log("Atsakymas: ", string)
      resolve(string);
    })
  })

})




ipcMain.on("SaveAM", (event,data)=>{
  const pattern = /<p id="Desc">\s*([\s\S]*?)\s*<\/p>/
  let window;
  electronDialog.showMessageBox(window, {
    'type' : 'question',
    'title' : 'Ar įvykdyti pakeitimus?',
    'message' : 'Ar įvykdyti pakeitimus?',
    'buttons' : [
      'Taip',
      'Ne'
    ]
  }).then((result)=>{
    if(result.response !== 0)
    {
      return;
    }
    if(result.response===0)
    {

      let backupFolder = __dirname.split('\\');
      backupFolder.pop();
      backupFolder = backupFolder.join('\\');
      backupFolder = backupFolder+"\\Backups\\Apie_mus";


      let index = 0;

      const currDate = new Date();
      const Year = currDate.getFullYear();
      const Month = currDate.getMonth()+1;
      const Day = currDate.getDate();

      while(FileSystem.existsSync(backupFolder+"\\"+Year+"_"+Month+"_"+Day+' ('+index+')'))
      {
        console.log("Vyksta ieskojimas")
        index++;
      }
      FileSystem.mkdirSync(backupFolder+"\\"+Year+"_"+Month+"_"+Day+' ('+index+')', {recursive: true});
      const Directory = backupFolder+"\\"+Year+"_"+Month+"_"+Day+' ('+index+')';
      console.log("Direktorija: ", Directory);

      FileSystem.copyFile(Paths[0], Directory+"\\"+path.basename(Paths[0]), (err)=>{
        if(err)
        {
          console.log(err.message);
          console.log("Nepavyko is: ", Paths[0], " i: ", Directory+"\\"+path.basename(Paths[0]));
        }
      });

      //console.log("Paspaude taip");
      RegexChange(Paths[0], pattern, '<p id="Desc">' + data + '</p>');
      //CloneHTML('./AMClone.html', Paths[0], "");
    }
    
  })
})

ipcMain.on("Renginiai", async ()=>{
  await CloneHTML(Paths[1],'./RenClone.html','Ren_fix.js');
  ipcMain.handle("PathRequest", async () =>{
    const parts = Paths[1].split('\\');
    parts.pop();
    return parts.join('\\');

  })
  PreviewWindow = createWindow("./RenClone.html",1800,1200);
  Editor = createWindow("./RenEditor.html", 1200,1200);
  mainWindow.close();

})

ipcMain.on("ShowNew", (event,data) =>{
  

  PreviewWindow.webContents.send("ShowNew",data);

})

ipcMain.on("RemoveNew", () =>{

  PreviewWindow.webContents.send("RemoveNew");

})

ipcMain.on("Add_event", ()=>{
  PreviewWindow.webContents.send("Add_event");

})

ipcMain.on("updateEventList", (event,data)=>{

  Editor.webContents.send("updateEventList", data);
})

ipcMain.on("Remove", (event,data)=>{
  PreviewWindow.webContents.send("Remove", data);
})

ipcMain.on("Modify", (event,data)=>{
  PreviewWindow.webContents.send("Modify",data);
})


ipcMain.on("SaveRen", async ()=>{
  let window;
  electronDialog.showMessageBox(window, {
    'type' : 'question',
    'title' : 'Ar įvykdyti pakeitimus?',
    'message' : 'Ar įvykdyti pakeitimus?',
    'buttons' : [
      'Taip',
      'Ne'
    ]
  }).then( async (result)=>{
    if(result.response !== 0)
    {
      return;
    }
    if(result.response===0)
    {
      let backupFolder = __dirname.split('\\');
      backupFolder.pop();
      backupFolder = backupFolder.join('\\');
      backupFolder = backupFolder+"\\Backups\\Renginiai";


      let index = 0;

      const currDate = new Date();
      const Year = currDate.getFullYear();
      const Month = currDate.getMonth()+1;
      const Day = currDate.getDate();

      while(FileSystem.existsSync(backupFolder+"\\"+Year+"_"+Month+"_"+Day+' ('+index+')'))
      {
        console.log("Vyksta ieskojimas")
        index++;
      }
      FileSystem.mkdirSync(backupFolder+"\\"+Year+"_"+Month+"_"+Day+' ('+index+')', {recursive: true});
      const Directory = backupFolder+"\\"+Year+"_"+Month+"_"+Day+' ('+index+')';
      console.log("Direktorija: ", Directory);

      let EventCovers = Paths[1].split("\\");
      EventCovers.pop();
      const AllPhotos = EventCovers.join("\\") + "\\Events";
      EventCovers = EventCovers.join("\\")+"\\RenginiuCovers";

      FileSystem.copyFile(Paths[1], Directory+"\\"+path.basename(Paths[1]), (err)=>{
        if(err)
        {
          console.log(err.message);
          console.log("Nepavyko is: ", Paths[1], " i: ", Directory+"\\"+path.basename(Paths[1]));
        }
      });
      FileSystem.cp(AllPhotos, Directory+"\\"+path.basename(AllPhotos), {recursive: true} , (err)=>{
        if(err)
        {
          console.log(err.message);
          console.log("Nepavyko is: ", AllPhotos, " i: ", Directory+"\\"+path.basename(AllPhotos));
        }
      });
      FileSystem.cp(EventCovers, Directory+"\\"+path.basename(EventCovers), {recursive: true}, (err)=>{
        if(err)
        {
          console.log(err.message);
          console.log("Nepavyko is: ", Paths[1], " i: ", Directory+"\\"+path.basename(EventCovers));
        }
      });


      PreviewWindow.webContents.send("WriteRen");
      
    }
    
  })
  

})


ipcMain.handle("FindFile", async (event,path)=>{
    if(FileSystem.existsSync(path))
    {
      return true;
    }
    else
    {
      console.log("Nerado: ", path)
      return false;
    }
})

ipcMain.handle("WriteDataRen", (event,modifiedOuterHTML)=>{
    FileSystem.writeFile(Paths[1],modifiedOuterHTML, (err)=>{
      if(err)
      {
        console.log("Klaida irasinejant renginiu pokycius: ",err.message);
        return false;
      }
      return true;
    })
})

ipcMain.handle("CopyFile", async (event, path, dest)=>{

    FileSystem.copyFile(path, dest, (err)=>
    {
      if(err)
      {
        //console.log("Kelias: ", path);
        //console.log("Destinacija: ", dest);
        //console.log("Klaida kopijuojant faila: ", err.message);
      }
      else
      {
        //console.log("Pavyko is: ", path, " nukopijuoti i ", dest);
        return true;
      }

    });


})

ipcMain.handle("CreateDir", (event,path)=>{
  try{
    FileSystem.mkdirSync(path, {recursive : true});
    return true;
  }
  catch(err)
  {
    console.log("Klaida kuriant direktorija: ",err.message)
    return false;
  }
    
})

ipcMain.on("GoBack", ()=>{
  let window;
  electronDialog.showMessageBox(window, {
    'type' : 'question',
    'title' : 'Ar grįžti į pradinį puslapį?',
    'message' : 'Ar grįžti į pradinį puslapį? Neįrašyti pakeitimai nebus išsaugoti',
    'buttons' : [
      'Taip',
      'Ne'
    ]
  }).then((result)=>{
    if(result.response !== 0)
    {
      return;
    }
    if(result.response===0)
    {
      mainWindow = createWindow('index.html',600,800);
      PreviewWindow.close();
      Editor.close();
      ipcMain.removeHandler("PathRequest");
      
    }
    
  })
})

//Redaguojant i textboxus ateina values be endlinu