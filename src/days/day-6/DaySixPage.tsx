import { useState, useEffect, useRef } from "react";
import type { UploadedAsset, UploadStatus } from "./types";
import { UploadAsset } from "./uploadAsset";
import { Link } from "react-router-dom";
import './day-six.css'

export function DaySixPage() {
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const [progress, setProgress] = useState(0);
    const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
    const [hasFailedOnce, setHasFailedOnce] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;

        setSelectedFile(file);
    }

    function handleClear() {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
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
                    <p>Current status: {status}</p>
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
                        </label>
                        <div className="day-six__status">
                            {status === "loading" &&
                                 <p>This is loading UI.{progress}</p>
                            }
                            {status === "success" && (
                                 <p>Upload complete.</p>
                            )}
                            {status === "failed" &&
                                        (
                                            <div>
                                                <p>This is failed UI.</p>
                                                <button
                                                    type="button"
                                                    onClick={handleUpload}>
                                                    Retry
                                                </button>
                                            </div>
                                        )
                            }
                        </div>
                    </div>
                </section>

                <section className="day-six__panel-info">
                    <h2>Asset Info / Actions</h2>
                    {selectedFile && (
                        <div>
                            <p>{selectedFile.name}</p>
                            <p>{selectedFile.type}</p>
                            <p>{selectedFile.size} bytes</p>
                            <p>Dimensions: {imageDimensions?.width} x {imageDimensions?.height} px</p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={
                            !selectedFile ||
                            !imageDimensions ||
                            status === "loading" ||
                            status === "failed"}
                    >
                        Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => handleClear()}
                        disabled={status === "loading"}
                    >clear image</button>
                </section>
            </div>
        </main>
    );
}