import { createUploadthing, type FileRouter } from "uploadthing/next";
import getCurrentUser from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";


const f = createUploadthing();



export const ourFileRouter = {
    
  profileImage: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
        const user=await getCurrentUser();
        if(!user) throw new Error("Unauthorized");
        return { userId: user.id,userName:user.name}; //whatever we write here will be returned after the upload is complete in metadata and url also transfered
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for:", metadata.userName);
      console.log("File URL:", file.url);
      
      // We DO NOT update the database here anymore.
      // The client will receive the file.url and submit it with the profile form.
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
