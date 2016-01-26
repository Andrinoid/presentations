/*
---
name: components-core
description: Contains handy components for chainwork.js 
license: MIT-style license.
requires: ChainWork
(c) 2015 Andri Birgisson
...
*/


//get element from id, class or jquery object
var normalizeElement = function(element) {
    var type = typeOf(element);
    if(type === 'element')
        return element;
    if(element instanceof jQuery)
        return element[0];
    if(type === 'string') {
        return document.querySelector(element) || document.querySelector('#' + element) || document.querySelector('.' + element);
    }
};

components.facebookInit =  {
    name: 'facebookInit',
    requirements: [],
    provides: {},
    settings: {
        callNext: true,
        appId: null,
        facebook: null,
    },
    job: function() {
        var self = this;
        //add fbroot if not present
        if (typeOf(document.getElementById('fb-root')) !== 'element') {
            var fbroot = document.createElement('div');
            fbroot.id = 'fb-root';
            document.body.insertBefore(fbroot, document.body.firstChild);
        }

        window.fbAsyncInit = function() {
            FB.init({
                appId: self.settings.appId,
                xfbml: true,
                version: 'v2.2'
            });
            //maybe this should be optional
            FB.Canvas.setAutoGrow();
            self.parent.componentDone();
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    },
};

components.fbRemoveToken = {
    name: 'fbRemoveToken',
    job: function() {
        var self = this;
        FB.api("/me/permissions", "DELETE", function(rsp) {
            self.parent.componentDone();
        });
    }
};


components.fbLogin = {
    name: 'fbLogin',
    dependsOn: ['facebookInit'],//Dependancy on any component to run before
    provides: {fbLogin: {}},
    settings: {
        scope: null,
        forceRun: null,
        stopChainOnCancel: false,
        onCancel: function() {},
        onComplete: function(data) {}
    },
    pre: function() {
        if(this.parent.caller !== 'user' && !this.settings.forceRun) {
            this.parent.stop();
            console.warn('CHAIN WARNING: Facebook login must be triggered by user action to prevent popupblock. Its best practice to put pause before');
            return false;
        }    
    },
    job: function() {
        var self = this;
        var scope = this.settings.scope || '';
        
        FB.login(function(response) {
            if(response.authResponse) {
                _.extend(self.provides.fbLogin, response);
                self.settings.onComplete(response);
                self.parent.componentDone();
            } else {
                self.settings.onCancel();
                if(!self.settings.stopChainOnCancel) {
                    self.parent.componentDone();
                }
                if(self.parent.debug) {
                    console.log('User cancelled login or did not fully authorize.');
                }
            }
        }, {
            scope: self.settings.scope
        });
    },
    post: function() {
        //console.log('post function'); this must be documented so lets keep this comment
    }
};


components.fbUserInfo = {
    //TODO check if user is connected before geting info
    name: 'fbUserInfo',
    dependsOn: ['facebookInit', 'fbLogin'],
    provides: {fbUserInfo: {}},
    settings: {
        url: null,
        onComplete: function(data) {}
    },
    job: function() {
        var self = this;
        if(typeOf(this.settings.url) === 'function') {
            this.settings.url = this.settings.url();
        }
        var url = this.settings.url || '/me';
        FB.api(url, function(response) {
            if(!response.error) {
                _.extend(self.provides.fbUserInfo, response);
                self.settings.onComplete(response)
            }
            ////////##################            
            //TODO Give user an option if facebook info is not available
            ////////##################
            self.parent.componentDone();
        });
    }
};

components.fbFeed = {
    //TODO Vantar whait component wait method hér vegna þess að userinn getur tafið respons um X tíma
    name: 'fbFeed',
    dependsOn: ['facebookInit'],
    provides: {},
    settings: {
        params: {
            method: 'feed',
            name: null,
            caption: null,
            link: null,
            picture: null,
            description: null,
        },
        onPublished: function() {},
        onDeclined: function() {},
        forceRun: null
    },
     pre: function() {
        if(this.parent.caller !== 'user' && !this.settings.forceRun) {
            this.parent.stop();
            console.warn('CHAIN WARNING: Facebook login must be triggered by user action to prevent popupblock');
            return false;
        }    
    },
    job: function() {
        var self = this;
        var callback = function(response) {
            if (response && response.post_id) {
                self.provides.fbFeed = {hasPosted: true};
                self.settings.onPublished(response);
                self.parent.componentDone();
            } 
            else {
                self.provides.fbFeed = {hasPosted: false};
                self.settings.onDeclined(response);
                self.parent.componentDone();
            }
        };
        FB.ui(this.settings.params, callback);
    },
};

components.fbInvite = {
    //Note that the facebook app has to be in the category "Game" for invite to work (configured on developers.facebook.com)
    name: 'fbInvite',
    dependsOn : ['facebookInit'],
    provides: {},
    settings: {
        params: {
            method: 'apprequests',
            message: 'Invite message'
        },
        onInvited: null,
        onDeclined: null,
        stopChainOnCancel: false,
        forceRun: null
    },
    pre: function(){
        if(this.parent.caller !== 'user' && !this.settings.forceRun) {
            this.parent.stop();
            console.warn('CHAIN WARNING: Must be triggered by user action to prevent popupblock');
            return false;
        }
    },
    job: function(){
        var self = this;
        var callback = function(response) {
            if (response.to) {
                self.provides.fbInvite = {hasInvited: true};
                self.settings.onInvited(response);
                self.parent.componentDone();
            } 
            else {
                self.provides.fbInvite = {hasInvited: false};
                self.settings.onDeclined(response);
                if(!self.settings.stopChainOnCancel) {
                    self.parent.componentDone();
                }
                if(self.parent.debug) {
                    console.log('User did not invite anyone.');
                }
            }
        };
        FB.ui(this.settings.params, callback);
    }
};

// chain.add({
//     componentName: 'sendMail',
//     settings: {
//         apiKey: '4cV-y5Bk1O_7I8AcvyVlqQ',
//         sender: 'sender@sender.com',
//         subject: 'ÓB-vision',
//         recivers: function() {
//             return $('input[name="email"]').val();
               //return 'person1@email.com, person2@email.com';  
//         },
//         htmlBody: function() {
//             var html = $('.value').eq(0).html();
//             return html; 
//         }
//     },
// });

components.sendMail = {
    name: 'sendMail',
    provides: null,
    settings: {
        apiKey: null,
        sender: null,
        subject: null,
        reciver: null,
        htmlBody: null
    },

    job: function() {
        var self = this;
        
        var resolveRecivers = function() {
            var emailsStr = self.settings.reciver;
            console.log(emailsStr);
            var emailList = emailsStr.split(',');
            return _.map(emailList, function(item) {
                return {'email': item};
            });
        };

        var m = new mandrill.Mandrill(this.settings.apiKey);//4cV-y5Bk1O_7I8AcvyVlqQ
        var sender = this.settings.sender;
        var subject = this.settings.subject;
        var recivers = resolveRecivers();
        var htmlBody = this.settings.htmlBody;
        var isDone = false;

        var params = {
            "message": {
                "from_email": sender,
                "to": recivers,
                "subject": subject,
                "html": htmlBody,
                "autotext": true, //turns html content to plaintext if mailclient does not support html
                "track_opens": true,
                "track_clicks": true,
            }
        };

        m.messages.send(params, function(rsp) {
            for(var i = 0; i<rsp.length; i++) {
                var mailRsp = rsp[i];
                if(mailRsp.status !== 'sent') {
                    console.warn('email failed. Reject reason: '+ rsp.reject_reason);
                }
                else {
                    if(!isDone) {
                        self.parent.componentDone();
                        isDone = true;
                    }
                }
            }
        }, function(err) {
            console.warn(err);
        });
    }
};


components.collectForm = {
    /*
    DOCS
        validation is automatic. but certain names of the input elements can request certain validation rules.
        special names are listed bellow
            socialId -> checks length 10
            email
        its possible to override validation in settings.validation
    */
    name: 'collectForm',
    dependsOn: [],
    provides: {},
    settings: {
        formElement: null,
        errorClass: 'error',
        validations: {
            socialId: function(val) {
                var val = val.replace(/\s/g, '');
                val = val.split(/ /)[0].replace(/[^\d]/g, '');
                var yearBorn = val.substring(4, 6);
                var monthBorn = val.substring(2, 4);
                var dayBorn = val.substring(0, 2);
                var yearNow = parseInt(new Date().getFullYear().toString().substring(2,4));
                if (val.length < 10) {
                    return false;
                }
                if (yearBorn > 01 && yearBorn < yearNow){
                    return false;      
                }
                if (monthBorn > 12){
                    return false;
                }
                if (dayBorn > 31){
                    return false;
                }
                return true;
            },
            email: function(email){
                var re = /\S+@\S+\.\S+/;
                if(re.test(email)) {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        onError: function() {},
        onComplete: function() {}
    },
    job: function() {
        var self = this;
        var normalizeElement = function(element) {
            var type = typeOf(element);
            if(type === 'element')
                return element;
            if(element instanceof jQuery)
                return element[0];
            if(type === 'string') {
                return document.querySelector(element) || document.querySelector('#' + element) || document.querySelector('.' + element);
            }
        };
        var formElm = normalizeElement(this.settings.formElement);
        var ins = formElm.querySelectorAll('input');
        var errors = [];
        var collection = {};
        var validateKey = function(key) {
            if(!key) {
                throw 'Error in collectForm. Name attribute of input is missing or not valid';
            }
        };

        var validateValue = function(key, val, obj, isRequired) {
            if(!val && isRequired) {
                errors.push(obj);
             }
            //check for special validation and if it does not pass shout about it
            try {
                if(!self.settings.validations[key](val)) {
                    errors.push(obj);
                }
            }
            catch(err) {
                //pass
            }
        };
        var showErrors = function() {
            self.settings.onError();
            for(var i = 0; i<errors.length; i++) {
                for (key in errors[i]) {
                    var element = formElm.querySelector('input[name='+key+']');
                    element.className += ' ' + self.settings.errorClass;
                    element.addEventListener('focus', function() {
                        //Very unreadable way to remove class from classlist. but it has compatability way back.
                        this.className = this.className.replace(new RegExp('(^|\\b)' + self.settings.errorClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                    }, false);
                }
            }
        };
        for(var i = 0; i < ins.length; i++) {
            var inputObj = {}
            var isRequired = ins[i].getAttribute('required') === 'required'
            validateKey(ins[i].name);
            inputObj[ins[i].name] = ins[i].value;
            validateValue(ins[i].name, ins[i].value, inputObj, isRequired);
            collection[ins[i].name] = ins[i].value;
        }
        if(errors.length) {
             showErrors();                 
             this.parent.stop();
             return false;
        }
        this.provides.collectForm = collection;
        this.settings.onComplete(collection);
        this.parent.componentDone();
    },

};


/*
-------
 name: imagePreload
 description: Simple image preloader designed to keep running no matter what
 license: MIT-style license.

 example:
 chain.add({
 componentName: 'imagePreload',
 settings: {
 images: ['shadow.png', 'pizza1.png', 'pizza2.png', 'pizza3.png', , 'pizza4.png'],
 prefix: 'images/menu'
 each: function(counter, percent) {
 console.log(counter, percent+'%');
 }
 }

 });

 notes: prefix can optionaly have tailings slash, its added anyway
 ...
 */
components.imagePreloader = {
    name: 'imagePreloader',
    settings: {
        images: null,
        prefix: null,
        oneach: function (counter) {
        },
        onComplete: function () {
        },
    },
    job: function () {
        var self = this;
        var images = this.settings.images;
        var loadedImages = [];
        var total = images.length;
        var counter = 0;
        var percent = 0;

        for (var i = 0; i < images.length; i++) {
            try {
                var img = loadedImages[i] = document.createElement('img');
                if (this.settings.prefix) {
                    //add trailing slash if doesn't exists
                    var prefix = this.settings.prefix.replace(/\/?$/, '/');
                }
                else {
                    prefix = '';
                }
                img.onload = function () {
                    counter++;
                    percent = (counter / total) * 100;
                    if (self.parent.debug) {
                        console.log('imagePreload loading: ', this);
                    }
                    self.settings.oneach(counter, percent);
                    if (counter === total) {
                        self.settings.onComplete(loadedImages);
                        self.parent.componentDone();
                    }
                }
                img.onerror = function (err) {
                    //prevent component from stoping if last image is not found
                    counter++
                    if (total === counter) {
                        self.settings.each(counter, 100);
                        self.parent.componentDone();
                    }
                }
                img.src = prefix + images[i];
            } catch (err) {
                console.log(err);
                //pass
            }
        }
    }
};

/*
---
name: Dialog
description: Dialog based on bootstrap. Runs standalone, no js or css implementation needed

example:
.add('dialog', {
    title: 'Look ma',
    message: $('.dialog').html(),//can also just be string '<p>content</p>'
    onClose: function() {
        console.log('dialog closed');
    }
})

TODO
- Add data-close attributes
- Fine tune animations
...
*/
components.dialog = {
    name: 'dialog',
    settings: {
        title: '',
        message: '',
        size: 'normal',//large small
        onClose: function() {},
        onOpen: function() {},
    },
    job: function(){
        var self = this;
        var sizeMap = {
            'small': 'chain_modal-sm',
            'normal': '',
            'large': 'chain_modal-lg'
        }
        var sizeClass = sizeMap[this.settings.size];
        var header;
        
        if(this.settings.title) {
            header = '<div class="modal-header">' +
                        '<button type="button" class="close"><span>×</span></button>' +
                        '<h4 class="modal-title" id="myModalLabel">'+ this.settings.title +'</h4>' +
                    '</div>';
        }
        else {
            header = '<button type="button" class="close standalone"><span>×</span></button>';
        }

        var template =  '<div class="modal-backdrop"></div>' +
                        '<div class="chain_modal"><div class="chain_dialog '+ sizeClass + '">' +
                            '<div class="modal-content">' + header + 
                                '<div class="modal-body">' +
                                    '<div>' + this.settings.message + '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div></div>';

        var styles = '<style>.modal-body,.modal-title{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;line-height:1.42857143;color:#333}.chain_modal,.modal-backdrop{position:fixed;top:0;right:0;bottom:0;left:0}.modal-backdrop{z-index:1040;background-color:#000;opacity:.5}@-webkit-keyframes fadeInHalf{0%{opacity:0}100%{opacity:.5}}@keyframes fadeInHalf{0%{opacity:0}100%{opacity:.5}}.fadeInHalf{-webkit-animation-name:fadeInHalf;animation-name:fadeInHalf}.fadeInDownBig,.fadeInHalf{-webkit-animation-fill-mode:both;-webkit-animation-duration:.5s}.fadeInDownBig,.fadeInHalf,.fadeOutHalf{animation-duration:.5s;animation-fill-mode:both}@-webkit-keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-500px,0);transform:translate3d(0,-500px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-500px,0);transform:translate3d(0,-500px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDownBig{-webkit-animation-name:fadeInDownBig;animation-name:fadeInDownBig}@-webkit-keyframes fadeOutHalf{0%{opacity:.5}100%{opacity:0}}@keyframes fadeOutHalf{0%{opacity:.5}100%{opacity:0}}.fadeOutHalf{-webkit-animation-name:fadeOutHalf;animation-name:fadeOutHalf}.fadeOutDownBig,.fadeOutHalf{-webkit-animation-fill-mode:both;-webkit-animation-duration:.5s}@-webkit-keyframes fadeOutDownBig{0%{opacity:1;-webkit-transform:none;transform:none}100%{opacity:0;-webkit-transform:translate3d(0,-500px,0);transform:translate3d(0,-500px,0)}}@keyframes fadeOutDownBig{0%{opacity:1;-webkit-transform:none;transform:none}100%{opacity:0;-webkit-transform:translate3d(0,-500px,0);transform:translate3d(0,-500px,0)}}.fadeOutDownBig{-webkit-animation-name:fadeOutDownBig;animation-name:fadeOutDownBig;-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}.chain_modal{z-index:1050;overflow:hidden;-webkit-overflow-scrolling:touch;outline:0}.chain_dialog{position:relative;width:auto;margin:10px}.modal-header .close{margin-top:-2px;position:static}.close.standalone{position:absolute;right:3px;top:-3px;z-index:1}.modal-title{margin:0;font-size:18px;font-weight:500}button.close{-webkit-appearance:none;padding:0;cursor:pointer;background:0 0;border:0}.modal-content{position:relative;background-color:#fff;background-clip:padding-box;border:1px solid #999;border:1px solid rgba(0,0,0,.2);border-radius:2px;outline:0;box-shadow:0 3px 9px rgba(0,0,0,.5)}.modal-header{min-height:16.43px;padding:15px;border-bottom:1px solid #e5e5e5}.modal-body{position:relative;padding:15px;font-size:14px}.close{float:right;font-size:21px;font-weight:700;line-height:1;color:#000;text-shadow:0 1px 0 #fff;opacity:.2}@media (min-width:768px){.chain_dialog{width:600px;margin:30px auto}.modal-content{box-shadow:0 5px 15px rgba(0,0,0,.5)}.chain_modal-sm{width:300px}}@media (min-width:992px){.chain_modal-lg{width:900px}}</style>';
        var close = function() {
            $('.modal-backdrop').addClass('fadeOutHalf');
            $('.chain_dialog').addClass('fadeOutDownBig');
            $('.modal-backdrop, .chain_modal').css({'pointer-events': 'none'});
            setTimeout(function() {
                $elements.remove();
                $styles.remove();
                self.settings.onClose();
            }, 500);
        }
        var stylesCompiler =  _.template(styles);
        var $styles = $(stylesCompiler());
        $('body').append($styles);

        var compiler = _.template(template);
        var $elements = $(compiler());
        setTimeout(function() {
            //Just in case we are in a facebook iframe and FB is awailable as global
            try {
                FB.Canvas.scrollTo(0, 300);
            }
            catch(e) {
                    //pass
            }
            self.settings.onOpen();
        })
        
        $elements.find('.close').on('click', function() {
            close();
        });

        $(document).on('click', function(e) {
            if($(e.target).hasClass('chain_modal')) {
                close();
            }
        });
        $('body').append($elements);
        //animate dialog in
        $('.modal-backdrop').addClass('fadeInHalf').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).removeClass('fadeInHalf');
        });

        $('.chain_dialog').addClass('fadeInDownBig').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).removeClass('fadeInDownBig');
        });

        this.parent.componentDone();
    }
};

