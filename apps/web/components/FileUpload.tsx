"use client"
import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Inbox } from 'lucide-react'
interface Props {
    
}

const FileUpload = (props: Props) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: {'application/pdf': ['.pdf']},
        maxFiles: 1,
      onDrop:(acceptedFiles)=>{
        console.log("this is accepted file",acceptedFiles)
        const file= acceptedFiles[0];
      }
})
    return (
        <div className='w-60 p-2 bg-white rounded-xl'>
            <div {...getRootProps({className:"border-2 border-dashed border-gray-300 p-4 rounded-md cursor-pointer"})}>
                <input {...getInputProps()} />
               <>
               <Inbox className='w-10 h-10 text-blue-500' />
               <p className='text-sm text-gray-500'> Drop PDF </p>
               </>
            </div>
        </div>
    )
}

export default FileUpload
