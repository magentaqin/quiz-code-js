const path = require('path')
const fs = require('fs')

class Sandbox {
    constructor(key, testSuiteName) {
        this.key = key
        this.testSuiteName = testSuiteName
        this.nameSpace = ''
    }

    create() {
        const nameSpace = path.resolve(process.cwd(), 'sandbox', this.key)
        this.nameSpace = nameSpace
        fs.mkdirSync(nameSpace)
        // copy test suite
        const srcPath = path.resolve(process.cwd(), 'test-suites', this.testSuiteName, 'index.test.js')
        const destPath = path.resolve(nameSpace, 'index.test.js')
        fs.copyFileSync(srcPath, destPath)
    }

    write(file) {
        fs.writeFileSync(path.resolve(this.nameSpace, 'index.js'), file)
    }


    compile() {

    }

    runTests() {

    }
}

module.exports = Sandbox