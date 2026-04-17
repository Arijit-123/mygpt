import { Pinecone , PineconeRecord} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getEmbeddings } from "./embeddings";
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter';
import md5 from "md5";
import { convertToAscii } from "./utils";
let pinecone:Pinecone|null = null;
export const getPineconeClient= async()=>{
    if(!pinecone){
        pinecone= new Pinecone({
            apiKey: process.env.PINECONE_KEY!,})
        
    }
    return pinecone;
}


type PDFPage={
    pageContent:string;
    metadata:{
        loc:{pageNumber:number}

    }
}

export async function loads3IntoPinecone(fileKey:string){

console.log("loading s3 into file system")
const file_name= await downloadFromS3(fileKey);
    if (!file_name){
        throw new Error("Could not download from S3");
        
    }
    const loader= new PDFLoader(file_name);
        const pages= (await loader.load()) as PDFPage[];
        
    const documents= await Promise.all(pages.map(prepareDocument))
    const vectors= await Promise.all(documents.flat().map(embedDocument))
    console.log("total vectors before filter:", vectors.length)
    console.log("vectors content:", vectors) ;
    console.log("total vectors after filter:", vectors.filter(Boolean).length)

  

    const client = await getPineconeClient();
    const PineconeIndex= client.Index('chatnew-pdf');
    console.log("inserting vectors  to pinecone")
    const namespace= convertToAscii(fileKey);
    // PineconeUtils.chunkedUpsert(PineconeIndex, vectors, namespace)
    const chunkSize=10;
   const validVectors = vectors.filter(Boolean) as PineconeRecord[];
      console.log("validVectors length:", validVectors.length)
    try{
    for (let i=0; i<validVectors.length;i+=chunkSize){       
     const chunk= validVectors.slice(i,i+chunkSize);
     await PineconeIndex.namespace(namespace).upsert({ records: chunk });
    }

}catch(error){
console.log("error upserting to pinecone", error);
}
}

async function embedDocument(doc: Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent);
        console.log("embeddings received:", embeddings?.length) // ← add this
        const hash = md5(doc.pageContent)
        const vector = {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        }
        console.log("vector built:", vector.id) // ← and this
        return vector;
    } catch(error) {
        console.error("error embedding document", error)
        throw error;
    }
}


export const truncateStringByBytes= (str:string,bytes:number)=>{
    const enc= new TextEncoder();
    return new TextDecoder().decode(enc.encode(str).slice(0,bytes));
}

async function prepareDocument(page:PDFPage){

let {pageContent, metadata} = page;
 pageContent= pageContent.replace(/\n/g,'')
const splitter= new RecursiveCharacterTextSplitter();
const docs= await splitter.splitDocuments([
    new Document({
        pageContent,
        metadata:{
            pageNumber: metadata.loc.pageNumber,
            text: truncateStringByBytes(pageContent,36000)
        }
    })
])
return docs;
}