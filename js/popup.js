let auth;
let content;
let user = {
    id: null,
    token: null,
};

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function normalize(x) {
    const MAX = 2;
    const MIN = 0;

    return (x - MIN) / (MAX - MIN);
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
        const body = JSON.stringify({
            username,
            password,
        });

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
                    
                    try {
                        let json = JSON.parse(xhr.responseText);
                        user.id = json.user.id;
                        user.token = json.token;
                    } catch(e) {
                        console.log(e);
                    }

                    chrome.storage.local.set({logged: true});
                    chrome.storage.local.set({userId: user.id});
                    chrome.storage.local.set({token: user.token});
                    this.clearRegisterInputs();
                    this.clearLoginInputs();
                } else if (xhr.status === 401) {
                    this.setGlobalError('login', true, 'Niepoprawne dane');
                } else if (xhr.status === 404) {
                    this.setGlobalError('login', true, 'Niepoprawny uzytkownik');
                } else {
                    this.setGlobalError('login', true, 'Wystapil blad');
                }
            }
        });

        xhr.open('POST', 'http://localhost:8080/api/auth/login');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    }

    setGlobalError(section, error, message = 'Unexpected error occured') {
        console.log(message);
        if (error) {
            document.getElementById(`auth-${section}-error`).setAttribute('name', 'shown');
            document.getElementById(`auth-${section}-error`).innerHTML = message;
        } else {
            document.getElementById(`auth-${section}-error`).removeAttribute('name');
            document.getElementById(`auth-${section}-error`).innerHTML = '';
        }
    }

    register() {
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
        const body = JSON.stringify({
            username,
            email,
            password,
        });

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
                    this.chooseTab(0);

                    this.clearRegisterInputs();
                } else if (xhr.status === 500) {
                    // TODO
                    this.setGlobalError('register', true);
                } else {
                    this.setGlobalError('register', true, 'Niepoprawne dane');
                }
            }
        });

        xhr.open('POST', 'http://localhost:8080/api/user/addUser');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    }

    clearLoginInputs() {
        document.getElementById('auth-login-username-input').value = '';
        document.getElementById('auth-login-password-input').value = '';
    }

    clearRegisterInputs() {
        document.getElementById('auth-register-username-input').value = '';
        document.getElementById('auth-register-email-input').value = '';
        document.getElementById('auth-register-password-input').value = '';
        document.getElementById('auth-register-password-repeat-input').value = '';
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

        this.formalityId = null;
        this.emotionsId = null;
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

        document.getElementById('content-results-formality-review-button').addEventListener('click', () => {
            this.openReview('formality');
        });

        document.getElementById('content-results-emotions-review-button').addEventListener('click', () => {
            this.openReview('emotions');
        });
    }

    checkFormality() {
        this.setInputError(false);
        this.setError('formality', false);
        
        const text = document.getElementById('content-textarea').value.trim();

        if (text.length === 0) {
            this.setInputError(true, 'This field cannot be empty');
            return;
        }

        if (this.currentText !== text) {
            this.currentText = text;
            this.formalityId = null;

            this.setInputError(false);
            this.setError('emotions', false);
            document.getElementById('content-results-emotions').removeAttribute('name');
        }
        
        // Body
        const body = JSON.stringify({
            text,
            userId: user.id,
        });

        this.setLoading('formality', true);
        document.getElementById('content-results-formality').removeAttribute('name');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.setLoading('formality', false);

                if (xhr.status == 200 || xhr.status == 201) {
                    try {
                        const results = JSON.parse(xhr.responseText);
                        this.showFormalityResults(results);
                        this.formalityId = results.id;
                    } catch(e) {
                        this.setError('emotions', true, 'Unable to interpret server response');
                    }
                   
                } else if (xhr.status === 500) {
                    this.setError('formality', true);
                } else {
                    this.setError('formality', true, 'Unable to get formality results');
                }
            }
        });

        xhr.open('POST', 'http://localhost:8080/api/formality/recognize');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', user.token);
        xhr.send(body);
    }

    checkEmotions() {
        this.setInputError(false);
        this.setError('emotions', false);
        
        const text = document.getElementById('content-textarea').value;

        if (text.length === 0) {
            this.setInputError(true, 'This field cannot be empty');
            return;
        }

        if (this.currentText !== text) {
            this.currentText = text;
            this.emotionsId = null;

            this.setInputError(false);
            this.setError('formality', false);
            document.getElementById('content-results-formality').removeAttribute('name');
        }

        // Body
        const body = JSON.stringify({
            text,
            userId: user.id,
        });

        this.setLoading('emotions', true);
        document.getElementById('content-results-emotions').removeAttribute('name');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.setLoading('emotions', false);
                
                if (xhr.status == 200 || xhr.status == 201) {
                    try {
                        const results = JSON.parse(xhr.responseText);
                        this.showEmotionsResults(results);
                        this.emotionsId = results.id;
                    } catch(e) {
                        this.setError('emotions', true, 'Unable to interpret server response');
                    }
                } else if (xhr.status === 500) {
                    this.setError('emotions', true);
                } else {
                    this.setError('emotions', true, 'Unable to get emotions results');
                }
            }
        });

        xhr.open('POST', 'http://localhost:8080/api/emotions/recognize');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', user.token);

        xhr.send(body);
    }

    openReview(type) {
        const id = type === 'formality' ? this.formalityId : this.emotionsId;
        if (id === null) {
            return;
        }

        window.open(`http://localhost:8081?type=${type}&id=${id}&userId=${user.id}&token=${user.token}`);
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

        results.formality = normalize(results.formality)
        results.informality = normalize(results.informality)
        
        document.getElementById('content-result-formality-1').innerHTML = `${results.formality * 100}%`;
        document.getElementById('content-result-formality-col-1').style.background = `rgba(255, 153, 0, ${results.formality})`;
        document.getElementById('content-result-formality-2').innerHTML = `${results.informality * 100}%`;
        document.getElementById('content-result-formality-col-2').style.background = `rgba(255, 153, 0, ${results.informality})`;
    }

    showEmotionsResults(results) {
        document.getElementById('content-results-emotions').setAttribute('name', 'shown');

        results.happy = normalize(results.happy)
        results.sad = normalize(results.sad)
        results.fear = normalize(results.fear)
        results.angry = normalize(results.angry)
        results.surprise = normalize(results.surprise)

        document.getElementById('content-result-emotion-1').innerHTML = `${results.happy * 100}%`;
        document.getElementById('content-result-emotion-col-1').style.background = `rgba(255, 153, 0, ${results.happy})`;
        document.getElementById('content-result-emotion-2').innerHTML = `${results.sad * 100}%`;
        document.getElementById('content-result-emotion-col-2').style.background = `rgba(255, 153, 0, ${results.sad})`;
        document.getElementById('content-result-emotion-3').innerHTML = `${results.fear * 100}%`;
        document.getElementById('content-result-emotion-col-3').style.background = `rgba(255, 153, 0, ${results.fear})`;
        document.getElementById('content-result-emotion-4').innerHTML = `${results.angry * 100}%`;
        document.getElementById('content-result-emotion-col-4').style.background = `rgba(255, 153, 0, ${results.angry})`;
        document.getElementById('content-result-emotion-5').innerHTML = `${results.surprise * 100}%`;
        document.getElementById('content-result-emotion-col-5').style.background = `rgba(255, 153, 0, ${results.surprise})`;
    }

    clear() {
        document.getElementById('content-results-formality').removeAttribute('name');
        document.getElementById('content-results-emotions').removeAttribute('name');
        document.getElementById('content-textarea').value = '';
    }

    logout() {
        // Request
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8080/api/auth/logout');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', user.token);
        xhr.send(null);

        this.clear();
        user.id = null;
        user.token = null;
        chrome.storage.local.remove(['logged']);
        chrome.storage.local.remove(['userId']);
        chrome.storage.local.remove(['token']);
        content.hide();
        auth.show();
    }
}

window.onload = () => {
    auth = new AuthSection();
    content = new ContentSection();

    chrome.storage.local.get(['logged'], (loggedResult) => {
        if (loggedResult.logged) {
            chrome.storage.local.get(['userId'], (idResult) => {
                if (idResult.userId) {
                    chrome.storage.local.get(['token'], (tokenResult) => {
                        if (tokenResult.token) {
                            user.token = tokenResult.token;
                            user.id = idResult.userId;

                            content.show();
                        } else {
                            auth.show();
                        }
                    });
                } else {
                    auth.show();
                }
            });
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