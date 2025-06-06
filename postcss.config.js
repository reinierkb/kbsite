module.exports = ({ env }) => ({
	plugins: {
		"postcss-import": {},
		autoprefixer: {},
		cssnano:
			env === "production"
				? {
					preset: ["default", { discardComments: { removeAll: true } }],
				}
				: false,
	},
});
