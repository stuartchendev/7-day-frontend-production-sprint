# Day 6 — Creator Upload Tool

A small creator asset upload workflow built with React + TypeScript to make local preview, asynchronous upload progress, failure recovery, and lifecycle cleanup observable.

Day 6 focuses on modeling a small asynchronous upload workflow with **local file state, explicit upload status, simulated progress, deterministic failure/retry behavior, and resource cleanup** rather than building a complete asset management system.

## What it demonstrates

* Local image selection and preview with browser object URLs
* Image dimension extraction from the selected asset
* Explicit upload lifecycle states
* Simulated asynchronous upload progress
* Deterministic upload failure and retry behavior
* Temporary asset metadata before upload
* Uploaded asset result data after success
* Drag-and-drop image selection
* Interaction locking during upload
* Object URL cleanup and asynchronous lifecycle safety
* Focused behavior tests for the main upload workflow

## Workflow

The observable Day 6 workflow is:

```text
No image selected
       │
   Select image
       ↓
Image preview + asset info
       │
     Upload
       ↓
   Uploading
       │
   ┌───┴───┐
   ↓       ↓
Failed   Success
   │       │
 Retry    Result
   │
   └──→ Uploading
```

### Idle

When no image is selected, the upload surface provides the primary image selection entry point.

Users can select an image through the file picker or drag and drop an image onto the upload surface.

### Ready to upload

After selecting an image, the workflow creates a local preview and reads the image dimensions.

The right-side panel exposes temporary asset information including:

* Name
* Type
* Size
* Dimensions

The upload action becomes available once the selected image has been prepared.

### Uploading

Starting an upload moves the workflow into the loading state.

Progress is reported by the simulated upload service and displayed through the preview lifecycle layer.

While uploading, the workflow prevents conflicting asset interactions.

### Failed

The upload service can deterministically fail an upload.

The failed state keeps the selected asset available so the user can retry without selecting the image again.

### Success

A successful upload returns an `UploadedAsset` result.

The result exposes the uploaded asset name and generated ID while the original temporary asset information remains available for inspection.

## Data flow

The selected file is the canonical source for the local asset workflow:

```text
selectedFile
     ↓
object URL
     ↓
local preview
     ↓
image dimensions
     ↓
upload input
     ↓
UploadAsset()
     ↓
uploadedAsset
     ↓
success result
```

The page owns the UI state and interaction flow.

The upload service owns the simulated asynchronous upload behavior and returns the resulting uploaded asset.

The page does not store a second copy of the selected file for upload. The same `File` object is retained so the failed workflow can retry without requiring the user to select the image again.

## State and lifecycle design

The upload workflow uses a small explicit status model:

```ts
type UploadStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'failed'
```

The status controls which actions and messages are available:

```text
idle + no file
  → select image

idle + selected file
  → upload
  → reset

loading
  → no conflicting actions

failed
  → retry
  → reset

success
  → reset
```

The implementation intentionally keeps the state model small instead of introducing a reducer or a larger state machine abstraction that is not required by the current workflow complexity.

## Local preview and resource cleanup

The selected image is previewed using a browser object URL created from the local `File`.

```text
File
 ↓
URL.createObjectURL()
 ↓
<img src={previewUrl}>
```

The object URL is revoked when the selected file changes or the preview effect is cleaned up.

This keeps the preview local and avoids requiring a real storage service for the demo.

Image dimensions are read separately from the preview URL so the upload workflow can pass the actual image dimensions to the simulated upload service.

## Failure and retry behavior

The upload service supports deterministic failure through the upload options.

The first upload attempt can fail intentionally:

```text
Select image
    ↓
Upload
    ↓
Simulated failure
    ↓
Failed
    ↓
Retry
    ↓
Upload succeeds
```

Retry reuses the existing selected file instead of requiring the user to start the workflow again.

This makes failure recovery an explicit part of the demonstrated workflow rather than treating errors as a terminal state.

## Verification

Focused behavior tests cover the main observable workflow:

* Image upload succeeds after retry
* Reset returns the workflow to the initial state
* Image selection works through drag and drop

The tests focus on user-visible behavior rather than internal implementation details.

The Day 6 verification also includes:

* TypeScript type checking
* Lint/build verification
* Accessibility review of labels, image alternative text, buttons, and status communication
* Responsive layout review for the supported viewport behavior

## Limitations

This is a frontend workflow demonstration, not a production asset management system.

The demo does not include:

* Real backend upload APIs
* Cloud storage
* Authentication or permissions
* Persistent asset storage
* Image transformation or editing
* Upload cancellation
* Real network retry policies
* Background processing
* Asset search or management
* Mobile-specific drag-and-drop behavior

The upload service is intentionally simulated so that progress, failure, retry, and lifecycle behavior can be demonstrated deterministically.

The file picker uses the browser's native file input and is therefore the primary image-selection interaction across supported desktop and mobile environments. Drag and drop is treated as an additional convenience interaction rather than a required mobile interaction.

## Demo flow

To explore the successful workflow:

```text
Creator Upload Tool
        ↓
Select an image
        ↓
Preview local image
        ↓
Inspect temporary asset info
        ↓
Upload
        ↓
Observe progress
        ↓
Upload complete
        ↓
Inspect uploaded asset result
```

To explore the recovery workflow:

```text
Select an image
        ↓
Upload
        ↓
Simulated failure
        ↓
Retry
        ↓
Observe progress
        ↓
Upload complete
```

To explore the drag-and-drop workflow:

```text
Upload surface
      ↓
Drag image onto surface
      ↓
Local preview
      ↓
Asset information
      ↓
Upload
```

## Engineering focus

The goal of Day 6 is not to reproduce a complete creator asset platform.

It is to make one small asynchronous workflow explicit and defensible:

```text
local file
   ↓
preview
   ↓
asset metadata
   ↓
upload action
   ↓
async progress
   ↓
success / failure
   ↓
retry / reset
   ↓
resource cleanup
```

The implementation deliberately keeps the workflow small so that the relationship between browser resources, asynchronous state, user interactions, failure recovery, and visible UI behavior remains easy to verify.
