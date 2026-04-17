import React from 'react';
import {redirect} from 'next/navigation';
import {auth} from '@clerk/nextjs/server';
import {db} from '@/lib/db';
import { eq } from 'drizzle-orm';
import { chats } from '@/lib/db/schema';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
import { DrizzleChat } from '@/lib/db/schema';
type Props = {
    params:{
        
        chatId:string
    }
};

const ChatPage= async ({params:{chatId}}:Props)=>{
const {userId} = await auth();
if(!userId){
    return redirect('/sign-in')
}

const _chats= await db.select().from(chats).where(eq(chats.userId,userId)).execute();

if(!_chats){
    return redirect("/");

}

console.log("_chats here", _chats);
// if(!_chats.find(chat=>chat.id===parseInt(chatId))){
//     return redirect('/');

// }


const currentChat= _chats.find(chat =>chat.id===parseInt(chatId));

    return( <div className='flex max-h-screen overflow-scroll'>
<div className='flex w-full max-h-screen overflow-scroll'>

<div className='flex-1 max-m-xb'>
 <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
</div>
<div className='max-h-screen p-4 overflow-scroll flex-5'>
<PDFViewer pdfUrl={currentChat?.pdfUrl || ''} />
</div>
<div className='flex-3 border-1-4 border-1-slate-200'> 

</div>
</div>
    </div>
    )
}
export default ChatPage;