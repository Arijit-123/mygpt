import { Button } from "@/components/ui/button"
import { UserButton, } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
export default async function Home() {


  const { userId } = await auth();
  console.log("auth123",userId);
  const test= await auth();
  console.log("auth123",test);
  const isAuth = userId ? true : false;
  
return (
  <>
  <div className="w-screen min-h-screen bg-linear-to-r from-rose-100 to-teal-100  ">

<div className="absolute top-1/2 left-1/2 transalate-x-[-50%] translate-y-[-50%] text-center">
   <div className="flex flex-col items-center text-center">
<div className="flex items-center">
  <h1 className="mr-3 text-5xl  font-semibold">
    Chat with pdf
  </h1>
<UserButton afterSignOutUrl="/" />
</div>

<div className="flex mt-2 ">
  {isAuth && 
<Button className="bg-amber-400"> Go to Chats</Button>
}

</div>

<p className="max-w-xl mt-2 text-lg text-slot-8000 "> Derieve unique perspective from your documents using Ai </p>

<div>
  {isAuth ?(<h1> <FileUpload/></h1>):(
   <Link href="/sign-in"><Button variant="outline"><LogIn/>Log in to get started</Button></Link>
  )}
</div>
   </div>
</div>

  </div>

  </>
)
}