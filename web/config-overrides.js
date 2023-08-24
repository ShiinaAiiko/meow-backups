const {
	override,
	fixBabelImports,
	addLessLoader,
	addWebpackPlugin,
} = require('customize-cra')
const TerserPlugin = require('terser-webpack-plugin')

let args = []
if (process.env.NODE_ENV === 'production') {
	args.push(
		addWebpackPlugin(
			new TerserPlugin({
				terserOptions: {
					ecma: undefined,
					warnings: false,
					parse: {},
					compress: {
            // warnings: true,
						// drop_console: false,
						// drop_debugger: true,
						// pure_funcs: ['console.log'], // 移除console
					},
				},
			})
		)
	)
}

module.exports = override(...args)

// module.exports = {
//   webpack: override(
//     (config) => {
//       if (process.env.NODE_ENV === "production") {

//       }

//       console.log(config)

// 	  fs.writeFileSync(`./config-${process.env.NODE_ENV}.json`, JSON.stringify(config))
//     }
//   )
// }
