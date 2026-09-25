import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DaySixPage } from "./DaySixPage";
import { MemoryRouter } from "react-router-dom";

class MockImage {
    naturalWidth = 1920;
    naturalHeight = 1080;

    onload: (() => void) | null = null;

    set src(_value: string) {
        this.onload?.();
    }
}

globalThis.Image = MockImage as unknown as typeof Image;


describe('Day 6 upload workflow', () => {
    it("uploads an image successfully after retry", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <DaySixPage />
            </MemoryRouter>
        );

        const file = new File(
            ["fake image content"],
            "test-image.png",
            { type: "image/png" }
        );

        const input = screen.getByLabelText(/upload an image/i);

        // load preview image
        await user.upload(input, file);

        expect(
            screen.getByText("test-image.png")
        ).toBeInTheDocument();

        // click upload behavior
        const uploadButton = screen.getByRole("button", {
            name: "Upload",
        })

        await user.click(uploadButton);

        expect(
            screen.getByText("Uploading…")
        ).toBeInTheDocument();

        // first time failed
        expect(
            await screen.findByText("Upload failed. You can retry this upload.")
        ).toBeInTheDocument();

        // clicked retry button
        const retryButton = await screen.findByRole("button", {
            name: "Retry",
        });

        await user.click(retryButton);

        expect(
            await screen.findByText("Uploading…")
        ).toBeInTheDocument();

        expect(
            await screen.findByText(
                "Upload complete",
                {},
                { timeout: 2000 }
            )
        ).toBeInTheDocument();
    })

    it("resets the workflow to idle", async () => {

        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <DaySixPage />
            </MemoryRouter>
        );

        const file = new File(
            ["fake image content"],
            "test-image.png",
            { type: "image/png" }
        );

        const input = screen.getByLabelText(/upload an image/i);

        await user.upload(input, file);

        expect(
            screen.getByText("test-image.png")
        ).toBeInTheDocument();

        const resetButton = screen.getByRole("button", {
            name: "Reset",
        });

        await user.click(resetButton);

        expect(
            screen.getByText("No image selected")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("test-image.png")
        ).not.toBeInTheDocument();
    })

    it("selects an image through drag and drop", async () => {

        render(
            <MemoryRouter>
                <DaySixPage />
            </MemoryRouter>
        );

        const file = new File(
            ["fake image content"],
            "dragged-image.png",
            { type: "image/png" }
        );

        const dropZone = document.querySelector(
            ".day-six__upload-surface"
        );

        fireEvent.drop(dropZone!, {
            dataTransfer: {
                files: [file],
            }
        })
    });
})