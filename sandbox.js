const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec

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
        const srcPath = path.resolve(process.cwd(), 'test-suites', this.testSuiteName, '__tests__', 'index.test.js')
        fs.mkdirSync(path.resolve(nameSpace, '__tests__'))
        const destPath = path.resolve(nameSpace, '__tests__', 'index.test.js')
        fs.copyFileSync(srcPath, destPath)
    }

    write(file) {
        fs.writeFileSync(path.resolve(this.nameSpace, 'index.js'), file)
    }

    writeCompileParams(params) {
        try {
          this.params  = params
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

    compileExpected() {
      const executeFile = path.resolve(process.cwd(), 'test-suites', this.testSuiteName, 'index.js')
      try {
        const func = require(executeFile)
          return func(...this.params)
      } catch (err) {
          return err
      }
    }

    test() {
      return new Promise((resolve, reject) => {
        exec(`./node_modules/.bin/jest --testPathPattern=${this.nameSpace}`, (error, stdout, stderr) => {
          if (error) {
            return reject(error)
          }
          // jest output testing result to stderr instead of stdout
          resolve(stderr)
        })
      })
    }

    destroy() {
      if (fs.existsSync(this.nameSpace)) {
        fs.rmSync(this.nameSpace, { recursive: true })
      }
    }
}

module.exports = Sandbox