# indented-block-highlighting README

Highlights the intented area that contains the cursor.

## Features

Highlight the selected block automatically like so:

![Color is 200 red, 100 green, 255 blue, 0.05 alpha](usage.gif "Example")


## Extension Settings

This extension contributes the following settings:

* `blockhighlight.background`: Change the highlight color
* `blockhighlight.omit`: Array of languages that will not be parsed by this extension
* `blockhighlight.isWholeLine`: Option to highlight the entire line or only the text

## Known Issues

**Tabs are arbitrarily considered to be 4 spaces wide for performance reasons**
See open issues for details.
This should not be a problem if working with the default editor.tabSize = 4, but this default is hardcoded into this extension as of now.

This extension does not parse syntax, it simply checks indentation levels.

Unindented text is not highlighted; This is intentional.

## Release Notes

### 1.0.1.1

Fixed tabs being considered as 1 space

### 1.0.1

Added Whole Lines

### 1.0.0

Release + Bug fixing