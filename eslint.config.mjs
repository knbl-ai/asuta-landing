import nextVitals from 'eslint-config-next/core-web-vitals';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const config = [
  ...nextVitals,
  {
    // eslint-config-next enables only a handful of jsx-a11y rules. Turn on the full
    // recommended set; spread only `.rules`, the plugin is already registered.
    files: ['**/*.{js,jsx,mjs}'],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'ASUTA_LandingPage_source_materials/**', 'test/**', 'test_support_files/**'],
  },
];

export default config;
