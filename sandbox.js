const path = require('path')
const fs = require('fs')

class Sandbox {
    constructor(key, testSuiteName) {
        this.key = key
        this.testSuiteName = testSuiteName
        this.nameSpace = ''
        this.params = []
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

    writeCompileParams(params) {
        try {
          this.params  = JSON.parse(params)
        } catch (err) {
          this.params = []
        }
    }


    compile() {
        const executeFile = path.resolve(this.nameSpace, 'index.js')
        try {
            const func = require(executeFile)
            return func(...this.params)
        } catch (err) {
            return err
        }
    }

    test() {

    }

    destroy() {
      if (fs.existsSync(this.nameSpace)) {
        fs.rmSync(this.nameSpace, { recursive: true })
      }
    }
}

module.exports = Sandbox