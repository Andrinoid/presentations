class TextEdit {

    constructor(root) {
        _.bindAll(this, 'plus', 'minus', 'bold');

        this.root = root.find('body');

        let icons = `
        <div id="svg-editor-icons">
            <svg>
                <symbol id="icon-plus" viewBox="0 0 1024 1024">
                    <title>plus</title>
                    <path class="path1" d="M992 384h-352v-352c0-17.672-14.328-32-32-32h-192c-17.672 0-32 14.328-32 32v352h-352c-17.672 0-32 14.328-32 32v192c0 17.672 14.328 32 32 32h352v352c0 17.672 14.328 32 32 32h192c17.672 0 32-14.328 32-32v-352h352c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32z"></path>
                </symbol>

                <symbol id="icon-minus" viewBox="0 0 1024 1024">
                    <title>minus</title>
                    <path class="path1" d="M0 416v192c0 17.672 14.328 32 32 32h960c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32h-960c-17.672 0-32 14.328-32 32z"></path>
                </symbol>
                <symbol id="icon-bold" viewBox="0 0 1024 1024">
                    <title>bold</title>
                    <path class="path1" d="M707.88 484.652c37.498-44.542 60.12-102.008 60.12-164.652 0-141.16-114.842-256-256-256h-320v896h384c141.158 0 256-114.842 256-256 0-92.956-49.798-174.496-124.12-219.348zM384 192h101.5c55.968 0 101.5 57.42 101.5 128s-45.532 128-101.5 128h-101.5v-256zM543 832h-159v-256h159c58.45 0 106 57.42 106 128s-47.55 128-106 128z"></path>
                </symbol>
            </svg>
        </div>`;
        let $icons = $(icons);
        this.root.append($icons);

        let tmpl = `
        <div class="texteditorBox" contenteditable="false">
            <style scoped>
                .texteditorBox {
                  position: absolute;
                  top: -34px;
                  background: #4c4c4c;
                  min-width: 129px;
                  text-align: left;
                  height: 33px;
                  overflow: hidden;
                  font-size: 22px !important;
                  border: solid 1px #292929;
                  border-radius: 2px;;
                }
                .editBtn {
                position: relative;
                    display: inline-block;
                    height: 33px;
                    width: 39px;
                    text-align: center;
                    border-right: solid 1px #252525 !important;
                    cursor: pointer;
                     -webkit-user-select: none;
                      -moz-user-select: none;
                      -ms-user-select: none;
                      user-select: none;
                }
                .editBtn .icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    margin-left: -5px;
                    margin-top: -5px;
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    fill: #d2d2d2;
                }
            </style>
            <div class="editBtn" data-editor="bold"><svg class="icon icon-bold"><use xlink:href="#icon-bold"></use></svg></div>
            <div class="editBtn" data-editor="plus"><svg class="icon icon-plus"><use xlink:href="#icon-plus"></use></svg></div>
            <div class="editBtn" data-editor="minus"><svg class="icon icon-minus"><use xlink:href="#icon-minus"></use></svg></div>
        </div>`;

        let editorCompiler = _.template(tmpl);
        this.$editorUi = $(editorCompiler());
    }

    bindEvents() {
        var controls = this.$editorUi.find('[data-editor]');
        controls.each((i, el)=> {
            let event = $(el).data('editor');
            $(el).on('click', this[event]);
        });
    }

    bold() {
        let state = $(this.elm).css('font-weight') === 'bold' ? 'normal' : 'bold';
        $(this.elm).css('font-weight', state);
    }

    plus() {
        let fontSize = parseInt($(this.elm).css('font-size'));
        fontSize += 10;
        $(this.elm).css('font-size', fontSize);
    }

    minus() {
        let fontSize = parseInt($(this.elm).css('font-size'));
        fontSize -= 10;
        $(this.elm).css('font-size', fontSize);
    }

    target(elm) {
        this.elm = elm;
        $(this.elm).append(this.$editorUi);
        this.bindEvents();
    }

    remove(elm) {
        this.elm = elm;
        $(this.elm).find('.texteditorBox').remove();
    }


}

export default TextEdit;
