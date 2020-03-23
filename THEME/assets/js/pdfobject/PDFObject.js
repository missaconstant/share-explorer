var pdfobject = {

    inited: false,

    init: function () {
        var self = this;

        if ( this.inited ) return;

        // parent element
        var element = document.createElement('div');
            element.id = 'pdf-object-container';
            element.style.position  = 'fixed';
            element.style.top       = 0;
            element.style.left      = 0;
            element.style.height    = '100%';
            element.style.width     = '100%';
            element.style.zIndex    = 7;
            element.style.background= 'rgba(0, 0, 0, 0.5)';

        // adding pdf body
        element.innerHTML = '<div id="pdf-object-wrap" style="position:absolute;top:0;bottom:0;left:0;right:0;">' +
                            '</div>';

        // close element
        var closebtn = document.createElement('span');
            closebtn.id                 = 'pdf-object-close';
            closebtn.style.position     = 'absolute';
            closebtn.style.top          = '20px';
            closebtn.style.right        = '20px';
            closebtn.style.zIndex       = '100';
            closebtn.style.height       = '30px';
            closebtn.style.width        = '30px';
            closebtn.style.textAlign    = 'center';
            closebtn.style.lineHeight   = '30px';
            closebtn.style.fontSize     = '13px';
            closebtn.style.background   = '#d23e3e';
            closebtn.style.borderRadius = '50%';
            closebtn.style.cursor       = 'pointer';
            closebtn.style.color        = 'white';
            closebtn.innerHTML          = '&times;';

            // bind click handler on close btn
            closebtn.onclick = function () {
                element.parentNode.removeChild( element );
                self.inited = false;
            };

        element.appendChild( closebtn );
        document.body.appendChild( element );

        this.inited = true;
    },

    open: function (url) {
        // init the thing
        this.init();

        // then trigger PDF
        PDFObject.embed(url, "#pdf-object-wrap");
    },

};
