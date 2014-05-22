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
    
    dingo.click.clickMe = function (options) {

    }

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

### Notes

I created this light weight solution and I use it on everything I work on.