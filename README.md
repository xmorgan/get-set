# GetSet

Implementation of typed and observable properties.

**Use cases**
- An observable options object
- A model that can be safely passed to multiple views
- Anything else with safe property access, but without getter/setter complexities

## Installation

Clone repository:

```sh
git clone https://github.com/indiejs/get-set.git
```

Or install package:

```sh
npm install indiejs/get-set --save
```

## Usage

### Property type

```js
import {GetSet} from "./get-set/index.js";

const post = new GetSet({
    id: Number
});
post.id = null;
// Error: Property 'id' should be of type 'Number', but got 'Null'
```

To define multiple types use class name pattern:

```js
new GetSet({
    id: "Number|Null"
});
```

### Default value

```js
import {GetSet, defaultValueSymbol} from "./get-set/index.js";

const post = new GetSet({
    type: [String, "post"]
});
post.type = "page";
post.type // page
post.type = defaultValueSymbol;
post.type // post
```

### Value pattern

```js
import {GetSet} from "./get-set/index.js";

const post = new GetSet({
    type: [String, "post", "post|page"]
});
post.type = "";
// Error: Property 'type' should be 'post|page', but got empty string

```
You may have noticed that pattern was included in error message.

Since not all patterns are such easy to read, you may provide a description, which will be included in error message instead of a pattern:

```js
const post = new GetSet({
    id: [Number, 0, "[0-9]+", "a positive integer"]
});
post.id = -1;
// Error: Property 'id' should be a positive integer, but got '-1'
```

### Observable example

```js
import {GetSet} from "./get-set/index.js";

class Post extends GetSet {
    constructor() {
        super({
            type: [String, "post", "post|page"]
        });
    }
    didChangeProperty(name, oldValue, newValue) {
        console.log(`Did change ${name}, new value: ${newValue}`);
    }
}
const post = new Post();

post.type = "page";
post.type = "post";
```

## Methods

### `didChangeProperty(name, oldValue, newValue)`

Called when a property value did change.

Argument  | Type             | Description
----------|------------------|-----------------
name      | `String`         | A property name.
oldValue  | `Any`            | An old value.
newValue  | `Any`            | A new value.

### `resetProperties([whitelist])`

Resets multiple properties to default values.

Argument  | Type             | Description
----------|------------------|-----------------
whitelist | `Array<String>`  | A list of properties to reset.

### `toJSON([whitelist])`

Creates a plain object.

Argument  | Type             | Description
----------|------------------|-----------------
whitelist | `Array<String>`  | A list of properties to include.

### `throwException(...message)`

Throws an exception.

Argument  | Type             | Description
----------|------------------|-----------------
message   | `String`         | An exception message.

## License

Copyright 2020 [Sineway](https://github.com/sineway)

Permission to use, copy, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.
