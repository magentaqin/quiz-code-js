const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const logger = require("elogger");
const fs = require("fs")
const exec = require('child_process').exec

const protoPath = path.resolve(process.cwd(), './algorithm.proto')
const tempPath = path.resolve(process.cwd(), './leetcode.js')
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
    call.on('data', async (payload) => {
        if (payload.lang) {
            lang = payload.lang;
        } else if (payload.file) {
            fs.writeFileSync(tempPath, payload.file);
            logger.debug(`Writing file chunk: ${tempPath}`);
        }
    })
    call.on('end', async () => {
        exec(`node ${tempPath}`, (error, stdout, stderr) => {
            const compileError = error || stderr
            if (compileError) {
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
        server.start()
    })
}

main()