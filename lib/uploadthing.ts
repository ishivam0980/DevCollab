import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

//these are pre built react components from uploadthing that handles file uploads
//uploadbutton is a simple button that opens a file picker when clicked.
//uploaddropzone is a drag-and-drop area where users can drag files or click to select.

