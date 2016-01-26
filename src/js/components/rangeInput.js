class RangeInput {
    /*
     * RangeInput is responsible for showing choosen dates on the front page
     * It depends on slightly modified version of daterangepicker. http://www.daterangepicker.com
     * */
    constructor() {
        //elements used in class
        this.rangeInputsElm = $('.dateInputs');
        this.checkIn = {elm: $('#checkIn')};
        this.checkOut = {elm: $('#checkOut')};
        this.introLabelElm = $('.introLabel');
        this.checkIn.orginalPos = null;
        this.checkOut.orginalPos = null;
        //set date range picker
        //we are using our modified version of http://www.daterangepicker.com
        this.rangeInputsElm.daterangepicker({
            autoApply: true,
            parentEl: $('.calendar-section .w-container'),
            showArrow: false,
        });

        //set events
        this.rangeInputsElm.on('start.daterangepicker', (e, picker) => {
            this.onDatePick(picker);
        });
        this.rangeInputsElm.on('apply.daterangepicker', (e, picker) => {
            let dateRange = {
                checkIn: picker.startDate,
                checkOut: picker.endDate
            };
            this.searchByDates(dateRange);
        });
    }

    searchByDates(dateRange) {
        //override this method in your instace
    }

    onDatePick(picker) {
        if(!this.checkIn.orginalPos) {
            this.checkIn.orginalPos = this.getPositionOf(this.checkIn.elm);
            this.checkOut.orginalPos = this.getPositionOf(this.checkOut.elm);
        }
        //is it checkIn or checkOut?
        let isCheckin = picker.endDate ? false : true;
        let elmObj = isCheckin ? this.checkIn : this.checkOut;
        let date = isCheckin ? picker.startDate.format('YYYY-MM-DD') : picker.endDate.format('YYYY-MM-DD');

        elmObj.elm.text(date);

        this.introLabelElm.hide();
        let x = -( elmObj.orginalPos.left - picker.mousePos.left + 20) + 'px';
        let y = -( elmObj.orginalPos.top - picker.mousePos.top + 20) + 'px';

        elmObj.elm.show();
        elmObj.elm.css({
            'opacity': '0',
            'transform': 'translate(' + x + ', ' + y + ')',
            '-webkit-transition': 'all 0.3s cubic-bezier(0.42, 0, 0.27, 1.28)',
            'transition': 'all 0.4s cubic-bezier(0.42, 0, 0.27, 1.28)'
        });

        setTimeout(() => {// Just the usual hack to force animation to the bottom of the stack
            elmObj.elm.css({
                'transform': 'translate(0px, 0px)',
                'opacity': '1'
            });
        });
    }

    updatePosition() {

    }

    getPositionOf(elm) {
        let introLabelElm = this.introLabelElm;
        let offset;

        introLabelElm.hide();
        elm.show();
        offset = elm.offset();
        elm.hide();
        introLabelElm.show();

        return offset;
    }
}

export default RangeInput;
