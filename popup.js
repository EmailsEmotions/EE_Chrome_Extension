let checkFormality = document.getElementById("check-formality");
let checkEmotions = document.getElementById("check-emotions");
let text = document.getElementById("text-to-check");
let info = document.getElementById("info");

setPageBackgroundColor();

checkFormality.addEventListener("click", function() {
    notImplementedYetInfo()
});

checkEmotions.addEventListener("click", function() {
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

