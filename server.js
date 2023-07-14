const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const logger = require("elogger");
const Sandbox = require('./sandbox');
const exec = require('child_process').exec

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
        if (payload.lang) {
            lang = payload.lang;
        } else if (payload.file) {
            sandbox.write(payload.file)
        }
    })
    call.on('end', async () => {
        exec(`npm run test`, (error, stdout, stderr) => {
            console.log('error', error)
            console.log('stderr', stderr)
            const compileError = error || stderr
            if (error) {
                callback(compileError, {
                    message: 'Something with compiling'
                })
            } else {
                callback(null, {
                    message: 'Compile Successfully!'
                });
            }
        })
    });
}

// Start RPC server
function main() {
    const server = new grpc.Server()
    server.addService(algorithmProto.Algorithm.service, { Compile })
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        logger.debug('grpc server started succesfully!');
        server.start()
    })
}

main()