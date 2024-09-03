const { ipcRenderer } = require("electron");
const { link } = require("original-fs");
const url = require('url');

const ContentDiv = document.getElementById("Contents");

function MoveImageTracks()
{
    
    let Events = document.querySelectorAll(".Event");
    for(var i=0; i<Events.length; i++)
    {
        var Tracks = Events[i].querySelectorAll(".Image_Track");
        const track1 = Tracks[0];
        const track2 = Tracks[1];

        track2.style.left = track1.offsetWidth + 'px';
        
    }
}

MoveImageTracks();

window.addEventListener('resize', () => {
    MoveImageTracks();
});

async function updateStylesheets() {

    try {

        const dirname = await ipcRenderer.invoke("PathRequest");
       //console.log('Directory name:', dirname);

        const links = document.getElementsByTagName("link");
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.rel === "stylesheet") {
                // Update only <link> elements with rel="stylesheet"
                let parts = link.href.split('/');
                let relativePath = '/'+parts[parts.length - 1];

                console.log("Relatyvus stylesheet: ", relativePath);
                // Append a cache-busting query parameter to force reload
                const newHref = dirname + relativePath/* + '?v=' + new Date().getTime()*/;

                // Update the href attribute
                link.href = newHref;
                //console.log('Updated stylesheet link:', link.href);
            }
        }
    } catch (error) {
        console.error('Error while updating stylesheet links:', error);
    }
    console.log("1");
}

async function revertStylesheets(doc){

    const links = doc.getElementsByTagName("link");
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.rel === "stylesheet") {
            // Update only <link> elements with rel="stylesheet"
            let parts = link.href.split('\\');
            let relativePath = parts[parts.length - 1];

            // Append a cache-busting query parameter to force reload
            const newHref = relativePath;

            // Update the href attribute
            link.href = newHref;
            //console.log('Updated stylesheet link:', link.href);
        }
    }

}


async function updateImageSources() {

    try {
        
        const dirname = await ipcRenderer.invoke("PathRequest");
        //console.log('Directory name:', dirname);

        const pictures = document.querySelectorAll('img:not(.Image_Track img)');
        for (let i = 0; i < pictures.length; i++) {
            let parts = pictures[i].src.split('/');
            let relativePath = '/' + parts[parts.length - 2] + '/' + parts[parts.length - 1];
            pictures[i].src = dirname + relativePath;
            //console.log('Updated image source:', pictures[i].src);
        }
    } catch (error) {
        console.error('Error while updating image sources:', error);
    }
    console.log("2");
}

async function revertImageSources(doc) {

    const pictures = doc.querySelectorAll('img:not(.Image_Track img):not(.Cover img)');
        for (let i = 0; i < pictures.length; i++) {
            let parts = pictures[i].src.split('/');
            let relativePath = parts[parts.length - 2] + '/' + parts[parts.length - 1];
            pictures[i].src = relativePath;
            //console.log('Updated image source:', pictures[i].src);
        }

    const CoverDivs = doc.querySelectorAll(".Cover");
    for(let Div of CoverDivs)
    {
        let Photo = Div.querySelector("img");
        let parts = Photo.src.split('/');
        let fileName = parts[parts.length-1];
        Photo.src = "RenginiuCovers/" + fileName;
    }
}


async function updateTrackImageSources() {

    try {
        
        const dirname = await ipcRenderer.invoke("PathRequest");
        //console.log('Directory name:', dirname);
        const imageTracks = document.getElementsByClassName("Image_Track");
        for(let i=0; i<imageTracks.length; i++)
        {
            let pictures = imageTracks[i].getElementsByTagName("img");
            for (let j = 0; j < pictures.length; j++) {
                let parts = pictures[j].src.split('/');
                let relativePath ='/' + parts[parts.length - 3] + '/' + parts[parts.length - 2] + '/' + parts[parts.length - 1];
                //console.log("Relative",relativePath);
                pictures[j].src = dirname + relativePath;
                //console.log('Updated image source:', pictures[j].src);
            }
        }
        

    } 
    catch (error) {
        console.error('Error while updating image sources:', error);
    }
    console.log("3");
}

