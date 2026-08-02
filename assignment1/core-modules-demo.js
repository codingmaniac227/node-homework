const os = require('os');
const path = require('path');
const fs = require('fs');

const fsPromises = require('fs/promises');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log(`Platform: ${os.platform()}`);
console.log(`CPU: ${os.cpus()[0].model}`)
console.log(`Total Memory: ${os.totalmem()}`)
// Path module
const joinedPath = path.join(
    sampleFilesDir,
    'folder',
    'file.txt'
)
console.log(`Joined path: ${joinedPath}`)
// fs.promises API

async function promiseAPI() {
  try {
    await fsPromises.writeFile(
        './sample-files/demo.txt',
        'Hello from fs.promises!'
    )
    const content = await fsPromises.readFile(
        './sample-files/demo.txt',
        'utf-8'
    )

    console.log(`fs.promises read:`, content)
  } catch(err) {
    console.log(`Error:`, err.message)
  }
}

promiseAPI()

// Streams for large files- log first 40 chars of each chunk

async function streamLargeFile() {
  try {
    let largeFilePath = path.join(
        sampleFilesDir,
        'largefile.txt'
    )

    let fileContent = ''

    for (let i = 1; i <= 100; i++) {
      fileContent += `This is line ${i} in a large file.\n`
    }

    await fsPromises.writeFile(
        largeFilePath,
        fileContent
    )

    const readStream = fs.createReadStream(
        largeFilePath,
        {
          encoding: 'utf8',
          highWaterMark: 1024
        }
    )

    readStream.on('data', (chunk) => {
      console.log(`Read chunk: ${chunk.slice(0, 40)}`)})

    readStream.on('end', () => {
      console.log(`Finished reading large file with streams`)
    })

    readStream.on('error', (err) => {
      console.log(`Stream error:`, err.message)
    })
  } catch(err) {
    console.log(`File creation error:`, err.message)
  }
}

streamLargeFile()
