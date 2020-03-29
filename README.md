# GetSet

Define property type and value. Be notified on change.

**Use cases**
- An observable options object
- A model that can be safely passed to multiple views
- Anything else with safe property access, but without getter/setter complexities

## Install

Clone this repo at desired location.

```sh
git clone https://github.com/indiejs/get-set.git
```

## Usage

### Type pattern

```js
import {GetSet} from "./get-set/index.js";

const post = new GetSet({
    type: "String",
});
console.log(post.type); // undefined

post.type = "post";
console.log(post.type); // post

post.type = undefined;
// Error: Property "type" should be of type "String", but got "Undefined"
```

### Default value

```js
import {GetSet, defaultValueSymbol} from "./get-set/index.js";

const post = new GetSet({
    type: ["String", "post"]
});
console.log(post.type); // post

post.type = "page";
console.log(post.type); // page

post.type = defaultValueSymbol;
console.log(post.type); // post
```

### Value pattern

```js
import {GetSet} from "./get-set/index.js";

const post = new GetSet({
    type: ["String", "post", "post|page"]
});
post.type = "";
// Error: Property "type" should be "post|page", but got empty string

```
You may have noticed that pattern was included in error message.

Since not all patterns are such easy to read, you may provide a description, which will be included in error message instead of a pattern:

```js
const post = new GetSet({
    id: ["Number", 0, "[0-9]+", "a positive integer"]
});
post.id = -1;
// Error: Property "id" should be a positive integer, but got "-1"
```

### Observable example

```js
import {GetSet} from "./get-set/index.js";

class Post extends GetSet {
    constructor() {
        super({
            type: ["String", "post", "post|page"]
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

Abstract method. Called when property value did change.

Argument  | Type             | Description
----------|------------------|-----------------
name      | `String`         | A name of property which value did change.
oldValue  | `Any`            | An old value.
newValue  | `Any`            | A new value.

### `resetProperties(whitelist)`

Resets multiple properties ​​to default values.

Argument  | Type             | Description
----------|------------------|-----------------
whitelist | `Array<String>`  | Optional. A list of properties to reset.

### `toJSON(whitelist)`

Returns plain object.

Argument  | Type             | Description
----------|------------------|-----------------
whitelist | `Array<String>`  | Optional. A list of properties to include.

## License

Copyright 2020 [Sineway](https://github.com/sineway)

Permission to use, copy, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.
