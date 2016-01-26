import bindings from './../bindings';

var inline = new Inline({debug: true});

class AccountModel {

    constructor() {
        inline.get('/ajax/account/places/').apply(function(data) {
            rivets.bind($('#accountTmpl'), {properties: data});
        });

    }
}

new AccountModel();