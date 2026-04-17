"use client"
import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Inbox, Loader2 } from 'lucide-react'
import { uploadToS3 } from '@/lib/db/s3'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
interface Props {
    
}

const FileUpload = () => {
    const router = useRouter();
const [uploading, setUploading]= React.useState(false);
const {mutate, isPending}= useMutation({
    mutationFn: async ({file_key, file_name}: {file_key: string, file_name: string})=>{
        const response = await axios.post('/api/create-chat', { file_key, file_name });
        return response.data;

    }
})

    const { getRootProps, getInputProps } = useDropzone({
        accept: {'application/pdf': ['.pdf']},
        maxFiles: 1,
      onDrop:async (acceptedFiles)=>{
        console.log("this is accepted file",acceptedFiles)
        const file= acceptedFiles[0];
        if (file.size>10*1024*1024){
            toast.error("File too Large")
            alert("File size exceeds 10MB limit. Please choose a smaller file.");
            return;
        }
        try{
            setUploading(true)
        const data= await uploadToS3(file);
        if (!data?.file_key || !data.file_name){
            toast.error("something went wrong")

            alert("something went wrong");
            return; 
        }
        mutate(data,{
            onSuccess:({chat_id})=>{

               toast.success("Chat Created!");
               router.push(`/chat/${chat_id}`)
            },
            onError:(err)=>{
                console.log("this is error from server", err)
                toast.error("something went wrong")
            }

        })
        }
        catch(error){
           console.log(error)
        }
        finally{
            setUploading(false)
        }
        
      }
})
    return (
        <div className='w-60 p-2 bg-white rounded-xl'>
            <div {...getRootProps({className:"border-2 border-dashed border-gray-300 p-4 rounded-md cursor-pointer"})}>
                <input {...getInputProps()} />
                {(uploading || isPending)?(<><Loader2 className='h-10 w-10 text-blue-500 animate-spin'/>
                <p className='mt-2 text-sm text-slate-400'>
                    Sending your required data to GPT
                </p>
                
                </>):( <>
               <Inbox className='w-10 h-10 text-blue-500' />
               <p className='text-sm text-gray-500'> Drop PDF </p>
               </>)}
              
            </div>
        </div>
    )
}

export default FileUpload
