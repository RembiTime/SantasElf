module.exports = {
	env: {
		es2021: true,
		node: true
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module"
	},
	overrides: [
		{
			files: ["*.ts"],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			extends: [
				// "@typescript-eslint/recommended",
				// "@typescript-eslint/recommended-requiring-type-checking"
			],
			rules: {
				"no-unused-vars": "off",
				"@typescript-eslint/no-unused-vars": "error"
			}
		}
	],
	ignorePatterns: ["*.d.ts"],
	rules: {
		"indent": [
			"error",
			"tab"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"require-await": "error"
	}
};
