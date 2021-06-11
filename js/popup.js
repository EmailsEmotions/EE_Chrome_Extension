let auth;
let content;
// TMP TO BE REMOVED
let tmp = 1;

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

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
    loginFields = ['username', 'password'];
    registerFields = ['username', 'email', 'password', 'password-repeat'];

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

        for (const input of this.loginFields) {
            document.getElementById(`auth-login-${input}-input`).addEventListener('click', () => {
                this.setError('login', input, false);
            });
        }

        // Register
        document.getElementById('auth-button-register').addEventListener('click', () => {
            this.register();
        });

        document.getElementById('auth-button-have-acccount').addEventListener('click', () => {
            const loginTab = 0;
            this.chooseTab(loginTab);
        });

        for (const input of this.registerFields) {
            document.getElementById(`auth-register-${input}-input`).addEventListener('click', () => {
                this.setError('register', input, false);
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
        // Clear errors
        this.setGlobalError('login', false);
        for (const input of this.loginFields) {
            this.setError('login', input, false);
        }

        // Validate input
        let validForm = true;

        const username = document.getElementById('auth-login-username-input').value;
        const password = document.getElementById('auth-login-password-input').value;

        if (username.length === 0) {
            validForm = false;
            this.setError('login', 'username', true, 'This field cannot be empty');
        }

        if (password.length === 0) {
            validForm = false;
            this.setError('login', 'password', true, 'This field cannot be empty');
        }

        if (!validForm) {
            return;
        }

        // Construct body
        const body = {
            username,
            password,
        };

        // Set readonly
        for (const input of this.loginFields) {
            document.getElementById(`auth-login-${input}-input`).readOnly = true;
        }

        // Hide buttons, show loading
        document.getElementById('auth-login-buttons').setAttribute('name', 'hidden');
        document.getElementById('auth-login-loading').setAttribute('name', 'shown');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                // Disable readonly
                for (const input of this.loginFields) {
                    document.getElementById(`auth-login-${input}-input`).readOnly = false;
                }

                // Show buttons, hide loading
                document.getElementById('auth-login-buttons').removeAttribute('name');
                document.getElementById('auth-login-loading').removeAttribute('name');
                
                if (xhr.status == 200 || xhr.status == 201) {
                    auth.hide();
                    content.show();
                    chrome.storage.local.set({logged: true});
                } else if (xhr.status === 500) {
                    this.setGlobalError('login', true);
                } else {
                    this.setGlobalError('login', true, 'Niepoprawne dane');
                }
            }
        });

        xhr.open('POST', 'http://localhost:8080/api/user/login');
        xhr.send(body);

        if (tmp === 2) {
            auth.hide();
            content.show();
            chrome.storage.local.set({logged: true});
        }
        tmp++;
    }

    setGlobalError(section, error, message = 'Unexpected error occured') {
        if (error) {
            document.getElementById(`auth-${section}-error`).setAttribute('name', 'shown');
            document.getElementById(`auth-${section}-error`).innerHTML = message;
        } else {
            document.getElementById(`auth-${section}-error`).removeAttribute('name');
            document.getElementById(`auth-${section}-error`).innerHTML = '';
        }
    }

    register () {
        // Clear errors
        this.setGlobalError('register', false);
        for (const input of this.registerFields) {
            this.setError('register', input, false);
        }

        // Validate input
        let validForm = true;

        const username = document.getElementById('auth-register-username-input').value;
        const email = document.getElementById('auth-register-email-input').value;
        const password = document.getElementById('auth-register-password-input').value;
        const passwordRepeated = document.getElementById('auth-register-password-repeat-input').value;

        if (username.length < 3) {
            validForm = false;
            this.setError('register', 'username', true, 'This field must contain at least 3 characters');
        }

        if (email.length < 3) {
            validForm = false;
            this.setError('register', 'email', true, 'This email is too short');
        } else if (!validateEmail(email)) {
            validForm = false;
            this.setError('register', 'email', true, 'This email seems to be invalid');
        }

        if (password.length < 8) {
            validForm = false;
            this.setError('register', 'password', true, 'Password has to have at least 8 characters');
        }

        if (password !== passwordRepeated) {
            validForm = false;
            this.setError('register', 'password-repeat', true, 'Passwords does not match');
        }

        if (!validForm) {
            return;
        }

        // Construct body
        const body = {
            username,
            email,
            password,
        };

        // Set readonly
        for (const input of this.registerFields) {
            document.getElementById(`auth-register-${input}-input`).readOnly = true;
        }

        // Hide buttons, show loading
        document.getElementById('auth-register-buttons').setAttribute('name', 'hidden');
        document.getElementById('auth-register-loading').setAttribute('name', 'shown');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                // Disable readonly
                for (const input of this.registerFields) {
                    document.getElementById(`auth-register-${input}-input`).readOnly = false;
                }

                // Show buttons, hide loading
                document.getElementById('auth-register-buttons').removeAttribute('name');
                document.getElementById('auth-register-loading').removeAttribute('name');
                
                if (xhr.status == 200 || xhr.status == 201) {
                    auth.hide();
                    content.show();
                    chrome.storage.local.set({logged: true});
                } else if (xhr.status === 500) {
                    this.setGlobalError('register', true);
                } else {
                    this.setGlobalError('register', true, 'Niepoprawne dane');
                }
            }
        });

        xhr.open('POST', 'http://localhost:8080/api/user/addUser');
        xhr.send(body);
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

class ContentSection extends Section {
    constructor() {
        super('content');

        this.currentText = null;

        this.appendListeners();
    }

