#!/usr/bin/env node
const yargs = require("yargs")(process.argv.slice(2))
const path = require('path')
const shelljs = require('shelljs')
const fs = require('fs'), ini = require('ini');

const examples =
    '\nInstalar todas as dependências da aplicação:\n' +
    'slc get-started\n' +

    '\nIniciar a aplicação na porta 3000:\n' +
    'slc client\n' +

    '\nIniciar a aplicação na porta 5000:\n' +
    'slc client --port=5000\n' +

    '\nIniciar a servidor na porta 8080:\n' +
    'slc server\n' +

    '\nIniciar o worker:\n' +
    'slc worker\n';

yargs
    //Comandos da aplicação
    .command('get-started', 'Instalar dependências necessárias', () => {
        const serverModules = path.join(__dirname, 'client', 'server', 'node_modules')
        if (!fs.existsSync(serverModules)) {
            const serverFile = path.join(__dirname, 'client', 'server')
            shelljs.cd(serverFile)
    
            let returnVal

            console.log('Instalando dependências [1/2]...')
    
            returnVal = shelljs.exec('npm install')
    
            if(returnVal.code != 0) {
                throw new Error('Não foi possível instalar as dependências do Node.')
            }else {
                console.log('Dependências [1/2] instaladas com sucesso.')
            }
        }else {
            console.log('Dependências [1/2] instaladas com sucesso.')
        }

        const workerModules = path.join(__dirname, 'worker')
        shelljs.cd(workerModules)

        returnVal = shelljs.exec('python test_dependencies.py')

        if(returnVal.code != 0) {
            const pythonModules = path.join(__dirname, 'worker')
            shelljs.cd(pythonModules)
    
            returnVal = shelljs.exec('pip install -r requirements.txt')
    
            if(returnVal.code != 0) {
                throw new Error('Não foi possível instalar as dependências do Python.')
            }else {
                console.log('Dependências [2/2] instaladas com sucesso.')
            }
        }else {
            console.log('Dependências [2/2] instaladas com sucesso.')
        }

        const workDir = path.join(process.cwd())
        createSLCFolders(path.join(workDir, 'Arquivo_SLC'));
    })
    .command({
        command: 'client [port]',
        desc: 'Porta de execução',
        builder: (yargs) => yargs.default('port', 3000),
        handler: (argv) => {
            const configModule = path.join(__dirname, 'client', 'server', 'app_config.ini')
            var config = ini.parse(fs.readFileSync(configModule, 'utf-8'))

            config.server.port = argv.port
            fs.writeFileSync(configModule, ini.stringify(config))

            const clientFiles = path.join(__dirname, 'client', 'server')
            shelljs.cd(clientFiles)

            let returnVal = shelljs.exec('npm start')

            if(returnVal.code != 0) {
                throw new Error('Não foi possível iniciar o projeto.')
            }
        }
    })
    //Comandos do servidor
    .command('server', 'Iniciar o Worker', function (yargs) {
        yargs.command({
            command: '[port]',
            desc: 'Porta de execução',
            builder: (yargs) => yargs.default('port', 8080),
            handler: (argv) => {
                const serverFiles = path.join(__dirname, 'lib')
                shelljs.cd(serverFiles)

                let returnVal = shelljs.exec(`java -jar simulador-0.0.1-SNAPSHOT.jar --server.port=${argv.port}`)

                if(returnVal.code != 0) {
                    throw new Error('Não foi possível iniciar o projeto')
                }
            }
        }),
        yargs.command({
            command: '[host] [port] [db] [schema] [user] [pass]',
            desc: 'Configurar apontamento do banco de dados',
            builder: (yargs) => yargs
                .default('host', 'localhost')
                .default('port', 5432)
                .default('db', 'postgres')
                .default('schema', 'public')
                .default('user', 'postgres')
                .default('pass', 'admin'),
            handler: (argv) => {
                const serverFiles = path.join(__dirname, 'lib')
                shelljs.cd(serverFiles)

                let returnVal = shelljs.exec(`
                    java -jar simulador-0.0.1-SNAPSHOT.jar 
                    --app.datasource.main.jdbc-url=\"jdbc:postgresql://${argv.host}:${argv.port}/${argv.db}\" 
                    --app.datasource.main.password=\"${argv.pass}\" 
                    --app.datasource.main.username=${argv.user}
                `)

                if(returnVal.code != 0) {
                    throw new Error('Não foi possível iniciar o projeto')
                }
            }
        })
    }, () => {
        const serverFiles = path.join(__dirname, 'lib')
        shelljs.cd(serverFiles)

        let returnVal

        returnVal = shelljs.exec('java -jar simulador-0.0.1-SNAPSHOT.jar')

        if(returnVal.code != 0) {
            throw new Error('Não foi possível iniciar o projeto')
        }
    })
    //Comandos do worker
    .command('worker', 'Iniciar o Worker', function (yargs) {
        yargs.command({
            command: 'database [host] [port] [db] [schema] [user] [pass]',
            desc: 'Configurar apontamento do banco de dados',
            builder: (yargs) => yargs
                .default('host', 'localhost')
                .default('port', 8080)
                .default('db', 'postgres')
                .default('schema', 'public')
                .default('user', 'postgres')
                .default('pass', 'admin'),
            handler: (argv) => {
                const configModule = path.join(__dirname, 'worker', 'resources', 'app_config.ini')
                var config = ini.parse(fs.readFileSync(configModule, 'utf-8'))
    
                config.psql.host = argv.host
                config.psql.port = argv.port
                config.psql.database = argv.db
                config.psql.schema = argv.schema
                config.psql.username = argv.user
                config.psql.password = argv.pass

                console.log('Banco de dados configurado.')

                fs.writeFileSync(configModule, ini.stringify(config))
            }
        })
    }, () => {
        const pythonModules = path.join(__dirname, 'worker', 'source')
        shelljs.cd(pythonModules)

        let returnVal

        returnVal = shelljs.exec('python worker.pyc')

        if(returnVal != 0) {
            throw new Error('Não foi possível iniciar o Worker')
        }
    })
    //Comandos do FTP
    .command('ftp', 'Iniciar o FTP', function (yargs) {
        yargs.command({
            command: 'database [host] [port] [db] [schema] [user] [pass]',
            desc: 'Configurar apontamento do banco de dados',
            builder: (yargs) => yargs
                .default('host', 'localhost')
                .default('port', 8080)
                .default('db', 'postgres')
                .default('schema', 'public')
                .default('user', 'postgres')
                .default('pass', 'admin'),
            handler: (argv) => {
                const configModule = path.join(__dirname, 'worker', 'resources', 'app_config.ini')
                var config = ini.parse(fs.readFileSync(configModule, 'utf-8'))
    
                config.psql.host = argv.host
                config.psql.port = argv.port
                config.psql.database = argv.db
                config.psql.schema = argv.schema
                config.psql.username = argv.user
                config.psql.password = argv.pass

                console.log('Apontamento realizado com sucesso!')

                fs.writeFileSync(configModule, ini.stringify(config))

                console.log('Host: ', config.psql.host)
                console.log('Port: ', config.psql.port)
                console.log('Database: ', config.psql.database)
                console.log('Schema: ', config.psql.schema)
                console.log('Username: ', config.psql.username)
                console.log('Password: ', config.psql.password)
            }
        })
    }, () => {
        const pythonModules = path.join(__dirname, 'worker', 'source')
        shelljs.cd(pythonModules)

        let returnVal

        returnVal = shelljs.exec('python worker.pyc')

        if(returnVal != 0) {
            throw new Error('Não foi possível iniciar o Worker')
        }
    })
    //Comandos gerais
    .command('run-all', 'Iniciar todos os componentes da aplicação', () => {
        let returnVal
        console.log('\n\nIniciando aplicação [1/3]')

        const clientFiles = path.join(__dirname, 'client', 'server')
        shelljs.cd(clientFiles)

        returnVal = shelljs.exec('npm start')

        if(returnVal.code != 0) {
            throw new Error('Não foi possível iniciar o projeto')
        }

        console.log('\n\n Iniciando aplicação [2/3]')

        const serverFiles = path.join(__dirname, 'lib')
        shelljs.cd(serverFiles)

        returnVal = shelljs.exec('java -jar simulador-0.0.1-SNAPSHOT.jar')

        if(returnVal.code != 0) {
            throw new Error('Não foi possível iniciar o projeto')
        }

        console.log('\n\n Iniciando aplicação [3/3]')

        const pythonModules = path.join(__dirname, 'worker', 'source')
        shelljs.cd(pythonModules)

        returnVal = shelljs.exec('python worker.pyc')

        if(returnVal != 0) {
            throw new Error('Não foi possível iniciar o Worker')
        }

    })
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .demandCommand()
    .example(examples)
    .strict()
    .parse(process.argv.slice(2), (err, argv, output) => {
        if(output) {
            const newOutput = output.replace("simulador-slc.js", "slc");
            console.log(newOutput)
        }
    })

function createSLCFolders(workDir) {
    var repoExists = true;

    if (!fs.existsSync(workDir)) {
        repoExists = false;
    } else {
        if (fs.readdirSync(workDir).length === 0) {
            repoExists = false;
        }
    }

    if (!repoExists) {
        const sampleWorkDir = path.join(workDir, 'CIP');
        shelljs.mkdir('-p', workDir);
        shelljs.cp('-r', sampleWorkDir, workDir);
    }
}