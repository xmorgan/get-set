- [Installation](#installation)
- [Usage](#usage)
- [API reference](https://indiejs.github.io/get-set/#getset)
- [License](#license)

## Installation

```shell
> npm install indiejs/get-set --save
```

```javascript
import {GetSet} from "@indiejs/get-set";
```

Or clone repository:

```shell
> git clone https://github.com/indiejs/get-set.git
```

```javascript
import {GetSet} from "./get-set/index.js";
```

## Usage

### Type pattern

```javascript
const post = new GetSet({
    date: {
        type: "String|Number"
    }
});

post.date = new Date;
// Error: Entry 'date': The type pattern (String|Number) does not match value type (Date)

```

#### Custom validity

```javascript
const post = new GetSet({
    date: {
        type(value) {
            if (typeof value == "string" || typeof value == "number") {
                return true;
            }
            throw "Invalid type";
        }
    }
});

post.date = new Date;
// Error: Invalid type
```

### Value pattern

```javascript
const post = new GetSet({
    date: {
        type: "String",
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        hint: "yyyy-mm-dd"
    }
});

post.date = "1970";
// Error: Entry 'date': The yyyy-mm-dd pattern does not match value 1970
```

#### Custom validity

```javascript
const post = new GetSet({
    date: {
        type: "String",
        pattern(value) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return true;
            }
            throw "Invalid format";
        }
    }
});

post.date = "1970";
// Error: Invalid format
```

### Default value

```javascript
const post = new GetSet({
    date: {
        type: "String",
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        hint: "yyyy-mm-dd",
        value: "1970-01-01"
    }
});

post.date = "2020-01-01";
post.toDefaults();
post.date;
// 1970-01-01
```

### Changes and rejections

```javascript
const schema = {
    date: {
        type: "String",
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        hint: "yyyy-mm-dd",
        value: "1970-01-01"
    }
};

class Post extends GetSet {
    constructor() {
        super(schema);
    }
    didChangeProperty() {
        console.log(...arguments);
    }
    didRejectProperty() {
        console.log(...arguments);
    }
}

const post = new Post;
post.date = "2020-01-01";
post.date = new Date;
```

#### Events

```javascript
import {EventEmitter} from "events";

class Post extends GetSet.extends(EventEmitter, {seal: false}) {
    constructor() {
        super(schema);
    }
    didChangeProperty() {
        this.emit("change", ...arguments);
    }
    didRejectProperty() {
        this.emit("reject", ...arguments);
    }
}

const post = new Post()
    .on("change", console.log)
    .on("reject", console.log);
```

### Tree structures

```javascript
const post = new GetSet({
    date: {
        type: "String",
        value: "1970-01-01"
    },
    author: new GetSet({
        name: {
            type: "String",
            value: "John Doe"
        },
        url: {
            type: "String",
            value: "example.org"
        }
    })
});
```

#### Selective assign

```javascript
post.author = "";
// Does nothing

post.author.name = "John Doe";
// Updates name

post.author = { name: "John Doe" };
// Updates name only

Object.assign(post, { author: { name: "John Doe" } });
// Updates name only
```

### Serialization

```javascript
post.toJSON();

JSON.stringify(post);
```

See [API reference](https://indiejs.github.io/get-set/#getset) for more info.

## License

Copyright 2020 [Sineway](https://github.com/sineway)

Permission to use, copy, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.
