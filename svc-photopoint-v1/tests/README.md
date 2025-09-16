# Cucumber BDD Tests for PhotoPoint Blob Storage

This directory contains Behavior-Driven Development (BDD) tests using Cucumber.js and Gherkin syntax.

## Test Structure

```
src/tests/
├── features/           # Gherkin feature files (.feature)
│   └── blobStorage.feature
├── steps/             # Step definitions (.ts)
│   └── blobStorageSteps.ts
└── setup/             # Test environment setup
    └── testSetup.ts
```

## Features Tested

### Blob Storage Management (`blobStorage.feature`)

Tests the core blob storage functionality including:

- **Path Generation**: Consistent file and thumbnail path generation
- **File Upload**: Upload files to blob storage with proper structure
- **File Retrieval**: Retrieve uploaded files from blob storage
- **File Deletion**: Delete files and handle non-existent files
- **Path Consistency**: Ensure utility classes and services generate identical paths
- **Edge Cases**: Special characters, files without extensions, root folders

## Running Tests

### Run all tests:
```bash
npm test
```

### Run only blob storage tests:
```bash
npm run test:blob
```

### Run with specific format:
```bash
npx cucumber-js --format pretty
```

## Test Scenarios

The blob storage tests cover these scenarios:

1. **Generate consistent file paths** - Verifies path generation follows expected format
2. **Generate consistent thumbnail paths** - Ensures thumbnails use proper naming
3. **Handle root folder paths correctly** - Tests default folder behavior
4. **Upload a file to blob storage** - Tests successful file upload
5. **Upload a thumbnail** - Tests thumbnail upload functionality
6. **Retrieve an uploaded file** - Tests file retrieval
7. **Retrieve a non-existent file** - Tests error handling
8. **Delete an uploaded file** - Tests file deletion
9. **Delete a non-existent file gracefully** - Tests deletion error handling
10. **Path consistency between utilities and service** - Ensures consistency
11. **Handle special characters in folder names** - Tests edge case handling
12. **Handle files without extensions** - Tests edge case handling
13. **Handle empty folder names as root** - Tests default behavior

## Expected Blob Structure

The tests verify that files are stored in this structure:
```
{accountId}/Media/{folderName|Root}/{fileId}.{extension}
{accountId}/Media/{folderName|Root}/{fileId}_thumbnail.jpg
```

Example:
```
test-account-123/Media/TestFolder/test-file-456.jpg
test-account-123/Media/TestFolder/test-file-456_thumbnail.jpg
test-account-123/Media/Root/root-file-123.jpg
```

## Test Environment

Tests use:
- **Azure Storage Emulator** (Azurite) for local development
- **Test account ID**: `test-account-123`
- **Test container**: `photopoint-media-test`
- **Test buffers** with known content for verification

## Writing New Tests

To add new test scenarios:

1. **Add scenario to `.feature` file** using Gherkin syntax:
```gherkin
Scenario: My new test scenario
  Given I have some precondition
  When I perform some action
  Then I should see some result
```

2. **Implement step definitions** in the corresponding `.ts` file:
```typescript
Given('I have some precondition', function () {
  // Implementation
});

When('I perform some action', async function () {
  // Implementation
});

Then('I should see some result', function () {
  // Assertions using chai expect
});
```

## Dependencies

- `@cucumber/cucumber` - Core Cucumber framework
- `@cucumber/pretty-formatter` - Pretty output formatting
- `chai` - Assertion library
- `ts-node` - TypeScript execution
- `@types/chai` - TypeScript definitions

## Benefits of BDD with Cucumber

1. **Human-readable tests** - Non-technical stakeholders can understand scenarios
2. **Living documentation** - Tests serve as executable specifications
3. **Collaboration** - Bridge between business requirements and technical implementation
4. **Reusable steps** - Step definitions can be shared across features
5. **Clear test structure** - Given-When-Then format makes tests easy to follow
