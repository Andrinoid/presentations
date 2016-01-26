var inline = GLOBAL.inline;
import bindings from './../bindings';
import TextEdit from './../components/textEdit';
var connectionToFrame = false;
/*
 * iframe
 * image
 * videobg
 * duplicate
 * */

GLOBAL.debug = true;

class AddContent {

    constructor() {
        this.index = null;
        this.dom = null;
        this.elmid = 0;
        this.focusedElm = null;

    }

    init(data) {//init is trigger when reveal.js is ready.
        //get the iframe dom
        this.dom = $('#promo-iframe').contents();
        let editems = this.dom.find('.editem');

        //unfocus elements on outside click
        this.dom.on('click', (e)=> {
            if (!this.focusedElm) return;
            if (!$(e.target).is(this.focusedElm) && !$(e.target).parents('.editem').is(this.focusedElm)) {
                this.unfocusElm();
                return false;
            }
            //pass the focused element the e.target
        });
        this.textedit = new TextEdit(this.dom);
        this.elmEvents(editems);
        this.setIndex(data);
    }

    setIndex(data) {
        //keeps track of the current slide
        this.index = data.state.indexh;
    }

    setUid() {
        return 'id-' + this.elmid++;
    }

    getParent() {
        //gets the section for the current slide the content parent
        return this.dom.find('.slides > section').eq(this.index);
    }

    getHtml() {
        let parent = this.getParent().clone();
        let items = parent.find('.editem');
        items.removeAttr('id contenteditable')
            .removeClass('ui-draggable ui-draggable-handle focused ui-draggable-disabled');
        return parent.html();
    }

    unfocusElm() {
        let elm = $(this.focusedElm);
        elm.removeClass('focused');
        elm.removeAttr('contenteditable');
        try {
            elm.resizable("destroy");
            elm.draggable('enable');
            this.textedit.remove(elm);
        } catch (e) {
            if(GLOBAL.debug)
                console.log(e);
        }
    }

    focus(elm) {
        //this.unfocusElm();
        this.focusedElm = elm;
        this.dom.find('.focused').removeClass('focused');
        $(elm).addClass('focused');
        $(elm).resizable({handles: "e, w"});
    }

    elmEvents(elm) {
        elm.each((i, item)=> {
            var el = $(item);
            el.draggable({
                start: (e)=> {
                    this.focus(e.target);
                },
                stop: (e)=> {
                    //TODO save
                }
            });

            el.on('click', (e)=> {
                if(!$(e.target).hasClass('editem'))
                    return;
                this.focus(e.target);
            });

            el.on('dblclick', (e)=> {
                try {
                    $(e.target).draggable('disable');
                    $(e.target).attr('contenteditable', true);
                    this.textedit.target(e.target);
                } catch(err) {
                    if(GLOBAL.debug)
                        console.log(err);
                }
            });
        });

    }

    text() {
        let elm = document.createElement('div');
        elm.innerText = 'Text';
        elm.id = this.setUid();
        $(elm).attr('class', 'text editem');
        $(elm).css({
            'position': 'absolute',
            'width': '240px',
            'left': '372.953px',
            'top': '8.00407px'
        });
        this.focusedElm = elm;
        this.getParent().append($(elm));
        let bindedEl = this.dom.find('#' + elm.id);
        this.elmEvents(bindedEl);
        this.focus(bindedEl);
    }


}


class EditorModel {

    constructor() {
        this.currentSlide = null;

        _.bindAll(this, 'editSlide', 'addSlide', 'showTool', 'removeSlide', 'pinAsMaster', 'addText', 'saveContent');
        let template = $('#editorTmpl');
        this.data = GLOBAL;
        rivets.bind(template, {app: this});
        template.removeClass('hide-bindings'); //shitty hack to stop the rv tag blinking

        /*** addcontent is bridge to the child frame ***/
        this.addcontent = new AddContent();

        this.domEvents();
        setTimeout(()=> {
            //this.autosave();
        }, 5000);

    }

    autosave() {
        this.saveContent();
        setTimeout(()=> {
            this.autosave();
        }, 8000);
    }

