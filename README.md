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
        type: "Null|String"
    }
});

post.date = new Date;
// Error: Entry 'date': The type pattern (Null|String) does not match value type (Date)

```

#### Custom type validity

For custom type validity, use a function, that:
- returns true, if type of a value is valid
- returns false or throws an error, if type of a value is invalid

```javascript
const post = new GetSet({
    date: {
        type(value) {
            if (typeof value == "string") {
                return true;
            }
            throw "Invalid type";
        }
    }
});
```

### Value pattern

```javascript
const post = new GetSet({
    date: {
        pattern: /^(\d{4}-\d{2}-\d{2})?$/,
        hint: "YYYY-MM-DD"
    }
});

post.date = "01/01/1970";
// Error: Entry 'date': The YYYY-MM-DD pattern does not match value 01/01/1970
```

#### Custom value validity

For custom value validity, use a function, that:
- returns true, if value is valid
- returns false or throws an error, if value is invalid

```javascript
const post = new GetSet({
    date: {
        pattern(value) {
            if (/^(\d{4}-\d{2}-\d{2})?$/.test(value)) {
                return true;
            }
            throw "Invalid format";
        }
    }
});

post.date = "01/01/1970";
// Error: Invalid format
```

### Default value

```javascript
const post = new GetSet({
    date: {
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
        value: "",
        pattern: /^(\d{4}-\d{2}-\d{2})?$/,
        hint: "YYYY-MM-DD"
    }
};

class Post extends GetSet {
    constructor() {
        super(schema);
    }
    handlePropertyChange() {
        console.log(...arguments);
    }
    handlePropertyReject() {
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

class Post extends GetSet.extends(EventEmitter) {
    constructor() {
        super(schema);
    }
    handlePropertyChange() {
        this.emit("change", ...arguments);
    }
    handlePropertyReject() {
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
        value: "1970-01-01"
    },
    author: new GetSet({
        name: {
            value: "John Doe"
        },
        url: {
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
