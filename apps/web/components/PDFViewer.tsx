import React from 'react';
type Props = {
    pdfUrl: string
}

const PDFViewer=({pdfUrl}: Props)=>{

    console.log("pdfurl", pdfUrl)
return (

   <iframe
  src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
  className="w-full h-full"
/>
)

}
export default PDFViewer;