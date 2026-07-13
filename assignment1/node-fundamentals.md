# Node.js Fundamentals

## What is Node.js?
A javascript runtime environment that is able to operate outside the browser.
## How does Node.js differ from running JavaScript in the browser?
Node does not have access to 'window' or 'document' elements, therefore it does not control the frontend directly. Node allows you to manipulate file systems, operating systems, read from or write to files, or set up web servers where api secrets can be kept safely without being stored in the browser itself.

## What is the V8 engine, and how does Node use it?
An engine that reads your javascript and turns it into fast instructions the computer can run.

## What are some key use cases for Node.js?
Read and write files, set up a web server, read environment variables, work with operating systems, and use backend libraries(i.e. express)

## Explain the difference between CommonJS and ES Modules. Give a code example of each.
commonJS imports code with require(), where 'require()' loads a package. destructuring pulls out the specific values you want to use out of it. ES modules are the modern javascript way to import code.


**CommonJS (default in Node.js):**
```js
function add(a, b) {
    return a + b
}

module.exports = { add }

const { add } = require = ('./math')
```

**ES Modules (supported in modern Node.js):**
```js
function add(a, b) {
    return a + b
}

import { add } from './math.js'
``` 