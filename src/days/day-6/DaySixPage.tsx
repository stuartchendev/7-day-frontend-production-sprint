import { useState, useEffect } from "react";
import type { UploadStatus } from "./types";
import { Link } from "react-router-dom";
import './day-six.css'

export function DaySixPage(){
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [selectedFile, setSelectedFile] = useState<File|null>(null);
    const [previewUrl, setPreviewUrl] = useState<string|null>(null);
    const [imageDimensions, setImageDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>){
        const file = event.target.files?.[0] ?? null;

        setSelectedFile(file);
    }

    function handleClear() {
        setSelectedFile(null);
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
    useEffect(()=>{
        if(!previewUrl){
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
            <section>
                <h2>Preview / Lifecycle</h2>

                <p>Current status: {status}</p>

                <input
                    type="file"
                    accept="image/"
                    onChange={handleFileChange}
                />
                <button type="button" onClick={()=>handleClear()}>clear image</button>
                {previewUrl && (
                    <img 
                        src={previewUrl}
                        alt="Selected preview"
                    />
                )}
                {status === "idle" &&
                    <p>This is idle UI.</p>
                }

                {status === "loading" &&
                    <p>This is loading UI.</p>
                }

                {status === "success" &&
                    <p>This is success UI.</p>
                }

                {status === "failed" &&
                    <p>This is failed UI.</p>
                }

                <div>
                    <button
                        type="button"
                        onClick={() => setStatus("idle")}
                    >
                        idle
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatus("loading")}
                    >
                        loading
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatus("success")}
                    >
                        success
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatus("failed")}
                    >
                        failed
                    </button>
                </div>
            </section>

            <section>
                <h2>Asset Info / Actions</h2>
                {selectedFile && (
                    <div>
                        <p>{selectedFile.name}</p>
                        <p>{selectedFile.type}</p>
                        <p>{selectedFile.size} bytes</p>
                        <p>Dimensions: {imageDimensions?.width} x {imageDimensions?.height} px</p>
                    </div>
                )}
                <button type="button">
                    Upload
                </button>
            </section>
        </div>
    </main>
);
}