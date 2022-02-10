/**
 * Adds a login popover to all login links on a page.
 */
define(['shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery', 'modules/api', 'hyprlive', 'underscore', 'vendor/jquery-placeholder/jquery.placeholder'], function ($, api, Hypr, _) {

    var usePopovers = function() {
        return !Modernizr.mq('(max-width: 480px)');
    },
    isTemplate = function(path) {
        return require.mozuData('pagecontext').cmsContext.template.path === path;
    },
    returnFalse = function () {
        return false;
    },
    $docBody,

    polyfillPlaceholders = !('placeholder' in $('<input>')[0]);

    var DismissablePopover = function () { };

    $.extend(DismissablePopover.prototype, {
        boundMethods: [],
        setMethodContext: function () {
            for (var i = this.boundMethods.length - 1; i >= 0; i--) {
                this[this.boundMethods[i]] = $.proxy(this[this.boundMethods[i]], this);
            }
        },
        dismisser: function (e) {
            if (!$.contains(this.popoverInstance.$tip[0], e.target) && !this.loading) {
                // clicking away from a popped popover should dismiss it
                this.$el.popover('destroy');
                this.$el.on('click', this.createPopover);
                this.$el.off('click', returnFalse);
                this.bindListeners(false);
                $docBody.off('click', this.dismisser);
            }
        },
        setLoading: function (yes) {
            this.loading = yes;
            this.$parent[yes ? 'addClass' : 'removeClass']('is-loading');
        },
        onPopoverShow: function () {
            var self = this;
            _.defer(function () {
                $docBody.on('click', self.dismisser);
                self.$el.on('click', returnFalse);
            });
            this.popoverInstance = this.$el.data('bs.popover');
            this.$parent = this.popoverInstance.tip();
            this.bindListeners(true);
            this.$el.off('click', this.createPopover);
            if (polyfillPlaceholders) {
                this.$parent.find('[placeholder]').placeholder({ customClass: 'mz-placeholder' });
            }
        },
        createPopover: function (e) {
            // in the absence of JS or in a small viewport, these links go to the login page.
            // Prevent them from going there!
            var self = this;
            if (usePopovers()) {
                e.preventDefault();
                // If the parent element's not positioned at least relative,
                // the popover won't move with a window resize
                //var pos = $parent.css('position');
                //if (!pos || pos === "static") $parent.css('position', 'relative');
                this.$el.popover({
                    //placement: "auto right",
                    animation: true,
                    html: true,
                    trigger: 'manual',
                    content: this.template,
                    container: 'body'
                }).on('shown.bs.popover', this.onPopoverShow)
                .popover('show');

            }
        },
        retrieveErrorLabel: function (xhr) {
            var message = "";
            if (xhr.message) {
                message = Hypr.getLabel(xhr.message);
            } else if ((xhr && xhr.responseJSON && xhr.responseJSON.message)) {
                message = Hypr.getLabel(xhr.responseJSON.message);
            }

            if (!message || message.length === 0) {
                this.displayApiMessage(xhr);
            } else {
                var msgCont = {};
                msgCont.message = message;
                this.displayApiMessage(msgCont);
            }
        },
                displayApiMessage: function (xhr) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var patt = new RegExp(re);
            if(xhr.applicationName === "Customer" && xhr.errorCode === "ITEM_NOT_FOUND" ){
                xhr.message = Hypr.getThemeSetting('resetPasswordMessage');//Hypr.getLabel('resetPasswordMessage');
            }
            if(xhr.message.indexOf('Login as')>-1 && xhr.message.indexOf('failed. Please try again.')>-1  ){
                if($('[data-mz-login-email]').val().length>0 || $('[data-mz-login-password]').val().length>0){
                    if( !patt.test($('[data-mz-login-email]').val())){
                         xhr.message = Hypr.getThemeSetting('validEmialSignUp');  
                        }else if($('[data-mz-login-password]').val().length===0){
                            xhr.message = Hypr.getThemeSetting('passwordMissing');
                        } 
                        else{
                            var emailId = xhr.message.substring(xhr.message.indexOf('Login as') +('Login as').length ,xhr.message.indexOf('failed. Please try again.'));
                            xhr.message = Hypr.getLabel('loginFailedMessage',emailId);    
                        }
                        
                    
                 
                }else {   
                     xhr.message = Hypr.getThemeSetting('missingcredentials');  
                }
                  
            }
            if(xhr.message === "Missing or invalid parameter: resetPasswordInfo UserName or EmailAddress must be provided"){
                this.displayMessage(Hypr.getThemeSetting('validEmialSignUp'));
            }else if(xhr.message === "The system does not permit the attempted operation.  User account is locked, Please contact System Administrator "){
                this.displayMessage(Hypr.getThemeSetting('lockedaccount'));
            }else if(xhr.message === "Login failed. Please specify a user."){ 
                this.displayMessage("Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.");   
            }else{
                this.displayMessage(xhr.message || (xhr && xhr.responseJSON && xhr.responseJSON.message) || Hypr.getLabel('unexpectedError'));    
            }
            
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            if(msg === "Missing or invalid parameter: password Password must be a minimum of 6 characters with at least 1 number and 1 alphabetic character"){
                msg = "Password must be a minimum of 6 characters with at least 1 number and 1 alphabetic character";
            }
            if(msg == "Missing or invalid parameter: EmailAddress EmailAddress already associated with a login"){
           //     this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + Hypr.getThemeSetting('alreadyassociated') + '</span>');    
            $('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
            }else{
           // this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
            $('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
            }
            
        },
        init: function (el) {
            this.$el = $(el);
            this.loading = false;
            this.setMethodContext();
            if (!this.pageType){
                this.$el.on('click', this.createPopover);
            }
            else {
               this.$el.on('click', _.bind(this.doFormSubmit, this));
            }    
        },
        doFormSubmit: function(e){
            e.preventDefault();
            this.$parent = this.$el.closest(this.formSelector);
            this[this.pageType]();
        }
    });

    var LoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.login = _.debounce(this.login, 150);
        this.retrievePassword = _.debounce(this.retrievePassword, 150);
    };
    LoginPopover.prototype = new DismissablePopover();
    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/login-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            this.panelWidth = this.$parent.find('.mz-l-slidebox-panel').first().outerWidth();
            this.$slideboxOuter = this.$parent.find('.mz-l-slidebox-outer');

            if (this.$el.hasClass('mz-forgot')){
                this.slideRight();
            }
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                switch ($parentForm.data('mz-role')) {
                    case "login-form":
                        this.login();
                        break;
                    case "forgotpassword-form":
                        this.retrievePassword();
                        break;
                }
                return false;
            }
        },
        slideRight: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', -this.panelWidth);
        },
        slideLeft: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', 0);
        },
        login: function () {
            this.setLoading(true);
            var domainName = "jellybellydsd.com";
            if(window.location.host.indexOf("mozu") !== -1){
                if(window.location.host.indexOf('stg1')!==-1){
                    domainName = "stg1.mozu.com";
                }else{
                    domainName = "sandbox.mozu.com";
                }
            } 
            var userEmail = $('[name="email-login"]').val();
            $.cookie("userEmail", userEmail, {path: '/', expires: 1, domain: domainName });   
                api.action('customer', 'loginStorefront', {
                  //  email: this.$parent.find('[data-mz-login-email]').val(),
                //    password: this.$parent.find('[data-mz-login-password]').val()
                    email:userEmail,
                    password:$('[name="password-login"]').val()
                    
                }).then(this.handleLoginComplete, this.displayApiMessage);
            
        },
        anonymousorder: function() {
            var email = "";
            var billingZipCode = "";
            var billingPhoneNumber = "";

            switch (this.$parent.find('[data-mz-verify-with]').val()) {
                case "zipCode":
                    {
                        billingZipCode = this.$parent.find('[data-mz-verification]').val();
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }
                case "phoneNumber":
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = this.$parent.find('[data-mz-verification]').val();
                        break;
                    }
                case "email":
                    {
                        billingZipCode = null;
                        email = this.$parent.find('[data-mz-verification]').val();
                        billingPhoneNumber = null;
                        break;
                    }
                default:
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }

            }

            this.setLoading(true);
            // the new handle message needs to take the redirect.
            api.action('customer', 'orderStatusLogin', {
                ordernumber: this.$parent.find('[data-mz-order-number]').val(),
                email: email,
                billingZipCode: billingZipCode,
                billingPhoneNumber: billingPhoneNumber
            }).then(function () { window.location.href = "/my-anonymous-account"; }, _.bind(this.retrieveErrorLabel, this));
        },
        retrievePassword: function () {
            this.setLoading(true);
            api.action('customer', 'resetPasswordStorefront', {
                EmailAddress: this.$parent.find('[data-mz-forgotpassword-email]').val()
            }).then(_.bind(this.displayResetPasswordMessage,this), this.displayApiMessage);
        },
        handleLoginComplete: function () {  
           /*  if ( returnUrl ){
                window.location.href= returnUrl;
            }else{
                window.location = "//"+window.location.host;  
            }*/

            window.location = "//"+window.location.host; 
            /* $('#receiver').load('/myaccount', function() {
                var customer = JSON.parse($('#receiver #data-mz-preload-customer').html());
                if(customer.segments.length>0){
                    var len = customer.segments.length;
                    var i=0;
                    for(i;i<len;i++){
                        if(customer.segments[i].code == "DSD"){
                          window.location = "//"+window.location.host;  
                          return true;
                        }
                    }
                    window.location = '/logout';
                }else{
                    window.location = "/logout";
                }
                
            });  */  
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
         /*validData: function(){
            var validity = true;
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var patt = new RegExp(re);
            if(this.$parent.find('[data-mz-login-email]').val().length === 0){
                this.$parent.find('[data-mz-login-email]').css({'border':'1px solid #e9000f'});
                this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + Hypr.getThemeSetting('missingcredentials') + '</span>');
                validity = false;
            }else if(patt.test(this.$parent.find('[data-mz-login-email]').val())){
                this.$parent.find('[data-mz-login-email]').css({'border':'1px solid #c2c2c2'});    
            }else{
                this.$parent.find('[data-mz-login-email]').css({'border':'1px solid #e9000f'});
                this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + Hypr.getThemeSetting('validEmialSignUp') + '</span>');
                validity = false;
            }
            if(this.$parent.find('[data-mz-login-password]').val().length === 0){
                this.$parent.find('[data-mz-login-password]').css({'border':'1px solid #e9000f'});    
                this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + Hypr.getThemeSetting('missingcredentials') + '</span>');
                validity = false;
            }else{
                this.$parent.find('[data-mz-login-password]').css({'border':'1px solid #c2c2c2'});    
            }
            return validity;
        }*/
    });

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    SignupPopover.prototype = new DismissablePopover();
    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function (e) {
            if (e.which === 13) { this.signup(); }
        },
        validate: function (payload) {
            if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
            if (payload.password !== this.$parent.find('[data-mz-signup-confirmpassword]').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
            return true;
        },
        signup: function () {
            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val(),
                payload = {
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: this.$parent.find('[data-mz-signup-password]').val()
                };
            if (this.validate(payload)) {   
                //var user = api.createSync('user', payload);
                this.setLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    if (self.redirectTemplate) {
                        window.location.pathname = self.redirectTemplate;
                    }
                    else {
                        window.location.reload();
                    }
                }, self.displayApiMessage);
            }
        }
    });

    $(document).ready(function() {
        $docBody = $(document.body);
        $('[data-mz-action="login"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signup"]').each(function() {
            var popover = new SignupPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="launchforgotpassword"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signuppage-submit"]').each(function(){
            var signupPage = new SignupPopover();
            signupPage.formSelector = 'form[name="mz-signupform"]';
            signupPage.pageType = 'signup';
            signupPage.redirectTemplate = 'myaccount';
            signupPage.init(this);
        });
        $('[data-mz-action="loginpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'login';
            loginPage.init(this);
        });
        $('[data-mz-action="anonymousorder-submit"]').each(function () {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-anonymousorder"]';
            loginPage.pageType = 'anonymousorder';
            loginPage.init(this);
        });
        $('[data-mz-action="forgotpasswordpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-forgotpasswordform"]';
            loginPage.pageType = 'retrievePassword';
            loginPage.init(this);
        }); 

        $('[data-mz-action="logout"]').each(function(){
            var el = $(this);

            //if were in edit mode, we override the /logout GET, to preserve the correct referrer/page location | #64822
            if (require.mozuData('pagecontext').isEditMode) {
 
                 el.on('click', function(e) {
                    e.preventDefault(); 
                    $.ajax({
                        method: 'GET',
                        url: '../../logout',
                        complete: function() { location.reload();}
                    });
                });
            }
            
        });  
        var domainName = "jellybellydsd.com";
        if(window.location.host.indexOf("mozu") !== -1){
            if(window.location.host.indexOf('stg1')!==-1){
                domainName = "stg1.mozu.com";
            }else{
                domainName = "sandbox.mozu.com";
            }
          // Custom function for  logout.
         $("a[data-mz-action='logout'],.comltlogout").click(function(e){  
             //console.log("logged out");
            $(".timeout .modal-container").hide();
           /* $.cookie("userData", null, { path: '/', domain: domainName}); */
             if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('wwwSiteLink').split(".")[0].split("-")[1]){
                e.preventDefault();    
             }  
           /* $.cookie("userData", null, { path: '/', domain: domainName}); */
             $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
                    $.ajax({   
                        method: 'GET',   
                        url: '../../logout',   
                        complete: function() {
                            if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('wwwSiteLink').split(".")[0].split("-")[1])
                                window.location = Hypr.getThemeSetting('themeLoginURL')+"?clearSession=yes";     
                            //window.location = Hypr.getThemeSetting('themeLoginURL');   
                            //location.reload();    
                            }  
                    }); 
             }); 
            
        }else{      
       // Custom function for  logout.
         $("a[data-mz-action='logout']").click(function(e){  
             //console.log("logged out");
          //  $.cookie("userData", null, { path: '/', domain: domainName}); 
             if(window.location.host.indexOf('east') != -1 ||  window.location.host.indexOf('west') !=-1){
                e.preventDefault();    
             } 
             
           // $.cookie("userData", null, { path: '/', domain: domainName}); 
           $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
                    $.ajax({   
                        method: 'GET',   
                        url: '../../logout',   
                        complete: function() { 
                            if(window.location.host.indexOf('east') != -1 || window.location.host.indexOf('west') !==-1)
                                window.location = Hypr.getThemeSetting('themeLoginURL')+"?clearSession=yes";     
                            //window.location = Hypr.getThemeSetting('themeLoginURL');   
                            //location.reload();    
                            }  
                    }); 
             }); 
        }

        $('.editchange #edit-change').on('click',function(e){
            e.preventDefault();   
            //window.location = '/logout'; 
          /*   $.removeCookie("userData");
            $.cookie("userData", null, { path: '/', domain: domainName}); */
            $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
                    $.ajax({    
                        method: 'GET',   
                        url: '../../logout',   
                        complete: function() {
                                window.location.href = Hypr.getThemeSetting('wwwSiteLink'); 
                            }  
                    });  
        });
        

        
            
    //    });
        if(window.location.search.indexOf("clearSession") !== -1 ){
            //$("a[data-mz-action='logout']").trigger("click");
            //e.preventDefault();     
           /* $.removeCookie("userData");
            $.cookie("userData", null, { path: '/', domain: domainName}); */
             $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
                    $.ajax({   
                        method: 'GET',   
                        url: '../../logout',   
                        complete: function() {
                                window.location.href = Hypr.getThemeSetting('themeLoginURL');  
                            // window.location = Hypr.getThemeSetting('themeLoginURL');   
                            //location.reload();    
                            }  
                    });    
                             
        } 
        /**
         * enum used for handling the differnt sections without conflict.
        **/
        var EMAIL = 1,
            PASSWORD = 2,
            LOGIN = 3,
            FORGETPASSWORD = 4;
        
        /**
         * Toggle the visibility between the login and forget forms
        **/
        $('[toggle-login-forget-password-form]').on('click',function(e){
            var formName = e.target.getAttribute('toggle-login-forget-password-form');
            if(formName === "login"){
                $('[forgetpassword-form-container]').fadeOut(function(){
                    $('[login-form-container]').fadeIn();
                });
            }else{
                $('[login-form-container]').fadeOut(function(){
                    $('[forgetpassword-form-container]').fadeIn();
                });
            }
        });
        
        /**
         * Handle forget password email submit button...
        **/
        $('[submitforgotpassword]').on('click',function(){
            var email = $('[name="reset-password-email"]').val();
            if(validate(EMAIL,email,FORGETPASSWORD)){
                api.action('customer', 'resetPasswordStorefront', {
                    EmailAddress: email
                }).then(displayResetPasswordMessage, displayApiMessageForgetPassword);
            }
        });
        
        /**
         * validating the form data
        **/
        function validate(field, value, section){  
            clearAllValidations();
            switch(field){
                case(1):
                    if(value.length === 0){
                        showValidationMessages(section, "Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.", "#b94a48");
                        return false;
                    }
                    return true;
                case(2):   
                    if(value.length === 0){
                        showValidationMessages(section, "Please provide a valid Password, which must have a minimum of 6 characters with at least 1 number and 1 alphabetic character.", "#b94a48");
                        return false;
                    }
                    return true;
            }
        }
        
        /**
         * Show Error or Validation message for both section
         * message-login-bar
         * forgetpassword-message
        **/
        function showValidationMessages(section, msg, typeColor){
            switch(section){
                case(3):
                    $('[message-login-bar]')[0].innerHTML = msg;
                    $('[message-login-bar]').css({'color':typeColor});
                    $('[message-login-bar]').fadeIn();
                    break;
                case(4):
                    $('[forgetpassword-message]')[0].innerHTML = msg;
                    $('[forgetpassword-message]').css({'color':typeColor});
                    $('[forgetpassword-message]').fadeIn();
                    break;
            }
        }
        
        /**
         * Clear all validations and remove messages 
        **/
        function clearAllValidations(){
            var msg = "", typeColor = "#000";
            $('[message-login-bar]')[0].innerHtml = msg;
            $('[message-login-bar]').css({'color':typeColor});
            $('[forgetpassword-message]')[0].innerHtml = msg;
            $('[forgetpassword-message]').css({'color':typeColor});
            $('[message-login-bar]').fadeOut();
            $('[forgetpassword-message]').fadeOut();
        }
        /**
         * Show Reset password success message
        **/
        function displayResetPasswordMessage(a,b,c){
            showValidationMessages(FORGETPASSWORD,"Password reset link has been sent to your registered email address.","#0F0");
        }
        
        /**
         * Show resetpassword api error message.
        **/
        function displayApiMessageForgetPassword(a,b,c){
            //UCP Changes
            if(a.message === undefined){
                var msg = "";
                if(a.errors){
                    if(a.errors.applicationName === "MozuStorefront" && a.errors.errorCode === "ITEM_NOT_FOUND"){
                        msg =   "Please make sure your Email Address is correct and that you have an account. Make sure you have included the '@' and the '.' in the address";
                    }
                }else if(a.applicationName === "Customer" && a.errorCode === "ITEM_NOT_FOUND"){
                    msg =   a.errors.message.split(':')[1]+ Hypr.getLabel('forgotPassword'); 
                }
                showValidationMessages(FORGETPASSWORD,msg,"#b94a48");
            }else{
                showValidationMessages(FORGETPASSWORD,a.message.split(':')[1]+ Hypr.getLabel('forgotPassword'),"#b94a48");
            }
          
        }
    }); 
    
});










