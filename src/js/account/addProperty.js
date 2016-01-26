class Tour {
    constructor() {
        this.content = {html:''};
        this.tmpl = `<div class="popover tour-ease" style="width: 426px; max-width: 426px;">
                        <div class="arrow"></div>
                        <h3 class="popover-title">Popover top</h3>
                        <div class="popover-content" rv-html="html">
                            <p>Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>
                        </div>
                        <div class="popover-content">
                            <button class="btn btn-primary" type="button">Quit tour</button>
                            <button class="btn btn-primary" type="button">Next</button>
                        </div>
                    </div>`;
        this.dialog = $(this.tmpl);
        this.dialog.appendTo($('body'));
        rivets.bind(this.dialog, this.content);

        var chain = window.chain =  new ChainWork()
            .add(()=> {
                this.setArrow('right');
                this.setContent('foo bar');
                console.log('class', this.content);
                this.dialog.position({
                    my: 'left center',
                    at: 'right center',
                    of: $('.radioBox.number').eq(0),
                    collision: 'fit',
                    offset: "0px 0px"
                }).show();

            })
            .add('pause', {delay: 1000})
            .add(()=> {
                this.setArrow('left');
                this.content.html = '<input type="text">';
                this.dialog.position({
                    my: 'left center',
                    at: 'right center',
                    of: $('.radioBox.number').eq(1),
                    collision: 'fit',
                    offset: "0px 0px"
                });
            })
            .add('pause', {delay: 1000})
            .add(()=> {
                this.setArrow('bottom');
                this.setContent('<input type="text" placeholder="your property">');
                this.dialog.position({
                    my: 'center top',
                    at: 'center bottom',
                    of: $('.radioBox').eq(4),
                    collision: 'fit',
                    offset: "0px 0px"
                });
            })
        chain.play();
    }

    setArrow(to) { // top bottom left right
        this.dialog.removeClass('top');
        this.dialog.removeClass('bottom');
        this.dialog.removeClass('left');
        this.dialog.removeClass('right');
        this.dialog.addClass(to)
    }

    setContent(strTmpl) {
        this.content.html = strTmpl;
    }
}


class AddProperyModel {

    constructor() {

        console.log('addProperty');
        this.tour = window.tour =  new Tour();

    }

    setBindings() {


    }

}

new AddProperyModel();