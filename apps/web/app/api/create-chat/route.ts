import { loads3IntoPinecone } from "@/lib/pinecone";
import { db } from "@/lib/db";
import {NextResponse} from "next/server";
import { chats } from "@/lib/db/schema";
import { getS3Url } from "@/lib/db/s3";
import { auth } from "@clerk/nextjs/server";
export async function POST(request:Request, response:Response){
const {userId}= await auth();
if(!userId){
return NextResponse.json({message:"Unauthorized"}, {status:401});
}
try{
const body= await request.json();
const {file_key, file_name}= body;
console.log("this is the file_key, file_name",file_key, file_name);
await loads3IntoPinecone(file_key);
const chat_Id= await db.insert(chats).values({
FileKey:file_key,
pdfName:file_name,
pdfUrl:getS3Url(file_key),
userId,
}).returning({
    insertedId:chats.id,
})


return NextResponse.json({chat_id:chat_Id[0].insertedId},{status:200});
}
catch(error){
console.log("error")
return NextResponse.json({message:"Internal Server Error"}, {status:500});
} 
}