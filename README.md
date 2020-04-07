# GetSet

Create objects with typed and observable properties.

**Features**
- Validation of type and value
- Error on getting a nonexistent property
- Notification on value change
- Reset to defaults

## Installation

```sh
npm install indiejs/get-set --save
```

Or clone repository:

```sh
git clone https://github.com/indiejs/get-set.git
```

The path for import in this case `./get-set/index.js`

## Usage

### Typed property

There are 2 options to describe a property type.

**Using constructor:**

```js
import {GetSet} from "@indiejs/get-set";

const post = new GetSet({
    id: Number
});

post.id = null;
// Error: Property 'id' should be of type 'Number', but got 'Null'
```

In this case type checked via `instanceof` operator.

**Using class name:**

```js
const post = new GetSet({
    id: "Number|Null"
});
```

In this case type checked via `toString` method.


### Default value

Default value follows the type:

```js
const post = new GetSet({
    id: [Number, 0]
});
```

Use `resetProperties` method to reset one or more properties to defaults:

```js
post.id = 1;
post.id; // 1
post.resetProperties(["id"]);
post.id; // 0
```

Properties with no default value return `undefined`.

### Possible values

Possible values are described using a pattern, optionally with a hint:

```js
const post = new GetSet({
    id: [Number, 0, "[0-9]+", "a positive integer"]
});

post.id = -1;
// Error: Property 'id' should be a positive integer, but got '-1'
```

### Observable object

To observe changes override `didChangeProperty` method:

```js
class Post extends GetSet {
    constructor() {
        super({
            id: [Number, 0, "[0-9]+", "a positive integer"]
        });
    }
    didChangeProperty(name, oldValue, newValue) {
        console.log(`Did change ${name}, new value: ${newValue}`);
    }
}
```

Then initialize it and treat like a regular object:

```js
const post = new Post();
post.id = 1;
```

The following will work as expected:

```js
Object.assign(post, {id: 2}); // {id: 2}
JSON.stringify(post); // "{\"id\": 2}"
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
