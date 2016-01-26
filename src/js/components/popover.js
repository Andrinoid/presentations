class Popover {

    constructor(elm, trigger, options) {
        var self = this;
        this.options = {

        };
        _.extend(this.options, options);
        this.trigger = trigger;
        this.dialog = elm;
        this.trigger.on('click', function() {
            self.open();
        });
        this.state = 'closed';
    }

    open() {
        window.popup = this.dialog;
        var self = this;
        if(this.state === 'open') {
            self.close();
            return;
        }
        this.dialog.position({
            my: 'left top',
            at: 'left bottom+8px',
            of:  this.trigger,
            collision: 'fit',
            offset: "30px 30px"
        }).addClass('open');
        this.closeOutside();
        this.state = 'open';
    }

    close() {
        var self = this;
        this.dialog.removeClass('open');
        this.dialog.attr('style', '');
        setTimeout(function () {
            $('body').off('click', self.closeEvent);
        });
        self.state = 'closed';
    }

    closeOutside() {
        var self = this;
        this.closeEvent = function(e) {
            if(self.dialog.hasClass('open')
                && !$(e.target).is('.popOver')
                && !$(e.target).closest('.popOver').length
                && !$(e.target).is(self.trigger)
            ) {
                e.preventDefault();
                self.close();
            }
        }
        $('body').on('click', function(e) {
            self.closeEvent(e);
        });
    }

    prototype() {
        var self = this;
        this.dialog.removeClass('open');
        this.dialog.attr('style', '');
        setTimeout(function () {
            $('body').off('click', self.closeEvent);
        });
        self.state = 'closed';
    }
}

export default Popover;
