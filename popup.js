let checkFormality = document.getElementById("check-formality");
let checkEmotions = document.getElementById("check-emotions");
let text = document.getElementById("text-to-check");
let info = document.getElementById("info");

setPageBackgroundColor();

checkFormality.addEventListener("click", function () {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify({"text": text.value});
    
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    
    fetch("http://localhost:8998/countnos", requestOptions)
        .then(response => response.text())
        .then(result => info.innerHTML = "Result: " + result)
        .catch(error => console.log('error', error));
});

checkEmotions.addEventListener("click", function () {
    notImplementedYetInfo()
});

function notImplementedYetInfo() {
    info.innerHTML = "Not implemented yet! <br/>Entered text: " + text.value
}

function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}
