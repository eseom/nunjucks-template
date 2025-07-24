# Change Log

All notable changes to the "nunjucks-template" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.6.0] - 2024-01-23

### Major Updates

- **Complete modernization of the VS Code extension**
- Updated VS Code engine requirement from `^1.19.0` to `^1.74.0`
- Migrated from deprecated `vscode` package to modern `@vscode/test-electron`
- Updated TypeScript from `^4.6.3` to `^5.3.3`
- Improved TypeScript configuration with strict mode and modern ES2022 target

### Added

- ESLint configuration for better code quality
- Modern test setup with `@vscode/test-cli` and `@vscode/test-electron`
- Proper error handling in formatting operations
- Type definitions and interfaces for better type safety

### Changed

- Refactored extension activation to be more efficient
- Split utility functions into separate `functions.ts` module
- Improved code organization and readability
- Updated dependencies to latest stable versions
- Enhanced VS Code extension development experience

### Fixed

- Removed deprecated test runner dependencies
- Fixed TypeScript compilation errors
- Improved extension reliability and performance

### Developer Experience

- Added `.eslintrc.json` for code linting
- Updated `.vscodeignore` for better packaging
- Modernized build and test scripts
- Better error reporting and debugging capabilities

## [Unreleased]

- Initial release