    domEvents() {

        //Listen for events from child frame
        window.addEventListener("message", (event) => {
            let data = JSON.parse(event.data);
            let eventName = data.eventName;

            if (eventName === 'ready')
                this.addcontent.init(data);
            if (eventName === 'slidechanged')
                this.addcontent.setIndex(data);
        }, false);

        $('[data-toggle="tooltip"]').tooltip();//initialize bootstrap tooltips

        $('.slides').sortable({
            start: (event, ui) => {
                ui.item.startPos = ui.item.index();
            },
            distance: 5,
            axis: 'y',
            stop: (event, ui) => {
                let endPos = ui.item.index();
                let startPos = ui.item.startPos;
                let movedItem = this.data.slides[ui.item.startPos];

                $(".slides").sortable("cancel");

                // Remove the view from its original location
                this.data.slides.splice(startPos, 1);

                // Add it to its new location
                this.data.slides.splice(endPos, 0, movedItem);

                // show the order of the model
                let list = [];
                for (var i = 0; i < this.data.slides.length; i++) {
                    list.push([this.data.slides[i].id, i]);
                }
                let data = {'slideOrder': list};
                //TODO move this to a mehtod
                $.ajax({
                    'url': '/api/updateIndexList',
                    'type': 'POST',
                    'dataType': 'text',
                    'contentType': 'application/json; charset=utf-8',
                    'data': JSON.stringify(data),

                    'error': function (response) {
                        alert('List did not update');//TODO make ui friendly warning
                    }
                });

            }
        }).disableSelection();
        $('.slides .slide').eq(0).trigger('click');
    }

    editSlide(e, data) {
        _.each(this.data.slides, function (obj) {// remove focus of all other slides
            obj.focus = false;
        });

        data.slide.focus = true;
        this.currentSlide = data.slide;
        document.querySelector('iframe').src = this.data.promotion.frameLink + '/#/' + data.slide.index;
    }


    //TODO finna nöfn á neðangreid method
    //setja active classa á tólið sem er valið
    //gera kleyft að loka tóli

    setMode(mode) {
        //set mode class on body to allow all controlls to act on it
        $('body').addClass('mode-tools-' + mode);
        let parentElm = $('#left-tools');
        parentElm.show();
        parentElm.find('.main').hide();
        parentElm.find('.' + mode).show();
    }

    showTool(e) {
        let triggerElm = e.currentTarget;
        let tooltype = triggerElm.getAttribute('data-tooltype');
        $('.tool-controller .trigger').removeClass('active');
        $(triggerElm).addClass('active');

        this.setMode(tooltype);
    }

    closeTool() {
        let parentElm = $('#left-tools');
        $('.tool-controller .trigger').removeClass('active');
        $('body').removeClass(function (index, css) {
            return (css.match(/(^|\s)mode-tools-\S+/g) || []).join(' ');
        });
        parentElm.hide();
        parentElm.find('.main').hide();
    }

    addSlide(e, data) {
        $.get('/api/addSlide/', {'promoId': this.data.promotion.id, masterSlideId: data.master.id}, (rsp) => {
            let slideIndex = this.data.slides.push(rsp);
            let newslide = this.data.slides[slideIndex - 1];

            //reload iframe to rebuild html and navigate to next slide or the new slide
            document.getElementById('promo-iframe').contentDocument.location.reload(true);
            setTimeout(()=> {
                this.editSlide({}, {'slide': newslide});
                $('#addSlideModal').modal('hide');
            }, 500);
        });
    }

    pinAsMaster() {
        $.get('/api/setAsMaster', {slideID: this.currentSlide.id}, (rsp) => {
            this.data.slides = rsp;
            this.currentSlide = rsp[this.currentSlide.index];
        });
    }

    removeSlide() {
        alert('Are you sure?');
        let prevIndex = this.currentSlide.index - 1;
        $.get('/api/removeSlide', {slideID: this.currentSlide.id}, (rsp) => {
            this.data.slides = rsp;
            this.editSlide({}, {'slide': this.data.slides[prevIndex]});
        });

    }

    saveContent() {
        if (GLOBAL.debug) console.log('auto save');
        let html = this.addcontent.getHtml();
        let data = {html: html, slideID: this.currentSlide.id};
        $.ajax({
            'url': '/api/updateHtml/',
            'type': 'POST',
            'dataType': 'text',
            'contentType': 'application/json; charset=utf-8',
            'data': JSON.stringify(data),
            'error': function (response) {
                console.log('content did not update', response);//TODO make ui friendly warning
            },
            success: function (rsp) {
                console.log(rsp)
            }
        });
    }

    addText() {
        this.addcontent.text();
    }

}

window.editor = new EditorModel();
