import { useState } from "react";
import type { UploadStatus } from "./types";
import { Link } from "react-router-dom";
import './day-six.css'

export function DaySixPage(){
    const [status, setStatus] = useState<UploadStatus>('idle');
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

                <p>File name</p>
                <p>File type</p>
                <p>File size</p>
                <p>Dimensions</p>

                <button type="button">
                    Upload
                </button>
            </section>
        </div>
    </main>
);
}