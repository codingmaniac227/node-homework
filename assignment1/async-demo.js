const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Write a sample file for demonstration

const folderPath = path.join(__dirname, 'sample-files')
const filePath = path.join(folderPath, 'sample.txt')
const fileContent = 'Hello, async world!'

fs.mkdirSync(folderPath, { recursive: true })
fs.writeFileSync(filePath, fileContent)

// 1. Callback style
fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
        console.log('Error')
    } else {
        console.log(`Callback read: ${content}`)
    }
})

  // Callback hell example (test and leave it in comments):
    /***
        readFile(file1, () => {

            readFile(file2, () => {

                readFile(file3, () => {

                })
            })
        })
     ***/

  // 2. Promise style
const readFilePromise = promisify(fs.readFile)

readFilePromise(filePath, 'utf8')
    .then((content) => {
        console.log('Promise read:', content)
    })
    .catch((err) => {
        console.log('Error:', err.message);
    })

  // 3. Async/Await style
async function readAsyncAwait() {
    try {
        const content = await readFilePromise(filePath, 'utf8')
        console.log('Async/Await read:', content)
    } catch (err) {
        console.log('Async Await error:', err.message);
    }
}
readAsyncAwait()