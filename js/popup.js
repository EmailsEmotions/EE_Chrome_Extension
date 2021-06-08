
class Section {
    constructor(sectionName) {
        this.sectionName = sectionName;
    }

    show() {
        document.getElementById(this.sectionName).setAttribute('name', 'shown');
    }

    hide() {
        document.getElementById(this.sectionName).removeAttribute('name');
    }
}

class AuthSection extends Section {
    constructor() {
        super('auth');

        this.tabs = 2;
        this.currTab = null;
        this.chooseTab(0);

        this.appendListeners();
    }

    appendListeners() {
        // Tabs
        for (let i = 0; i < this.tabs; i++) {
            document.getElementsByClassName('auth-header-label')[i].addEventListener('click', () => {
                this.chooseTab(i)
            });
        }

        // Login
        document.getElementById('auth-button-login').addEventListener('click', () => {
            this.login();
        });

        document.getElementById('auth-button-no-acccount').addEventListener('click', () => {
            const registerTab = 1;
            this.chooseTab(registerTab);
        });

        for (const input of ['email', 'password']) {
            document.getElementById(`auth-login-${input}-input`).addEventListener('click', () => {
                this.setError('login', input, false);
            });
        }
    }

    chooseTab(which) {
        // Cancel if already chosen
        if (which == this.currTab) {
            return;
        }

        // Hide previously selected tab
        if (this.currTab !== null) {
            const oldTab = document.getElementsByClassName('auth-header-label')[this.currTab];
            oldTab.removeAttribute('name');
            
            const oldTabName = oldTab.dataset.name;
            document.getElementById(`auth-${oldTabName}`).removeAttribute('name');
        }

        // Select new tab
        this.currTab = which;

        const tab = document.getElementsByClassName('auth-header-label')[which];
        tab.setAttribute('name', 'active');

        const tabName = tab.dataset.name;
        document.getElementById(`auth-${tabName}`).setAttribute('name', 'active');

        // Fix pre-load issue
        const margin = 4;
        const offset = tab.offsetLeft <= 0 ? margin : tab.offsetLeft;
        document.getElementById('auth-header-line').style.left 
            = `${offset - margin}px`;
    }

    login() {
        for (const input of ['email', 'password']) {
            document.getElementById(`auth-login-${input}-input`).readOnly = true;
        }
        document.getElementById('auth-login-buttons').setAttribute('name', 'hidden');
        document.getElementById('auth-login-loading').setAttribute('name', 'shown');

        setTimeout(() => {
            for (const input of ['email', 'password']) {
                document.getElementById(`auth-login-${input}-input`).readOnly = true;
            }
            document.getElementById('auth-login-buttons').removeAttribute('name');
            document.getElementById('auth-login-loading').removeAttribute('name');
            this.setError('login', 'password', true, 'Custom error message');
        }, 2000);
    }

    setError(section, name, isError, message = '') {
        if (isError) {
            document.getElementById(`auth-${section}-${name}-input`).setAttribute('name', 'error');
        } else {
            document.getElementById(`auth-${section}-${name}-input`).removeAttribute('name');
        }
        document.getElementById(`auth-${section}-${name}-error`).innerHTML = message;
    }
}

window.onload = () => {
    const auth = new AuthSection();
    auth.show();
}


// let checkFormality = document.getElementById('check-formality');
// let checkEmotions = document.getElementById('check-emotions');
// let text = document.getElementById('text-to-check');
// let info = document.getElementById('info');

// setPageBackgroundColor();

// checkFormality.addEventListener('click', function () {
//     var myHeaders = new Headers();
//     myHeaders.append('Content-Type', 'application/json');
    
//     var raw = JSON.stringify({'text': text.value});
    
//     var requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: raw,
//         redirect: 'follow'
//     };
    
//     fetch('http://localhost:8998/countnos', requestOptions)
//         .then(response => response.text())
//         .then(result => info.innerHTML = 'Result: ' + result)
//         .catch(error => console.log('error', error));
// });

// checkEmotions.addEventListener('click', function () {
//     notImplementedYetInfo()
// });

// function notImplementedYetInfo() {
//     info.innerHTML = 'Not implemented yet! <br/>Entered text: ' + text.value
// }

// function setPageBackgroundColor() {
//     chrome.storage.sync.get('color', ({ color }) => {
//         document.body.style.backgroundColor = color;
//     });
// }
