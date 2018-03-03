module.exports = {
    entry: './main.js',
    output: {
        filename: './bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader?name=assets/images/[name].[ext]'
                ]
            },
            {
                test: /\.(wav|mp3)$/,
                use: [
                    'file-loader'
                ]
            },
        ]
    }
};