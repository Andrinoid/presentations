var inline = GLOBAL.inline;
import bindings from './../bindings';

class FrontpageModel {

    constructor() {

        // initial bind. data from global
        let template = $('#frontpageTmpl');
        rivets.bind(template, {'promotions':GLOBAL.promotions});
        template.removeClass('hide-bindings'); //shitty hack to stop the rv tag blinking

    }

}

new FrontpageModel();