# indented-block-highlighting README

Highlights the intented area that contains the cursor.

## Features

Highlight the selected block automatically like so:

![Color is 200 red, 100 green, 255 blue, 0.05 alpha](usage.gif "Use Example")


## Extension Settings

This extension contributes the following settings:

* `blockhighlight.background`: Change the highlight color
* `blockhighlight.omit`: Array of languages that will not be parsed by this extension

## Known Issues

This extension does not parse syntax, it simply checks indentation levels.

Unindented text is not highlighted; This is intentional.

## Release Notes

### 1.0.0

Release