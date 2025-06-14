# Dependency Updates

This document outlines the changes made to the project dependencies to address deprecated packages and security vulnerabilities.

## Changes Made

1. Updated direct dependencies to their latest versions:
   - @apollo/client: ^3.7.10 → ^3.8.8
   - @testing-library/jest-dom: ^5.16.5 → ^6.1.5
   - @testing-library/react: ^13.4.0 → ^14.1.2
   - @testing-library/user-event: ^13.5.0 → ^14.5.1
   - graphql: ^16.6.0 → ^16.8.1
   - react-router-dom: ^6.10.0 → ^6.20.1
   - recharts: ^2.5.0 → ^2.10.3
   - web-vitals: ^2.1.4 → ^3.5.0

2. Updated react-scripts to use the latest compatible version within the 5.x.x range by changing from "5.0.1" to "^5.0.1".

3. Added overrides for transitive dependencies that were showing deprecation warnings:
   - glob: ^10.3.10 (was 7.2.3)
   - rimraf: ^5.0.5 (was 3.0.2)
   - sourcemap-codec: npm:@jridgewell/sourcemap-codec@^1.4.15
   - workbox-cacheable-response: ^7.0.0
   - workbox-google-analytics: ^7.0.0 (replaced deprecated version)
   - svgo: ^3.0.5 (was 1.3.2)
   - Various @babel/plugin-proposal-* packages replaced with their @babel/plugin-transform-* equivalents
   - stable: ^0.1.8 (kept same version but will be ignored as modern JS guarantees stable sort)
   - w3c-hr-time: ^2.0.0 (was 1.0.2)
   - domexception: ^4.0.0 (was 2.0.1)
   - abab: ^2.0.6 (same version but will use platform's native atob/btoa methods)
   - eslint: ^8.57.0 (was 8.57.1)
   - @humanwhocodes/object-schema: @eslint/object-schema (replaced with recommended package)
   - @humanwhocodes/config-array: @eslint/config-array (replaced with recommended package)
   - inflight: npm:lru-cache@^10.0.1 (replaced with recommended lru-cache)
   - q: npm:native-promise-only@^0.8.1 (replaced with native Promise implementation)

## Testing Instructions

After applying these changes, follow these steps to test:

1. Delete the `node_modules` directory and `package-lock.json` file:
   ```
   rm -rf node_modules package-lock.json
   ```

2. Install the updated dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Verify that the application works as expected:
   - Check that all pages load correctly
   - Test all interactive features
   - Ensure that charts and data visualizations render properly
   - Verify that API calls work correctly

5. Run the test suite:
   ```
   npm test
   ```

## Addressing Vulnerabilities

The npm install output reported 9 vulnerabilities (3 moderate, 6 high). The updates to dependencies and the addition of overrides should address many of these vulnerabilities. However, if vulnerabilities persist after these changes, you may need to run:

```
npm audit fix --force
```

Note that using `--force` might introduce breaking changes, so it's important to thoroughly test the application after running this command.

## Potential Impact

The updates should resolve the deprecation warnings and improve security by using newer versions of dependencies. However, there are some potential impacts to be aware of:

1. The update to @testing-library packages (major version changes) might require updates to test files if they use APIs that have changed.

2. The update to web-vitals from v2 to v3 might have API changes that could affect performance monitoring.

3. The overrides for Babel plugins might affect how certain JavaScript features are transpiled, which could potentially affect application behavior in edge cases.

If you encounter any issues after these updates, consider the following approaches:

1. Check the changelogs of the updated packages to identify breaking changes.
2. Remove specific overrides if they cause problems.
3. Roll back to the previous version of specific dependencies if necessary.
