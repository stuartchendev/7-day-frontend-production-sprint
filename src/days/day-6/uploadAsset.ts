import type { UploadInput, UploadOptions, UploadedAsset } from "./types";

function wait(ms:number){
    return new Promise((resolve)=>{
        setTimeout(resolve, ms)
    })
}

export async function UploadAsset(
    input: UploadInput,
    options?: UploadOptions,
):Promise<UploadedAsset>{
    const { file, dimensions }= input;

    options?.onProgress?.(0);

    if (options?.shouldFail) {
        throw new Error("Simulated upload failure");
    }

    await wait(300);

    options?.onProgress?.(30);
    await wait(300);

    options?.onProgress?.(70);
    await wait(300);

    options?.onProgress?.(100);

    return{
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
    }
}