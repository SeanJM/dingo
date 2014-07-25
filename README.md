# Event Delegation
## Requirements
* jQuery

## Include it
Simply include the file in your html ensuring jQuery is loaded first

In your JavaScript file, run the initialization command

    dingo.init();

## Attaching events to the DOM

### HTML

    <div class="btn" data-dingo="clickMe">Click ME</div>

### JavaScript
    
    dingo.set('click','clickMe',function (options) {

    });

### 'options' passed arguments
    
    options.el    = The active jQuery element
    options.event = The current event

### Passing custom arguments to 'options'

    <div class="btn" data-dingo="clickMe{which:button;another:one}">Click ME</div>

### Result on 'options'
    
    options.el      = The active jQuery element
    options.event   = The current event
    options.which   = 'button'
    options.another = 'one'

### Multiple events

#### HTML

    <div class="btn" data-dingo="clickMe clickThere clickHere">Click ME</div>

#### JavaScript

    dingo.set('click','clickMe',function (options) {});
    dingo.set('click','clickThere',function (options) {});
    dingo.set('click','clickHere',function (options) {});

#### Multiple Events

    dingo.set('click,touchend','clickMe',function (options) {});
    dingo.set('click,keyup','clickThere',function (options) {});
    dingo.set('click,keydown','clickHere',function (options) {});

#### Sub Dingos

This is for when you want to attach more that one function to a dingo event. For example, you have `<body data-dingo="close"></body>` -- and you want to have a function that closes popup windows, a function that closes menus and a function that does something else and you want to keep them in seperate files for organization.

    dingo.set('click','close','nav',function () {});
    dingo.set('click','close','menu',function () {});

### Multiple events with arguments

    <div class="btn" data-dingo="clickMe{this:that} clickThere{that:there} clickHere{there:this}">Click ME</div>

### Notes

I created this light weight solution and I use it on everything I work on.
