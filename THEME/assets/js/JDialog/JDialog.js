/**
* @class JDialog
* @author Atom{x}
* @license MIT
*/
function JDialog(options) {
    JDialog._instances += 1;

    // set instance id
    this.instanceid = JDialog._instances;

    // element: jd-box
    this.element    = null;

    // instance options setting
    this.setOptions( options );

    // creating template
    this.mountTemplate();

    // initialization
    this.init();
};

/**
* @var _instantces
*/
JDialog._instances = 0;


/**
* @var _nextZindex
*/
JDialog._nextZindex = 20;


/**
* @method setOptions
*/
JDialog.prototype.setOptions = function (options) {
    // are options setted
    options         = options || {};

    this.options    = {
        inputs  : options.inputs || [],
        title   : options.title || '',
        message : options.message || '',
        okBtnTxt: options.okBtnText || 'CONFIRMER',
        noBtnTxt: options.cancelBtnText || '',
        backdrop: options.backclickclose || true
    };
};


/**
* @method getTemplate
*/
JDialog.prototype.getTemplate = function (blueprint) {
    return  '' +
    '<div class="jd-box" id="jdbox-'+ this.instanceid +'">' +
        '<div class="jd-overlay"></div>' +
        '<div class="jd-conten-box">' +
            '<div class="jd-content">' +
                '<h3 class="jd-title">'+ blueprint.title +'</h3>' +
                '<p class="jd-message">'+ blueprint.message +'</p>' +
                '<div class="jd-form">' +
                '</div>' +
                '<div class="jd-footer">' +
                    '<button class="jd-cancel-btn">ANNULER</button>' +
                    '<button class="jd-confirm-btn">CONFIRMER</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
};


/**
* @method mountTemplate
*/
JDialog.prototype.mountTemplate = function () {
    var temp = this.getTemplate( this.options );

    // add template to body
    document.body.innerHTML += temp;
};


/**
* @method init
*/
JDialog.prototype.init = function (options) {
    // update settings if provided
    if ( options ) {
        this.setOptions(options);
    }

    var self = this;

    // get the element
    this.element = document.querySelector('#jdbox-' + this.instanceid);

    // title and message
    this.element.querySelector('.jd-title').innerHTML = this.options.title;
    this.element.querySelector('.jd-message').innerHTML = this.options.message;

    // style btns & toggle cancel btn if needed
    this.element.querySelector('.jd-cancel-btn').style.display = this.options.noBtnTxt.length ? 'inline-block' : 'none';
    this.element.querySelector('.jd-cancel-btn').textContent = this.options.noBtnTxt;
    this.element.querySelector('.jd-confirm-btn').textContent = this.options.okBtnTxt;

    // bind confirm button events
    this.element.querySelector('.jd-confirm-btn').onclick = function () {
        // execute on confirm handler
        if ( self.options.onConfirm ) self.options.onConfirm( self.getFormVals() );

        // hide jbox instance
        self.hide();
    };

    // bind cancel button events
    this.element.querySelector('.jd-cancel-btn').onclick = function () {
        // execute on confirm handler
        if ( self.options.onCancel ) self.options.onCancel();

        // hide jbox instance
        self.hide();
    };

    // bind backdrop event
    this.element.querySelector('.jd-overlay').onclick = function () {
        if ( self.options.backdrop ) {
            self.hide();
        }
    };

    // if inputs
    if ( this.options.inputs.length ) {
        var htmls = this.generateFields( this.options.inputs );

        this.element.querySelector('.jd-form').innerHTML = htmls.join('');
    }
    else {
        this.element.querySelector('.jd-form').innerHTML = '';
    }
};


/**
* @method show
*/
JDialog.prototype.show = function (options) {
    // if asked, reinitialize instance
    if ( options ) {
        this.init(options);
    }

    this.element.classList.add('shown');
    this.element.style.zIndex = JDialog._nextZindex;

    // focus on the first input if text type
    if ( this.options.inputs.length && ['text', 'email', 'password'].indexOf( this.options.inputs[0].type ) ) {
        this.element.querySelector('.jd-form input[name="'+ this.options.inputs[0].name +'"]').focus();
    }

    // increment _nextZindex
    JDialog._nextZindex++;

    return this;
};


/**
* @method show
*/
JDialog.prototype.hide = function () {
    this.element.classList.remove('shown');
    this.element.style.zIndex = '-100';

    // decrement _nextZindex
    JDialog._nextZindex--;
};


/**
* @method onConfirm
*/
JDialog.prototype.onConfirm = function (handle) {
    // get handler if defined
    if (handle) this.options.onConfirm = handle;

    return this;
};


/**
* @method onConfirm
*/
JDialog.prototype.onCancel = function (handle) {
    // get handler if defined
    if (handle) this.options.onCancel = handle;

    return this;
};


/**
* @method getFormVals
*/
JDialog.prototype.getFormVals = function () {
    var vals = {};

    for ( var x in this.options.inputs ) {
        var field = this.options.inputs[ x ];

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
                var value = this.element.querySelector('.jd-form input[name="'+ field.name +'"]').value;
                vals[ field.name ] = value;
                break;
        }
    }

    return vals;
};


/**
* @method generateFields
*/
JDialog.prototype.generateFields = function (fields) {
    var self    = this;
    var htmls   = [];

    for (var x in fields) {
        var html    = '';
        var field   = fields[x];

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
                html = '' +
                    '<div class="jd-input-group">' +
                        '<input type="'+ field.type +'" name="'+ field.name +'" placeholder="'+ (field.placeholder || '') +'" value="'+ (field.value || '') +'" autocomplete="off">' +
                    '</div>'
                break;
        }

        htmls.push( html );
    }

    return htmls;
};
