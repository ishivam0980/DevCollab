import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export default async function getCurrentUser(){
    const session=await getServerSession(authOptions);
    return session?.user||null;
}

//session.user structure 
/*
{
  session.user = {
  id: string,           // User's MongoDB ObjectId
  name: string,         // User's name
  email: string,        // User's email
  image: string,        // Profile picture URL
  provider: string      // Auth provider ('credentials', 'google', 'github')

  Why these fields ?

  see lib/auth.ts
  // In lib/auth.ts (authorize function)
return {
  id: user._id.toString(),  // ← "507f1f77bcf86cd799439011"
  email: user.email,
  name: user.name,
  image: user.image
  provider: user.provider
};


}
*/