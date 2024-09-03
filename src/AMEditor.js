const { ipcRenderer } = require("electron");

const TextBox = document.getElementById("TextBox");

const Confirm = document.getElementById("Confirm");
const Reverse = document.getElementById("Back");

TextBox.addEventListener("input", ()=>{
    
    const currValue = TextBox.value;
    console.log("Update Inner", TextBox.innerHTML);
    ipcRenderer.send("UpdateAMValue", currValue);
})

Confirm.addEventListener("click", ()=> {
    let currValue = TextBox.value;
    currValue=currValue.replace(/\n/g,'<br>');
    console.log(currValue);
    ipcRenderer.send("SaveAM", currValue);

})

Reverse.addEventListener("click", ()=>{
    ipcRenderer.send("GoBack");
})

async function getTextBoxValue() {
    try{
        const Value  = await ipcRenderer.invoke("ValueReceive");
        console.log(Value);
        TextBox.value = Value;
    }
    catch(error)
    {
        console.log(error);
    }
}

getTextBoxValue();