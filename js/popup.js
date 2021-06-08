
let auth;
let content;
let tmp = 1;

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

        // Register
        document.getElementById('auth-button-register').addEventListener('click', () => {
            this.register();
        });

        document.getElementById('auth-button-have-acccount').addEventListener('click', () => {
            const loginTab = 0;
            this.chooseTab(loginTab);
        });

        for (const input of ['email', 'password', 'password-repeat']) {
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
        // Set readonly and clear errors
        for (const input of ['email', 'password']) {
            this.setError('login', input, false);
            document.getElementById(`auth-login-${input}-input`).readOnly = true;
        }

        // Hide buttons, show loading
        document.getElementById('auth-login-buttons').setAttribute('name', 'hidden');
        document.getElementById('auth-login-loading').setAttribute('name', 'shown');

        // Mock result
        setTimeout(() => {
            // Disable readonly
            for (const input of ['email', 'password']) {
                document.getElementById(`auth-login-${input}-input`).readOnly = true;
            }

            // Show buttons, hide loading
            document.getElementById('auth-login-buttons').removeAttribute('name');
            document.getElementById('auth-login-loading').removeAttribute('name');

            // Errors
            this.setError('login', 'password', true, 'Custom error message');

            if (tmp === 2) {
                auth.hide();
                content.show();
            }
            tmp++;
        }, 20);
    }

    register () {
        // Set readonly and clear errors
        for (const input of ['email', 'password', 'password-repeat']) {
            this.setError('register', input, false);
            document.getElementById(`auth-register-${input}-input`).readOnly = true;
        }

        // Hide buttons, show loading
        document.getElementById('auth-register-buttons').setAttribute('name', 'hidden');
        document.getElementById('auth-register-loading').setAttribute('name', 'shown');

        // Mock result
        setTimeout(() => {
            // Disable readonly
            for (const input of ['email', 'password']) {
                document.getElementById(`auth-register-${input}-input`).readOnly = true;
            }

            // Show buttons, hide loading
            document.getElementById('auth-register-buttons').removeAttribute('name');
            document.getElementById('auth-register-loading').removeAttribute('name');

            // Errors
            this.setError('register', 'password', true, 'Custom error message');
            this.setError('register', 'password-repeat', true, 'Custom error message v2');
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

class ContentSection extends Section {
    constructor() {
        super('content');

        this.appendListeners();
    }

    appendListeners() {
        document.getElementById('content-button-formality').addEventListener('click', () => {
            this.checkFormality();
        });

        document.getElementById('content-button-emotions').addEventListener('click', () => {
            this.checkEmotions();
        });
    }

    checkFormality() {
        this.startFormalityLoading();
        document.getElementById('content-results-formality').removeAttribute('name');

        setTimeout(() => {
            this.stopFormalityLoading();
            this.showFormalityResults({formal: 20, informal: 80});
            this.showReviewButton();
        }, 1000);
    }

    checkEmotions() {
        this.startEmotionsLoading();
        document.getElementById('content-results-emotions').removeAttribute('name');

        setTimeout(() => {
            this.stopEmotionsLoading();
            this.showEmotionsResults({a: 10, b: 20, c: 30, d: 80, e: 50});
            this.showReviewButton();
        }, 1000);
    }

    startFormalityLoading() {
        document.getElementById('content-textarea').readOnly = true;
        document.getElementById('content-button-formality').setAttribute('name', 'hidden');
        document.getElementById('content-formality-loading').setAttribute('name', 'shown');
    }

    stopFormalityLoading() {
        document.getElementById('content-textarea').readOnly = false;
        document.getElementById('content-button-formality').removeAttribute('name');
        document.getElementById('content-formality-loading').removeAttribute('name');
    }

    startEmotionsLoading() {
        document.getElementById('content-textarea').readOnly = true;
        document.getElementById('content-button-emotions').setAttribute('name', 'hidden');
        document.getElementById('content-emotions-loading').setAttribute('name', 'shown');
    }

    stopEmotionsLoading() {
        document.getElementById('content-textarea').readOnly = false;
        document.getElementById('content-button-emotions').removeAttribute('name');
        document.getElementById('content-emotions-loading').removeAttribute('name');
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

        document.getElementById('content-result-emotion-1').innerHTML = `${results.a}%`;
        document.getElementById('content-result-emotion-col-1').style.background = `rgba(255, 153, 0, ${results.a / 100})`;
        document.getElementById('content-result-emotion-2').innerHTML = `${results.b}%`;
        document.getElementById('content-result-emotion-col-2').style.background = `rgba(255, 153, 0, ${results.b / 100})`;
        document.getElementById('content-result-emotion-3').innerHTML = `${results.c}%`;
        document.getElementById('content-result-emotion-col-3').style.background = `rgba(255, 153, 0, ${results.c / 100})`;
        document.getElementById('content-result-emotion-4').innerHTML = `${results.d}%`;
        document.getElementById('content-result-emotion-col-4').style.background = `rgba(255, 153, 0, ${results.d / 100})`;
        document.getElementById('content-result-emotion-5').innerHTML = `${results.e}%`;
        document.getElementById('content-result-emotion-col-5').style.background = `rgba(255, 153, 0, ${results.e / 100})`;
    }

    showReviewButton() {
        document.getElementById('content-results-review').setAttribute('name', 'shown');
    }
}


window.onload = () => {
    auth = new AuthSection();
    auth.show();
    // auth.hide();
    content = new ContentSection();
    // content.show();
}
