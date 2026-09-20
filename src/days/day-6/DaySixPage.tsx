import { useState, useEffect, useRef } from "react";
import type { UploadedAsset, UploadStatus, ImageDimensions } from "./types";
import { UploadAsset } from "./uploadAsset";
import { Link } from "react-router-dom";
import './day-six.css'

export function DaySixPage() {
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
    const [progress, setProgress] = useState(0);
    const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
    const [hasFailedOnce, setHasFailedOnce] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const BYTES_PER_UNIT = 1024;
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;

        setSelectedFile(file);
    }

    function handleClear() {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        setStatus('idle');
        setProgress(0);
    }
    // for preview url
    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [selectedFile]);

    // for image width/height
    useEffect(() => {
        if (!previewUrl) {
            setImageDimensions(null);
            return;
        }
        const image = new Image();

        image.onload = () => {
            setImageDimensions({
                width: image.naturalWidth,
                height: image.naturalHeight,
            })
        }

        image.src = previewUrl;
    }, [previewUrl])

    async function handleUpload() {
        if (!selectedFile || !imageDimensions) {
            return;
        }

        setStatus("loading");
        setProgress(0);
        try {
            const result = await UploadAsset(
                {
                    file: selectedFile,
                    dimensions: imageDimensions,
                },
                {
                    onProgress: setProgress,
                    shouldFail: !hasFailedOnce,
                },
            )
            setUploadedAsset(result);
            setStatus("success");
        } catch (error) {
            setHasFailedOnce(true);
            setStatus("failed");
        }
    }

    function formatFileType(type: string) {
        if (!type) {
            return "Unknown";
        }
        const [_, subType] = type.split("/");
        if (!subType) {
            return type;
        }
        return `${subType.toUpperCase()} image`;
    }

    function formatFileSize(size: number) {
        if (size < BYTES_PER_UNIT) {
            return `${size} B`;
        }

        const kb = size / BYTES_PER_UNIT

        if (kb < BYTES_PER_UNIT) {
            return `${kb.toFixed(2)} KB`;
        }

        const mb = kb / BYTES_PER_UNIT

        if (mb < BYTES_PER_UNIT) {
            return `${mb.toFixed(2)} MB`;
        }

        const gb = mb / BYTES_PER_UNIT

        if (gb < BYTES_PER_UNIT) {
            return `${gb.toFixed(2)} GB`;
        }


    }

    function formatDimensions(dimensions: ImageDimensions | null) {
        if (!dimensions) {
            return "Unknown";
        }

        return `${dimensions.width} x ${dimensions.height} px`;
    }

    return (
        <main className="day-six">
            <div className="day-six__intro">
                <Link className="day-six__back-link" to="/">
                    ← Back to Sprint Home
                </Link>

                <header className="day-six__header">
                    <p className="day-six__eyebrow">
                        Day 6 · Creator upload tool
                    </p>

                    <h1>Preview, upload, recover</h1>

                    <p>
                        A small creator asset workflow with local preview,
                        async upload progress, and explicit failure recovery.
                    </p>
                </header>
            </div>
            <div className="day-six__workspace">
                <section className="day-six__panel-preview">
                    <h2>Preview / Lifecycle</h2>
                    <div className="day-six__upload-area">
                        <label className="day-six__upload-surface">
                            {!previewUrl && (
                                <div className="day-six__upload-placeholder">
                                    <div className="day-six__upload-empty">
                                        <strong>Upload an image</strong>
                                        <span>Drop an image here or click to browse.</span>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={status === "loading"}
                                    />
                                </div>
                            )}

                            {previewUrl && (
                                <img
                                    className="day-six__preview"
                                    src={previewUrl}
                                    alt="Selected preview"
                                />
                            )}
                            <div className={`day-six__status ${status}`}>
                                {status === "loading" && (
                                    <div
                                        className="day-six__progress"
                                        style={{ width: `${progress}%` }}
                                    />
                                )}

                                {status === "success" && (
                                    <div className="day-six__result" aria-hidden="true">
                                        ✓
                                    </div>
                                )}

                                {status === "failed" && (
                                    <div className="day-six__result" aria-hidden="true">
                                        ×
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </section>

                <section className="day-six__panel-info">
                    <h2>Asset Info / Actions</h2>

                    <div className="day-six__status-info">
                        <span>STATUS</span>
                        {status === "idle" && (
                            <p>No image selected</p>
                        )}

                        {status === "loading" && (
                            <p>Uploading…</p>
                        )}

                        {status === "success" && uploadedAsset && (
                            <>
                                <p>Upload complete</p>
                                <p>Name: {uploadedAsset.name}</p>
                                <p>ID: {uploadedAsset.id}</p>
                            </>
                        )}

                        {status === "failed" && (
                            <p>Upload failed. You can retry this upload.</p>
                        )}
                    </div>

                    <div className="day-six__asset-info">
                        {!selectedFile && (
                            <p>
                                Choose an image to preview and upload.
                            </p>
                        )}

                        {selectedFile && (
                            <div className="day-six__asset-metadata">
                                <span>TEMPORARY ASSET</span>

                                <p>{selectedFile.name}</p>
                                <p>{formatFileType(selectedFile.type)}</p>
                                <p>{formatFileSize(selectedFile.size)}</p>
                                <p>{formatDimensions(imageDimensions)}</p>
                            </div>
                        )}
                    </div>

                    <div className="day-six__actions">
                        {status === "idle" && (
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || !imageDimensions}
                            >
                                Upload
                            </button>
                        )}

                        {status === "failed" && (
                            <button
                                type="button"
                                onClick={handleUpload}
                            >
                                Retry
                            </button>
                        )}

                        {(status === "success" || status === "failed") && (
                            <button
                                type="button"
                                onClick={handleClear}
                            >
                                Reset
                            </button>
                        )}

                    </div>
                </section>
            </div>
        </main >
    );
}