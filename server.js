const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const logger = require("elogger");
const Sandbox = require('./sandbox');
const { performance } = require('node:perf_hooks');

const protoPath = path.resolve(process.cwd(), './algorithm.proto')
const packageDefinition = protoLoader.loadSync(
    protoPath,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
)

const algorithmProto = grpc.loadPackageDefinition(packageDefinition).algorithm;


function Compile(call, callback) {
    let lang = ''
    logger.debug(`gRPC ${call.call.handler.path}`);
    const key = Date.now() + '-qm'
    const testSuiteName = 'buy-and-sell-stock'
    const sandbox = new Sandbox(key, testSuiteName)
    sandbox.create()
    call.on('data', async (payload) => {
        console.log('payload', payload)
        if (payload.params) {
            sandbox.writeCompileParams(JSON.parse(payload.params))
        }
        if (payload.lang) {
            lang = payload.lang;
        } 
        if (payload.file) {
            sandbox.write(payload.file)
        }
    })
    call.on('end', async () => {
        const compileRes = sandbox.compile()
        const expectedRes = sandbox.compileExpected()
        if (compileRes instanceof Error || expectedRes instanceof Error) {
            callback(compileRes, {
              message: 'Something with compiling'
            })
        } else {
            callback(null, {
                actual_output: compileRes,
                expected_output: expectedRes,
                message: 'Compile Successfully!'
            });
        }
        sandbox.destroy()
    });
}

function Test(call, callback) {
    let lang = ''
    logger.debug(`gRPC ${call.call.handler.path}`);
    const key = Date.now() + '-qm'
    const testSuiteName = 'buy-and-sell-stock'
    const sandbox = new Sandbox(key, testSuiteName)
    sandbox.create()
    call.on('data', async (payload) => {
        console.log('payload', payload)
        if (payload.lang) {
            lang = payload.lang;
        } 
        if (payload.file) {
            sandbox.write(payload.file)
        }
    })
    call.on('end', async () => {
        const startTime = performance.now()
        sandbox.test().then(() => {
          const endTime = performance.now()
          const executionTime = (endTime - startTime).toFixed(3) + 'ms'
          callback(null, {
            execution_result: {
            message: 'Compile Successfully!',
            execution_time: executionTime
          }  
          });
        }).catch((err) => {
            callback(err, {
                message: 'Something with compiling'
              })
        }).finally(() => {
            sandbox.destroy()
        })
    });
}

// Start RPC server
function main() {
    const server = new grpc.Server()
    server.addService(algorithmProto.Algorithm.service, { Compile, Test })
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        logger.debug('grpc server started succesfully!');
        server.start()
    })
}

main()