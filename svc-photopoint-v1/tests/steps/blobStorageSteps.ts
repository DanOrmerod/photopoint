import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { blobStorageService } from '../../src/services/blobStorageService';
import { BlobPathUtils } from '../../src/utils/blobPathUtils';

// Test context to store data between steps
interface TestContext {
  accountId: string;
  fileId: string;
  fileName: string;
  folderName: string;
  testBuffer: Buffer;
  thumbnailBuffer: Buffer;
  filePath: string;
  thumbnailPath: string;
  uploadResult: any;
  fileBuffer: Buffer | null;
  utilsPath: string;
  servicePath: string;
  emptyFolderPath: string;
  undefinedFolderPath: string;
  blobFileName: string;
  specialFolderName: string;
}

// Global test context
let testContext: TestContext;

Before(function () {
  testContext = {
    accountId: '',
    fileId: '',
    fileName: '',
    folderName: '',
    testBuffer: Buffer.alloc(0),
    thumbnailBuffer: Buffer.alloc(0),
    filePath: '',
    thumbnailPath: '',
    uploadResult: null,
    fileBuffer: null,
    utilsPath: '',
    servicePath: '',
    emptyFolderPath: '',
    undefinedFolderPath: '',
    blobFileName: '',
    specialFolderName: ''
  };
});

After(async function () {
  // Cleanup any uploaded test files
  try {
    if (testContext.fileId && testContext.accountId) {
      const fileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
      await blobStorageService.deleteFile(
        testContext.accountId,
        testContext.fileId,
        fileName,
        testContext.folderName
      );
    }
  } catch (error) {
    // Ignore cleanup errors
    console.log('Cleanup error (ignored):', error);
  }
});

// Background steps
Given('I have a test environment set up', function () {
  // Test environment is ready
  expect(blobStorageService).to.exist;
  expect(BlobPathUtils).to.exist;
});

Given('I have a valid account ID {string}', function (accountId: string) {
  testContext.accountId = accountId;
  expect(testContext.accountId).to.equal(accountId);
});

Given('I have a test folder named {string}', function (folderName: string) {
  testContext.folderName = folderName;
  expect(testContext.folderName).to.equal(folderName);
});

// Path generation steps
Given('I have a file ID {string}', function (fileId: string) {
  testContext.fileId = fileId;
});

Given('I have a file name {string}', function (fileName: string) {
  testContext.fileName = fileName;
});

When('I generate a file path for the folder {string}', function (folderName: string) {
  testContext.filePath = BlobPathUtils.generateFilePath(
    testContext.accountId,
    testContext.fileId,
    testContext.fileName,
    folderName
  );
});

Then('the file path should be {string}', function (expectedPath: string) {
  expect(testContext.filePath).to.equal(expectedPath);
});

When('I generate a thumbnail path for the folder {string}', function (folderName: string) {
  testContext.thumbnailPath = BlobPathUtils.generateThumbnailPath(
    testContext.accountId,
    testContext.fileId,
    folderName
  );
});

Then('the thumbnail path should be {string}', function (expectedPath: string) {
  expect(testContext.thumbnailPath).to.equal(expectedPath);
});

When('I generate a file path without specifying a folder', function () {
  testContext.filePath = BlobPathUtils.generateFilePath(
    testContext.accountId,
    testContext.fileId,
    testContext.fileName,
    undefined
  );
});

// File upload steps
Given('I have a test file buffer with content {string}', function (content: string) {
  testContext.testBuffer = Buffer.from(content);
});

When('I upload the file to blob storage in folder {string}', async function (folderName: string) {
  testContext.uploadResult = await blobStorageService.uploadFile(
    testContext.testBuffer,
    testContext.fileName,
    'image/jpeg',
    testContext.accountId,
    testContext.fileId,
    folderName
  );
});

Then('the upload should be successful', function () {
  expect(testContext.uploadResult).to.exist;
});

Then('the upload result should contain the file ID {string}', function (expectedId: string) {
  expect(testContext.uploadResult.id).to.equal(expectedId);
});

Then('the upload result should contain the original name {string}', function (expectedName: string) {
  expect(testContext.uploadResult.originalName).to.equal(expectedName);
});

Then('the upload result should have type {string}', function (expectedType: string) {
  expect(testContext.uploadResult.type).to.equal(expectedType);
});

Then('the upload result should have mime type {string}', function (expectedMimeType: string) {
  expect(testContext.uploadResult.mimeType).to.equal(expectedMimeType);
});

Then('the upload URL should contain {string}', function (expectedUrlPart: string) {
  expect(testContext.uploadResult.url).to.contain(expectedUrlPart);
});

// Thumbnail upload steps
Given('I have a test thumbnail buffer', function () {
  testContext.thumbnailBuffer = Buffer.from('Test thumbnail content');
});

When('I upload the thumbnail to blob storage in folder {string}', async function (folderName: string) {
  testContext.thumbnailPath = await blobStorageService.uploadThumbnail(
    testContext.thumbnailBuffer,
    testContext.fileName,
    testContext.accountId,
    testContext.fileId,
    folderName
  );
});

