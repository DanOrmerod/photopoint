Feature: Blob Storage Management
  As a PhotoPoint API user
  I want to upload, retrieve, and manage files in blob storage
  So that I can organize my media files efficiently

  Background:
    Given I have a test environment set up
    And I have a valid account ID "test-account-123"
    And I have a test folder named "TestFolder"

  Scenario: Generate consistent file paths
    Given I have a file ID "test-file-456"
    And I have a file name "test-image.jpg"
    When I generate a file path for the folder "TestFolder"
    Then the file path should be "test-account-123/Media/TestFolder/test-file-456.jpg"

  Scenario: Generate consistent thumbnail paths
    Given I have a file ID "test-file-456"
    When I generate a thumbnail path for the folder "TestFolder"
    Then the thumbnail path should be "test-account-123/Media/TestFolder/test-file-456_thumbnail.jpg"

  Scenario: Handle root folder paths correctly
    Given I have a file ID "test-file-456"
    And I have a file name "test-image.jpg"
    When I generate a file path without specifying a folder
    Then the file path should be "test-account-123/Media/Root/test-file-456.jpg"

  Scenario: Upload a file to blob storage
    Given I have a test file buffer with content "Test file content for upload"
    And I have a file name "test-image.jpg"
    And I have a file ID "upload-test-123"
    When I upload the file to blob storage in folder "TestFolder"
    Then the upload should be successful
    And the upload result should contain the file ID "upload-test-123"
    And the upload result should contain the original name "test-image.jpg"
    And the upload result should have type "image"
    And the upload result should have mime type "image/jpeg"
    And the upload URL should contain "test-account-123/Media/TestFolder/upload-test-123"

  Scenario: Upload a thumbnail
    Given I have a test thumbnail buffer
    And I have a file name "test-image.jpg"
    And I have a file ID "thumbnail-test-123"
    When I upload the thumbnail to blob storage in folder "TestFolder"
    Then the thumbnail upload should be successful
    And the thumbnail path should be "test-account-123/Media/TestFolder/thumbnail-test-123_thumbnail.jpg"

  Scenario: Retrieve an uploaded file
    Given I have uploaded a file with ID "retrieve-test-123" to folder "TestFolder"
    When I retrieve the file buffer from blob storage
    Then the file buffer should be returned successfully
    And the file buffer should not be empty

  Scenario: Retrieve a non-existent file
    Given I have a non-existent file ID "non-existent-999"
    When I try to retrieve the file buffer from blob storage
    Then the file buffer should be null

  Scenario: Delete an uploaded file
    Given I have uploaded a file with ID "delete-test-123" to folder "TestFolder"
    When I delete the file from blob storage
    Then the deletion should be successful
    And the file should no longer exist in blob storage

  Scenario: Delete a non-existent file gracefully
    Given I have a non-existent file ID "non-existent-delete-999"
    When I try to delete the file from blob storage
    Then the deletion should not throw an error

  Scenario: Path consistency between utilities and service
    Given I have a file ID "consistency-test-123"
    And I have a file name "test-image.jpg"
    When I generate a path using the utility class
    And I generate a path using the storage service
    Then both paths should be identical

  Scenario: Handle special characters in folder names
    Given I have a folder name "Folder with spaces & symbols!"
    And I have a file ID "special-chars-123"
    And I have a file name "test-image.jpg"
    When I generate a file path for the special folder
    Then the file path should contain the special folder name
    And the file path should be "test-account-123/Media/Folder with spaces & symbols!/special-chars-123.jpg"

  Scenario: Handle files without extensions
    Given I have a file ID "no-ext-123"
    And I have a file name "file-without-extension"
    When I generate a blob file name
    Then the blob file name should be "no-ext-123."

  Scenario: Handle empty folder names as root
    Given I have a file ID "empty-folder-123"
    And I have a file name "test-image.jpg"
    When I generate a file path with an empty folder name
    And I generate a file path with undefined folder name
    Then both paths should be identical
    And both paths should contain "/Root/"