    appendListeners() {
        document.getElementById('content-button-formality').addEventListener('click', () => {
            this.checkFormality();
        });

        document.getElementById('content-button-emotions').addEventListener('click', () => {
            this.checkEmotions();
        });

        document.getElementById('logout-image').addEventListener('click', () => {
            this.logout();
        });
    }

    checkFormality() {
        this.setInputError(false);
        this.setError('formality', false);
        
        const text = document.getElementById('content-textarea').value.trim();
        const userId = 1;

        if (text.length === 0) {
            this.setInputError(true, 'This field cannot be empty');
            return;
        }

        if (this.currentText !== text) {
            this.currentText = text;

            this.setInputError(false);
            this.setError('emotions', false);
            document.getElementById('content-results-emotions').removeAttribute('name');
        }
        

        // Body
        const body = {
            text,
            userId,
        };

        this.setLoading('formality', true);
        document.getElementById('content-results-formality').removeAttribute('name');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.setLoading('formality', false);

                if (xhr.status == 200 || xhr.status == 201) {
                    this.showFormalityResults({formal: 20, informal: 80});
                } else if (xhr.status === 500) {
                    this.setError('formality', true);
                } else {
                    this.setError('formality', true, 'Unable to get formality results');
                }
            }
        });

        xhr.open("POST", "http://localhost:8080/api/formality/recognize");
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(body);
    }

    checkEmotions() {
        this.setInputError(false);
        this.setError('emotions', false);
        
        const text = document.getElementById('content-textarea').value;
        const userId = 1;

        if (text.length === 0) {
            this.setInputError(true, 'This field cannot be empty');
            return;
        }

        if (this.currentText !== text) {
            this.currentText = text;

            this.setInputError(false);
            this.setError('formality', false);
            document.getElementById('content-results-formality').removeAttribute('name');
        }

        // Body
        const body = {
            text,
            userId,
        };

        this.setLoading('emotions', true);
        document.getElementById('content-results-emotions').removeAttribute('name');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.setLoading('emotions', false);
                
                if (xhr.status == 200 || xhr.status == 201) {
                    this.showEmotionsResults({happy: 10, sad: 20, fear: 30, angry: 80, surprise: 50});
                } else if (xhr.status === 500) {
                    this.setError('emotions', true);
                } else {
                    this.setError('emotions', true, 'Unable to get emotions results');
                }
            }
        });

        xhr.open("POST", "http://localhost:8080/api/emotions/recognize");
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(body);
    }

    setInputError(error, message = '') {
        this.setError('text', error, message);

        if (error) {
            document.getElementById('content-textarea').setAttribute('name', 'error');
        } else {
            document.getElementById('content-textarea').removeAttribute('name');
        }
    }

    setLoading(section, loading) {
        if (loading) {
            document.getElementById('content-textarea').readOnly = true;
            document.getElementById(`content-button-${section}`).setAttribute('name', 'hidden');
            document.getElementById(`content-${section}-loading`).setAttribute('name', 'shown');
        } else {
            document.getElementById('content-textarea').readOnly = false;
            document.getElementById(`content-button-${section}`).removeAttribute('name');
            document.getElementById(`content-${section}-loading`).removeAttribute('name');
        }
    }

    setError(section, isError, message = 'Unexpected error occured') {
        if (isError) {
            document.getElementById(`content-${section}-error`).setAttribute('name', 'shown');
            document.getElementById(`content-${section}-error`).innerHTML = message;
        } else {
            document.getElementById(`content-${section}-error`).removeAttribute('name');
            document.getElementById(`content-${section}-error`).innerHTML = '';
        }
    }

    showFormalityResults(results) {
        document.getElementById('content-results-formality').setAttribute('name', 'shown');
        
        document.getElementById('content-result-formality-1').innerHTML = `${results.formal}%`;
        document.getElementById('content-result-formality-col-1').style.background = `rgba(255, 153, 0, ${results.formal / 100})`;
        document.getElementById('content-result-formality-2').innerHTML = `${results.informal}%`;
        document.getElementById('content-result-formality-col-2').style.background = `rgba(255, 153, 0, ${results.informal / 100})`;
    }

    showEmotionsResults(results) {
        document.getElementById('content-results-emotions').setAttribute('name', 'shown');

        document.getElementById('content-result-emotion-1').innerHTML = `${results.happy}%`;
        document.getElementById('content-result-emotion-col-1').style.background = `rgba(255, 153, 0, ${results.happy / 100})`;
        document.getElementById('content-result-emotion-2').innerHTML = `${results.sad}%`;
        document.getElementById('content-result-emotion-col-2').style.background = `rgba(255, 153, 0, ${results.sad / 100})`;
        document.getElementById('content-result-emotion-3').innerHTML = `${results.fear}%`;
        document.getElementById('content-result-emotion-col-3').style.background = `rgba(255, 153, 0, ${results.fear / 100})`;
        document.getElementById('content-result-emotion-4').innerHTML = `${results.angry}%`;
        document.getElementById('content-result-emotion-col-4').style.background = `rgba(255, 153, 0, ${results.angry / 100})`;
        document.getElementById('content-result-emotion-5').innerHTML = `${results.surprise}%`;
        document.getElementById('content-result-emotion-col-5').style.background = `rgba(255, 153, 0, ${results.surprise / 100})`;
    }

    logout() {
        chrome.storage.local.remove(['logged']);
        content.hide();
        auth.show();
    }
}

window.onload = () => {
    auth = new AuthSection();
    content = new ContentSection();

    chrome.storage.local.get(['logged'], (result) => {
        if (result.logged) {
            content.show();
        } else {
            auth.show();
        }
    });

    chrome.storage.local.get(['savedWord'], (result) => {
        if (result.savedWord) {
            document.getElementById('content-textarea').value = result.savedWord;
            chrome.storage.local.remove(['savedWord']);
        }
    });
}