var rtn = _.extend(rivets.binders, {

    bgimage: function (el, value) {
        $(el).css('background-image', 'url(' + value + ')');
    },

    addclass: function (el, value) {
        if (el.addedClass) {
            $(el).removeClass(el.addedClass);
            delete el.addedClass;
        }

        if (value) {
            $(el).addClass(value);
            el.addedClass = value;
        }
    },

    src: function (el, value) {
        console.log(value)
        el.src = value;
    },

    href: function (el, value) {
        el.href = value;
    },
    //custom
    mastersrc: function (el, value) {
        //get the element index because rivet doesn't return it
        $('document').ready(function () {
            setTimeout(function () {
                let index = $(el).parent().parent().index();
                el.src = '/slides/masters/#/' + index;
            }, 1000);

        });

    },

});

rivets.binders.toggle = {
    bind: function (el) {
        adapter = this.config.adapters[this.key.interface]
        model = this.model
        keypath = this.keypath

        this.callback = function () {
            value = adapter.read(model, keypath)
            adapter.publish(model, keypath, !value)
        }

        $(el).on('click', this.callback)
    },
    unbind: function (el) {
        $(el).off('click', this.callback)
    },

    routine: function (el, value) {
        $(el)[value ? 'addClass' : 'removeClass']('enabled')
    }
};


export default rtn;