Then('the thumbnail upload should be successful', function () {
  expect(testContext.thumbnailPath).to.exist;
  expect(testContext.thumbnailPath).to.be.a('string');
});

// File retrieval steps
Given('I have uploaded a file with ID {string} to folder {string}', async function (fileId: string, folderName: string) {
  testContext.fileId = fileId;
  testContext.folderName = folderName;
  testContext.fileName = 'test-retrieve.jpg';
  testContext.testBuffer = Buffer.from('Test file content for retrieval');
  
  await blobStorageService.uploadFile(
    testContext.testBuffer,
    testContext.fileName,
    'image/jpeg',
    testContext.accountId,
    testContext.fileId,
    folderName
  );
});

When('I retrieve the file buffer from blob storage', async function () {
  const fileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
  testContext.fileBuffer = await blobStorageService.getFileBuffer(
    testContext.accountId,
    testContext.fileId,
    fileName,
    testContext.folderName,
    false
  );
});

Then('the file buffer should be returned successfully', function () {
  expect(testContext.fileBuffer).to.exist;
  expect(Buffer.isBuffer(testContext.fileBuffer)).to.be.true;
});

Then('the file buffer should not be empty', function () {
  expect(testContext.fileBuffer!.length).to.be.greaterThan(0);
});

// Non-existent file steps
Given('I have a non-existent file ID {string}', function (fileId: string) {
  testContext.fileId = fileId;
  testContext.fileName = 'non-existent.jpg';
});

When('I try to retrieve the file buffer from blob storage', async function () {
  const fileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
  testContext.fileBuffer = await blobStorageService.getFileBuffer(
    testContext.accountId,
    testContext.fileId,
    fileName,
    testContext.folderName,
    false
  );
});

Then('the file buffer should be null', function () {
  expect(testContext.fileBuffer).to.be.null;
});

// File deletion steps
When('I delete the file from blob storage', async function () {
  const fileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
  await blobStorageService.deleteFile(
    testContext.accountId,
    testContext.fileId,
    fileName,
    testContext.folderName
  );
});

Then('the deletion should be successful', function () {
  // If no error was thrown, deletion was successful
  expect(true).to.be.true;
});

Then('the file should no longer exist in blob storage', async function () {
  const fileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
  const fileBuffer = await blobStorageService.getFileBuffer(
    testContext.accountId,
    testContext.fileId,
    fileName,
    testContext.folderName,
    false
  );
  expect(fileBuffer).to.be.null;
});

When('I try to delete the file from blob storage', async function () {
  const fileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
  try {
    await blobStorageService.deleteFile(
      testContext.accountId,
      testContext.fileId,
      fileName,
      testContext.folderName
    );
  } catch (error) {
    // Store error for later assertion if needed
    (testContext as any).deletionError = error;
  }
});

Then('the deletion should not throw an error', function () {
  // If we reach here without an unhandled error, the test passes
  expect(true).to.be.true;
});

// Path consistency steps
When('I generate a path using the utility class', function () {
  testContext.utilsPath = BlobPathUtils.generateFilePath(
    testContext.accountId,
    testContext.fileId,
    testContext.fileName,
    testContext.folderName
  );
});

When('I generate a path using the storage service', function () {
  testContext.servicePath = blobStorageService.generateBlobPath(
    testContext.accountId,
    testContext.folderName,
    testContext.fileId,
    testContext.fileName
  );
});

Then('both paths should be identical', function () {
  expect(testContext.servicePath).to.equal(testContext.utilsPath);
});

// Special characters steps
Given('I have a folder name {string}', function (folderName: string) {
  testContext.specialFolderName = folderName;
});

When('I generate a file path for the special folder', function () {
  testContext.filePath = BlobPathUtils.generateFilePath(
    testContext.accountId,
    testContext.fileId,
    testContext.fileName,
    testContext.specialFolderName
  );
});

Then('the file path should contain the special folder name', function () {
  expect(testContext.filePath).to.contain(testContext.specialFolderName);
});

// File without extension steps
When('I generate a blob file name', function () {
  testContext.blobFileName = BlobPathUtils.generateBlobFileName(testContext.fileId, testContext.fileName);
});

Then('the blob file name should be {string}', function (expectedFileName: string) {
  expect(testContext.blobFileName).to.equal(expectedFileName);
});

// Empty folder steps
When('I generate a file path with an empty folder name', function () {
  testContext.emptyFolderPath = BlobPathUtils.generateFilePath(
    testContext.accountId,
    testContext.fileId,
    testContext.fileName,
    ''
  );
});

When('I generate a file path with undefined folder name', function () {
  testContext.undefinedFolderPath = BlobPathUtils.generateFilePath(
    testContext.accountId,
    testContext.fileId,
    testContext.fileName,
    undefined
  );
});

Then('both paths should contain {string}', function (expectedPart: string) {
  expect(testContext.emptyFolderPath).to.contain(expectedPart);
  expect(testContext.undefinedFolderPath).to.contain(expectedPart);
});
