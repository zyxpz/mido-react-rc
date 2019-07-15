import path from 'path';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const { entry } = require(path.join(process.cwd(), './source/entry'));

const milieu = process.env.NODE_ENV || 'development';

export default {
	webpack(config) {
		let newConfig = config;
		// 删除默认html loader
		newConfig.module.rules.some((d, i) => {
			if (/\.html/.test(d.test)) {
				newConfig.module.rules.splice(i, 1);
			}
		});

		// 删除默认output
		delete newConfig.output.filename;

		// 删除默认MiniCssExtractPlugin
		newConfig.plugins.some((d, i) => {
			if (/.css/.test(d.options.filename)) {
				newConfig.plugins.splice(i, 1);
			}
		});
		newConfig = {
			entry,
			output: {
				filename: milieu === 'production' ? '[name]/[name].js' : '[name].js'
			},
			resolve: {
				alias: {
					"@": `${process.cwd()}/src`
				}
			},
			module: {
				rules: [
					{
						test: /\.html$/i,
						loader: require.resolve('file-loader'),
						options: {
							name(file) {
								if (milieu === 'production') {
									if (/index/.test(file)) {
										return '[name].[ext]';
									}
									return `/[name]/[name].[ext]`;
								}
								return '[name].[ext]';
							}
						}
					}
				]
			},
			externals: {
				'react': 'React',
				'react-dom': 'ReactDOM'
			},
			plugins: [
				new MiniCssExtractPlugin({
					filename: '[name].css',
					allChunks: true
				})
			],
			optimization: {
				splitChunks: {
					cacheGroups: {
						default: {
							minChunks: 2,
							priority: -20,
							reuseExistingChunk: true,
						},
						// styles: {
						// 	name: 'styles',
						// 	test: /\.css$/,
						// 	chunks: 'all',
						// 	enforce: true,
						// },
						vendor: {
							chunks: "all",
							test: /[\\/]node_modules[\\/]/,
							name: "common",
							maxInitialRequests: 5,
							minSize: 0,
						}
					}
				}
			}
		};
		return newConfig;
	},
	babel: {
		"plugins": [
			["import", {
				"libraryName": "antd",
				"libraryDirectory": "es",
				"style": true // `style: true` 会加载 less 文件
			}]
		]
	}
};