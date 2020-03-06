var view = {};

view.instance   = null;
view.inited     = false;
view.element    = null;

view.init = function () {
    var self = this;

    if ( !this.inited ) {
        this.element    = document.querySelector('#picviewer');
        this.element.addEventListener('hidden', function () {
            self.instance.destroy();
            self.inited = false;
        });

        this.instance   = new Viewer( this.element, {
            movable: false
        });

        this.inited = true;
    }
};

view.show = function (src) {
    this.init();

    this.element.src = src;
    this.instance.show();
};