async function revertTrackImageSources(doc){

    const forbiddenDirPattern = /[<>:"/\\|?*]+/g;
   

    const imageTracks = doc.getElementsByClassName("Image_Track");
        for(let i=0; i<imageTracks.length; i++)
        {
            let parent = imageTracks[i].parentNode;
            console.log("Parent: ", parent);
            //panaikinu uzsilikusius "new" tagus kad ju neirasytu
            parent.id="";
            let HiddenDiv = parent.querySelector(".Hidden");
            console.log("Hidden: ", HiddenDiv);
            let Name = HiddenDiv.querySelector("a").textContent;
            //console.log("Name: ", Name, " Type: ", typeof(Name));
            Name = Name.replace(forbiddenDirPattern," ").trim();

            let pictures = imageTracks[i].getElementsByTagName("img");
            for (let j = 0; j < pictures.length; j++) {
                let parts = pictures[j].src.split('/');
                let relativePath ="Events/" + Name + "/" + parts[parts.length - 1];
                //console.log("Relative",relativePath);
                pictures[j].src = relativePath;
                //console.log('Updated image source:', pictures[j].src);
            }
        }
}


async function updateScriptTag(){
    try {
        
        const dirname = await ipcRenderer.invoke("PathRequest");
        console.log('Directory name:', dirname);
        const scripts = document.querySelectorAll('script:not(#inject)');
        for(let i=0; i<scripts.length; i++)
        {
            let relativePath = scripts[i].src.split("/");
            relativePath = relativePath[relativePath.length-1];
            scripts[i].src = dirname + "\\" + relativePath;
            console.log( "New script source: ",scripts[i].src)
        }
        

    } 
    catch (error) {
        console.error('Error while updating image sources:', error);
    }
    console.log("4");
}

async function revertScriptTags(doc){

    const scripts = doc.querySelectorAll('script:not(#inject)');
        for(let i=0; i<scripts.length; i++)
        {
            let parts = scripts[i].src.split('/');
            let relativePath = parts[parts.length-1];
            scripts[i].src = relativePath;
            //console.log( "New script source: ",scripts[i].src)
        }

    const InjectedScript = doc.querySelectorAll("#inject");
    if(InjectedScript)
    {
        for(let script of InjectedScript)
        {
            doc.remove(script);
        }
    }
    
}

async function updateEventList(){
    let EventsHTML = ContentDiv.getElementsByClassName("Event");
    let Events = Array.from(EventsHTML).map(element=> ({
        innerHTML : element.innerHTML,
        className : element.className,
       
    }))
    console.log("Rasta renginiu: ", Events.length);
    console.log(Events);
    ipcRenderer.send("updateEventList", Events);
    console.log("5");
}


async function RunAll(){
    await updateStylesheets();
    await updateImageSources();
    await updateTrackImageSources();
    await updateScriptTag();
    await updateEventList();
}

RunAll();




ipcRenderer.on("ShowNew", (event,data)=>{
    const NewDiv = document.getElementById("New");
    //console.log(data);
    MoveImageTracks();
    if(NewDiv)
    {
        
        const Texts = NewDiv.getElementsByTagName("p");
        Texts[0].innerHTML = data.Desc.replace(/\n/g,'<br>');
        Texts[1].innerHTML = data.Info.replace(/\n/g,'<br>');

        const HiddenDiv = NewDiv.querySelector(".Hidden");
        const HiddenText = HiddenDiv.querySelector("p");

        const Link = HiddenText.querySelector("a");
        //console.log( "Linkas " ,Link)
        Link.href = data.Link;
        Link.textContent = data.Name;



        const CoverDiv = NewDiv.getElementsByClassName("Cover")[0];
        const CoverImage = CoverDiv.getElementsByTagName("img")[0];

        if(CoverImage)
        {
            CoverImage.src = data.Cover;
        }
        
        const PhotoDivs = document.getElementsByClassName("Image_Track");
        // istrinu pries tai buvuses
        for(i=0; i<2; i++){
            let images = PhotoDivs[i].getElementsByTagName("img");
            while(images.length>0)
            {
                
                images[0].parentNode.removeChild(images[0]);
                
            }
        }

        for(i=0; i<data.Photos.length; i++){
            let currImage = document.createElement("img");
            currImage.className="Track";
            currImage.src = data.Photos[i];

            let ScdTrackImage = document.createElement("img");
            ScdTrackImage.className="Track";
            ScdTrackImage.src = data.Photos[i];

            PhotoDivs[0].append(currImage);
            PhotoDivs[1].append(ScdTrackImage);
            //console.log("Pirmas Divas: ", PhotoDivs[0]);
           // console.log("Antras Divas: ", PhotoDivs[1]);
        }

    }
    else
    {
        //console.log(data.Photos);
        const eventDiv = document.createElement("div");

        //Formuojamas coveris
        const Cover = document.createElement("div");
        Cover.className = "Cover"
        const Image = document.createElement("img");
        Image.src = data.Cover;
        Image.alt = "";
        Cover.append(Image);

        //Formuojamas aprasas
        const Desc =  document.createElement("div");
        Desc.className="Desc";
        let DescText = document.createElement("p");
        DescText.innerHTML=data.Desc.replace(/\n/g,'<br>');
        Desc.append(DescText);
    
        //Adresas, data
        const Info = document.createElement("div");
        Info.className = "Info";
        let InfoText = document.createElement("p");
        InfoText.innerHTML = data.Info.replace(/\n/g,'<br>');
        Info.append(InfoText);

        //Nuotraukos
        const Photos = document.createElement("div");
        Photos.className = "Image_Track";
        const Photos2 = document.createElement("div");
        Photos2.className = "Image_Track";

        for(i=0; i<data.Photos.length; i++){
            let TrackImage = document.createElement("img");
            TrackImage.className="Track";
            TrackImage.src = data.Photos[i];

            let ScdTrackImage = document.createElement("img");
            ScdTrackImage.className="Track";
            ScdTrackImage.src = data.Photos[i];

            Photos.append(TrackImage);
            Photos2.append(ScdTrackImage);
            console.log(Photos);
            console.log(Photos2);
        }

        //Pavadinimas su linku
        const HiddenDiv = document.createElement("div");
        HiddenDiv.className="Hidden";
        const HiddenText = document.createElement("p");
        HiddenText.textContent = "Daugiau: „";
        const Link = document.createElement("a");
        Link.href = data.Link;
        Link.textContent = data.Name;
        Link.target = "_blank";
        
        HiddenText.append(Link);
        HiddenText.append("“");
        HiddenDiv.append(HiddenText);

        eventDiv.className="Event";
        eventDiv.id="New";
        
        
        
        eventDiv.append(Photos);
        eventDiv.append(Photos2); // slenkanciam trackui reikia dvieju
        eventDiv.append(Cover);
        eventDiv.append(Desc);
        eventDiv.append(Info);
        eventDiv.append(HiddenDiv);
        ContentDiv.prepend(document.createElement("hr"));
        ContentDiv.prepend(eventDiv);
        
    }
    

})

ipcRenderer.on("Add_event", ()=>{
    const NewDiv = document.getElementById("New");
    if(NewDiv)
    {
        NewDiv.id="";
    }
    updateEventList();
    
})

ipcRenderer.on("RemoveNew", ()=>{
    
    const NewDiv = document.getElementById("New");
    const Breaks = document.getElementsByTagName("hr");
    if(NewDiv)
    {
        ContentDiv.removeChild(NewDiv);
    }
    ContentDiv.removeChild(Breaks[0]);
    
})

ipcRenderer.on("Remove", (event,data)=>{

    if(ContentDiv.querySelector("#New"))
    {

        let DivToRemove = ContentDiv.querySelectorAll(".Event")[Number(data)+1];
        let BreakToRemove = ContentDiv.querySelectorAll("hr")[Number(data)+1];

        console.log("Trinu: ",DivToRemove);
        ContentDiv.removeChild(DivToRemove);
        ContentDiv.removeChild(BreakToRemove);
    }
    else
    {
        let DivToRemove = ContentDiv.querySelectorAll(".Event")[Number(data)];
        let BreakToRemove = ContentDiv.querySelectorAll("hr")[Number(data)];
    
        console.log("Trinu: ",DivToRemove);
        ContentDiv.removeChild(DivToRemove);
        ContentDiv.removeChild(BreakToRemove);
    }

})

ipcRenderer.on("Modify", (event,data)=>{

    //Istrinu pries tai modifikuota, kad nebutu rasoma i 2 vienu metu
    const NewDiv = document.getElementById("New");
    const Breaks = document.getElementsByTagName("hr");
    if(NewDiv)
    {
        NewDiv.id="";
    }
    

    RequestedDiv = ContentDiv.querySelectorAll(".Event")[data];
    RequestedDiv.id = "New";


})



ipcRenderer.on("WriteRen", async ()=>{
    let cloneDoc = document.createElement("html");

    cloneDoc.innerHTML = document.documentElement.innerHTML;
    await revertStylesheets(cloneDoc);
    await revertImageSources(cloneDoc);
    await revertTrackImageSources(cloneDoc);
    await revertScriptTags(cloneDoc);

    const mainDir = await ipcRenderer.invoke("PathRequest");
    
    
    let UnfixedCoverDivs = document.querySelectorAll(".Cover");
    let FixedCoverDivs = cloneDoc.querySelectorAll(".Cover");

    for(i=0; i<FixedCoverDivs.length; i++)
    {
        let FixedPhotoSrc = FixedCoverDivs[i].querySelector("img");
        FixedPhotoSrc = decodeURIComponent(FixedPhotoSrc.getAttribute('src'));
        FixedPhotoSrc = FixedPhotoSrc.split("/");
        FixedPhotoSrc = FixedPhotoSrc.join("\\");
        
        let UnfixedPhotoSrc = url.fileURLToPath(UnfixedCoverDivs[i].querySelector("img").src);

        //console.log("Pataisytos nuotraukos path: ", FixedPhotoSrc);
       // console.log("Nepataisytos nuotraukos path: ", UnfixedPhotoSrc);
        

        let CoverPath = mainDir+"\\"+FixedPhotoSrc;
        //console.log("Bandymas klijuo kelia: ", CoverPath);
        //Iesko failo
        let FileStatus =await ipcRenderer.invoke("FindFile", CoverPath)
        //console.log("Ieskomas coveris pathu: ", mainDir+"\\" + FixedPhotoSrc)

        //Jei neranda failo, nukopijuoja
        if(FileStatus===false)
        {
            //console.log("Kopijuoja coveri pathu: ", UnfixedPhotoSrc);
            //console.log("Kopijuoja i: ", mainDir+"\\"+"RenginiuCovers");
            await ipcRenderer.invoke("CopyFile",UnfixedPhotoSrc, CoverPath);
        }
    }

    const forbiddenDirPattern = /[<>:"/\\|?*]+/;

    const FixedEvents = cloneDoc.querySelectorAll(".Event");
    const UnfixedEvents = document.querySelectorAll(".Event");


    for(i = 0; i<FixedEvents.length; i++)
    {
        let HiddenDiv = document.querySelector(".Hidden");
        let Name = HiddenDiv.querySelector("a").textContent;
        Name = Name.replace(forbiddenDirPattern, " ").trim();

        //ieskom evento nuotrauku folderio
        if(await ipcRenderer.invoke("FindFile", (mainDir+"\\Events\\"+Name))===false)
        {
            ipcRenderer.invoke("CreateDir", mainDir+"\\Events\\"+Name);
        }

        let FixedImageTrack = FixedEvents[i].querySelector(".Image_Track");
        let FixedPhotos = FixedImageTrack.querySelectorAll("img");

        let UnfixedImageTrack = UnfixedEvents[i].querySelector(".Image_Track");
        let UnfixedPhotos = UnfixedImageTrack.querySelectorAll("img");

        for(j=0; j<FixedPhotos.length; j++)
        {
            let relativePath = decodeURIComponent(FixedPhotos[j].getAttribute('src'));
            //console.log("Relatyvus trackas: ", relativePath)
            relativePath = relativePath.split('/');
            relativePath = relativePath.join("\\");
            //console.log("Relatyvus trackas kaip path: ", relativePath)
            relativePath = mainDir + "\\" + relativePath;
            //console.log("Sukonstruotas tikrinimui: ", relativePath);
            //console.log("Tikrini tracko kelia: ", mainDir + "\\" +FixedPhotos[j].getAttribute('src').replace("/","\\"));

            if(await ipcRenderer.invoke("FindFile", relativePath)===false)
            {
                //console.log("Bando irasyti tracka i: ", url.fileURLToPath(UnfixedPhotos[j].src));
                ipcRenderer.invoke("CopyFile", url.fileURLToPath(UnfixedPhotos[j].src), relativePath);
            }
        }
    }

    let formattedHTML = prettyPrintHTML(cloneDoc.outerHTML);
    formattedHTML = formattedHTML.substring(1,formattedHTML.length-1);
    formattedHTML = `<!DOCTYPE html>\n${formattedHTML}`;

    await ipcRenderer.invoke("WriteDataRen", formattedHTML);
    
})

function prettyPrintHTML(html) {
    let formatted = '';
    let indent = 0;
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    html.split(/>\s*</).forEach(function(element) {
        if (element.match(/^\/\w/)) {
            // Closing tag found
            indent--;
        }

        const isVoidElement = voidElements.some(tag => element.startsWith(tag) || element.startsWith('/' + tag));
        
        formatted += '  '.repeat(indent) + '<' + element.trim() + '>\n';
        
        if (element.match(/^<?\w[^>]*[^/]$/) && !isVoidElement && !element.match(/^\/\w/)) {
            
            indent++;
        }
    });

    return formatted.trim();
}
///Script tagas #inject nepasinaikina kazkodel