//simple solution to close dialogs in the chain
components.dialogsClose = {
    name: 'dialogsClose',
    job: function() {
        $('.chain_modal').trigger('click');
        this.parent.componentDone();
    }
};

//jQuery ajax wrappers
/*
---
name: get, post
description: Components for making json requests via jquery

example:
.add('get', {
    url: 'http://apis.is/car',
    data: {'number': 'aa123'},
    onComplete: function(rsp) {
        console.log(rsp);
    }
})
.par('get', {
    url: 'http://apis.is/car',
    data: {'number': 'bb123'},
    onComplete: function(rsp) {
        console.log(rsp);
    }
})
.par('get', {
    url: 'http://apis.is/car',
    data: {'number': 'dd123'},
    onComplete: function(rsp) {
        console.log(rsp);
    }
})

TODO
- Add data-close attributes
- Fine tune animations
...
*/
components.get = {
    name: 'get',
    requirements: [],
    provides: {},
    settings: {
        url: null,
        data: null,
        onComplete: function(response) {}
    },
    job: function() {
        var self = this;
        $.ajax({
            'url': self.settings.url,
            'type': 'GET',
            'dataType': 'json',
            'data': self.settings.data,
            'success': function(response) {
                self.settings.onComplete(response);
                self.parent.componentDone();
            }
        });
    }
};

components.post = {
    name: 'post',
    requirements: [],
    provides: {},
    settings: {
        url: null,
        data: null,
        onComplete: function(response) {}
    },
    job: function() {
        var self = this;

        $.ajax({
            'url': self.settings.url,
            'type': 'POST',
            'dataType': 'json',
            'data': self.settings.data,
            'success': function(response) {
                self.settings.onComplete(response);
                self.parent.componentDone();
            }
        });
    }
};

components.postRaw = {
    name: 'postRaw',
    requirements: [],
    provides: {},
    settings: {
        url: null,
        data: null,
        onComplete: function(response) {}
    },
    job: function() {
        var self = this;

        $.ajax({
            'url': self.settings.url,
            'type': 'POST',
            'dataType': 'text',
            'contentType': 'application/json; charset=utf-8',
            'data': JSON.stringify(self.settings.data,),
            'success': function(response) {
                self.settings.onComplete(response);
                self.parent.componentDone();
            }
        });
    }
};



