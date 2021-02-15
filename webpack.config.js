const path = require('path');
const fs = require('fs-extra');

fs.ensureDirSync("./dist");
fs.emptyDirSync("./dist");

const commonConfig = {
    externals: {
        "aws-sdk": "aws-sdk",
    },
    output: {
        path: path.resolve(__dirname),
        filename: './dist/[name].js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: ['ts-loader']
            }
        ]
    },
    node: {
        __dirname: false
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};

module.exports = [
    Object.assign({
            target: 'node',
            entry: {
                main: './src/main.ts'
            },
        },
        commonConfig
    )
];
