
const { ipcRenderer } = require("electron");

const startValue = document.getElementById("Desc").innerHTML;
//console.log("Siunciam: ",startValue);

ipcRenderer.on("GetValue", ()=>{
    let result = document.querySelector("#Desc").innerHTML;
    console.log(result);
    result = result.replace(/<br>/g, "\n");
    ipcRenderer.send("SetTextValue", result);
})


async function updateStylesheets() {
    try {
        // Wait for the promise to resolve and get the directory name
        const dirname = await ipcRenderer.invoke("PathRequest");
        console.log('Directory name:', dirname);

        const links = document.getElementsByTagName("link");
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.rel === "stylesheet") {
                // Update only <link> elements with rel="stylesheet"
                let parts = link.href.split('/');
                let relativePath = '/'+parts[parts.length - 1];

                // Append a cache-busting query parameter to force reload
                const newHref = dirname + relativePath + '?v=' + new Date().getTime();

                // Update the href attribute
                link.href = newHref;
                console.log('Updated stylesheet link:', link.href);
            }
        }
    } catch (error) {
        console.error('Error while updating stylesheet links:', error);
    }
}


async function updateImageSources() {
    try {
        
        const dirname = await ipcRenderer.invoke("PathRequest");
        console.log('Directory name:', dirname);

        const pictures = document.getElementsByTagName("img");
        for (let i = 0; i < pictures.length; i++) {
            let parts = pictures[i].src.split('/');
            let relativePath = '/' + parts[parts.length - 2] + '/' + parts[parts.length - 1];
            pictures[i].src = dirname + relativePath;
            console.log('Updated image source:', pictures[i].src);
        }
    } catch (error) {
        console.error('Error while updating image sources:', error);
    }
}

updateStylesheets();
updateImageSources();
/*
for( i=0; i<pictures.length; i++)
    {
    
        console.log(pictures[i].src);

    }*/

const Desc = document.getElementById("Desc");


ipcRenderer.on("UpdateAMValue", (event,value)=>{
    console.log("Update");
    Desc.innerHTML=value.replace(/\n/g,'<br>');
});