const { ipcRenderer } = require("electron");


const NameInput = document.getElementById("Name");
const CoverInput = document.getElementById("Cover");
const DescInput = document.getElementById("Desc");
const InfoInput = document.getElementById("Info");
const PhotoInput = document.getElementById("Photos");
const AddButton = document.getElementById("Add");
const EventList = document.getElementById("Existing");
const LinkInput = document.getElementById("Link");
const SaveButton = document.getElementById("Save");
const CancelButton = document.getElementById("Cancel");

const CoverTextBox = document.getElementById("CoverPath");
const PhotosTextBox = document.getElementById("PhotoPath");

let EventArray = [];


let newEvent = {
    Name: '',
    Cover : '',
    Desc : '',
    Info : '',
    Photos: '',
    Link: '',
};

const proxy = new Proxy(newEvent, {
    set(target,property,value){

        target[property] = value;
        
        ipcRenderer.send("ShowNew", newEvent);
        
        const Empty = Object.values(target).every(val => val==="" || val===undefined);
        if(Empty){
            ipcRenderer.send("RemoveNew");
        }

        return true;
    }
})

NameInput.addEventListener("input", ()=>{
    proxy.Name = NameInput.value;
    

})

LinkInput.addEventListener("input", ()=>{
    proxy.Link = LinkInput.value;
    

})

DescInput.addEventListener("input", ()=>{
    proxy.Desc = DescInput.value;
    

})

InfoInput.addEventListener("input", ()=>{
    proxy.Info = InfoInput.value
})

CoverInput.addEventListener("click", async ()=>{

    proxy.Cover = await ipcRenderer.invoke("ProvidePath"); 
    CoverTextBox.value = proxy.Cover;

})

PhotoInput.addEventListener("click", async ()=>{

    proxy.Photos = await ipcRenderer.invoke("ProvideMultiplePaths");

    PhotosTextBox.value = proxy.Photos.join("\n");
})

AddButton.addEventListener("click", ()=>{
    ipcRenderer.send("Add_event");
    AddButton.textContent = "Pridėti";
    newEvent.Cover="";
    newEvent.Name="";
    newEvent.Desc="";
    newEvent.Info="";
    newEvent.Photos="";
    newEvent.Link="";
    DescInput.value="";
    InfoInput.value="";
    NameInput.value="";
    LinkInput.value="";
    PhotosTextBox.value ="";
    CoverTextBox.value = "";
})

ipcRenderer.on("updateEventList", (event,elements)=>{
    console.log(elements);
    const PreExisting = EventList.querySelectorAll("div");
    const Breaks = EventList.querySelectorAll("hr");
    if(Breaks)
        {
            Breaks.forEach(p=> {
                p.remove()
            }
            );
        }

    if(PreExisting)
    {
        PreExisting.forEach(p=> {
            p.remove()
        }
        );
    }

    let index = 0;
    elements.forEach(data=>{

        let EventDiv = document.createElement("div");
        EventDiv.style = "width : 100%;";

        let element = document.createElement("div");
        element.className=data.className;
        element.innerHTML = data.innerHTML;
        EventArray[index] = element;

        let hiddenDiv = element.querySelector(".Hidden");
        let hiddenLink = hiddenDiv.querySelector("a");

        let EventName = document.createElement("p");
        EventName.textContent = hiddenLink.textContent;

        let ModifyButton = document.createElement("button");
        ModifyButton.textContent = "Modifikuoti";
        ModifyButton.className = "EditorM";
        ModifyButton.id=index;

        let RemoveButton = document.createElement("button");
        RemoveButton.textContent = "Ištrinti";
        RemoveButton.className = "EditorR";
        RemoveButton.id=index;
        

        EventDiv.append(EventName);
        EventDiv.append(ModifyButton);
        EventDiv.append(RemoveButton);

        EventList.append(EventDiv);
        EventList.append(document.createElement("hr"));
        index++;
    })
    AddListeners();
})

function Remove(index){

    for(let child of EventList.children){
        console.log(child);
    }
    let DivToRemove = EventList.querySelectorAll("div")[index];
    let BreakToRemove = EventList.querySelectorAll("hr")[index];
    
    
    EventList.removeChild(DivToRemove);
    EventList.removeChild(BreakToRemove);
    
    newIndex  = 0;
    for(let div of EventList.querySelectorAll("div"))
    {
        for(let button of div.querySelectorAll("button"))
        {
            button.id = newIndex;
        }
        newIndex++;
    }
}


function SetValues(index){

    AddButton.textContent = "Patvirtinti pakeitimus"
    /*AddButton.removeEventListener("click");
    AddButton.addEventListener("click", ()=>{
        ipcRenderer.send("Add_event");
        AddButton.textContent="Irašyti pakeitimus";
        AddButton.removeEventListener("click");
        AddButton.add
    })*/

    let selected = EventArray[index];

    let CoverDiv = selected.querySelector(".Cover");
    let CoverPhoto = CoverDiv.querySelector("img");
    

    let DescDiv = selected.querySelector(".Desc");
    console.log(DescDiv.querySelector("p").innerHTML);
    DescInput.value = DescDiv.querySelector("p").textContent;

    let InfoDiv = selected.querySelector(".Info");
    console.log(InfoDiv.querySelector("p").innerHTML);
    let InfoValue = InfoDiv.querySelector("p").innerHTML;
    InfoValue = InfoValue.replace(/<br>/g, "\n");
    InfoInput.value = InfoValue;



    let HiddenDiv = selected.querySelector(".Hidden");
    let Link = HiddenDiv.querySelector("p");
    NameInput.value = Link.querySelector("a").textContent;
    LinkInput.value = Link.querySelector("a").href;

    let TrackDiv = selected.querySelector(".Image_Track");
    let Photos = TrackDiv.querySelectorAll("img");
    let newIndex = 0;
    let PhotoSrc = [];
    for(let Photo of Photos){
        PhotoSrc[newIndex]=Photo.src;
        newIndex++;
    }

    newEvent.Cover = CoverPhoto.src;
    newEvent.Desc=DescInput.value;
    newEvent.Info=InfoInput.value;
    newEvent.Name = NameInput.value;
    newEvent.Link = LinkInput.value;
    newEvent.Photos = PhotoSrc;

    PhotosTextBox = PhotoSrc.join("\n");
    
}

function AddListeners(){

    const MButtons = EventList.getElementsByClassName("EditorM");
    const RButtons = EventList.getElementsByClassName("EditorR");

    for(let button of MButtons){
        button.addEventListener("click", ()=>{
            ipcRenderer.send("Modify", button.id);
            SetValues(button.id);
        });
    }

    for(let button of RButtons){
        button.addEventListener("click", ()=>{
            ipcRenderer.send("Remove", button.id);
            Remove(button.id);
        });
    }

}

SaveButton.addEventListener("click", ()=>{
    ipcRenderer.send("SaveRen");
})

CancelButton.addEventListener("click", ()=>{
    ipcRenderer.send("GoBack");
})