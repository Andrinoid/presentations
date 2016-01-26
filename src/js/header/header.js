import Popover from '../components/popover';

var inline = GLOBAL.inline;

class HeaderModel {

    constructor() {
        new Popover($('.header #userPopover'), $('.header .userTrigger'));
        new Popover($('.header #messagePopover'), $('.header .messageTrigger'));
        new Popover($('.header #notificationPopover'), $('.header .notificationTrigger'));
        new Popover($('.header #loginPopover'), $('.header .loginTrigger'));

        $('#loginModal').on('shown.bs.modal', function () {
          $('#inputEmail').focus()
        });

        $('#loginForm').submit(function(e) {
            e.preventDefault();

            var payload = {
                email: e.target.email.value,
                password: e.target.password.value
            };
            var future = inline.body('/ajax/login/', payload);
            future.apply(function(data) {
                location.reload();
            });
            future.catch(function(data) {
                console.log(data);
            });
        });
        
    }
}

new HeaderModel();

