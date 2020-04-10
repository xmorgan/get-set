# @indiejs/get-set

Create objects with typed and observable properties.

**Features**
- Custom validation of type and value
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

*The path for import `./get-set/index.js`*

## Usage

### Typed property

There are three ways to describe a property type.

1). Using a class name pattern:

```js
import {GetSet} from "@indiejs/get-set";

const post = new GetSet({
    id: "Number"
});
post.id = "0";
// Error: Property 'id' should be of type 'Number', but got 'String'
```

*In this case type checked against result of `({}).toString.call`*

2). Using a `type()` function:

```js
import {GetSet, type} from "@indiejs/get-set";

const post = new GetSet({
    id: type(Number)
});
post.id = "0";
// Error: Property 'id' does not accept type of value '0'
```

*In this case type checked by `instanceof` operator.*

3). Using a custom function:

```js
const isNumber = (value) => {
    return typeof value == "number";
};
const post = new GetSet({
    id: isNumber
});
post.id = "0";
// Error: Property 'id' does not accept type of value '0'
```

### Default value

Default value follows the type:

```js
const post = new GetSet({
    id: ["Number", 0]
});
post.id = 1;
```

Use `resetProperties()` to reset one or more properties to defaults:

```js
post.id; // 1
post.resetProperties();
post.id; // 0
```

### Possible values

There are two ways to describe possible values.

1). Using a pattern with optional hint:

```js
const post = new GetSet({
    id: ["Number", 0, "[0-9]+", "a positive integer"]
});
post.id = -1;
// Error: Property 'id' should be a positive integer, but got '-1'
```

2). Using a custom function:

```js
const post = new GetSet({
    id: ["Number", 0, Number.isSafeInteger]
});
post.id = Math.pow(2, 53);
// Error: Property 'id' does not accept value '9007199254740992'
```

To describe a value that cannot be changed, use `constant`:

```js
import {GetSet, constant} from "@indiejs/get-set";

const post = new GetSet({
    id: [constant, 1]
});
```

### Observable object

To observe changes override `didChangeProperty` method:

```js
class Post extends GetSet {
    constructor() {
        super({
            id: ["Number", 0, "[0-9]+", "a positive integer"]
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

Parameter | Type             | Description
----------|------------------|-----------------
name      | `String`         | A property name.
oldValue  | `Any`            | An old value.
newValue  | `Any`            | A new value.

### `resetProperties([whitelist])`

Resets multiple properties to default values.

Parameter | Type             | Description
----------|------------------|-----------------
whitelist | `Array<String>`  | A list of properties to reset.

### `toJSON([whitelist])`

Creates a plain object.

Parameter | Type             | Description
----------|------------------|-----------------
whitelist | `Array<String>`  | A list of properties to include.

### `throwException(...message)`

Throws an exception.

Parameter | Type             | Description
----------|------------------|-----------------
message   | `String`         | An exception message.

## License

Copyright 2020 [Sineway](https://github.com/sineway)

Permission to use, copy, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.
