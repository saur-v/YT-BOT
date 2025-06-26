from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain.retrievers.multi_query import MultiQueryRetriever
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from youtube_transcript_api import YouTubeTranscriptApi
from langchain.text_splitter import RecursiveCharacterTextSplitter
import torch
torch_device = "cpu"


load_dotenv()
os.environ["CUDA_VISIBLE_DEVICES"] = ""  # Ensures no GPU usage

@api_view(['POST'])
def rag_query_view(request):
    question = request.data.get('question')
    video_id = request.data.get('video_id')

    if not question or not video_id:
        return Response({"error": "Missing 'question' or 'video_id'"}, status=400)
    
    embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)

    try:
        vectorstore = FAISS.load_local(
            f"/data/faiss_index_{video_id}", embeddings, allow_dangerous_deserialization=True
        )
    except Exception as e:
        return Response({"error": "Index not found. Please index the video first."}, status=404)

    try:
        llm = ChatOpenAI(
            model="mistralai/mistral-7b-instruct",
            openai_api_base="https://openrouter.ai/api/v1",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.2,
        )

        retriever = MultiQueryRetriever.from_llm(vectorstore.as_retriever(), llm)

        prompt = PromptTemplate(
            template="""
            You are a helpful assistant.
            Answer ONLY from the provided transcript context.
            If the context is insufficient, just say you don't know.

            {context}
            Question: {question}
            """,
            input_variables=["context", "question"]
        )

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        parser = StrOutputParser()

        main_chain = (
            RunnableParallel({
                "context": retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough()
            }) | prompt | llm | parser
        )

        answer = main_chain.invoke(question)

        return Response({"question": question, "answer": answer})

    except Exception as e:
        return Response({"error": "Failed to generate an answer. Try again later."}, status=500)


@api_view(['POST'])
def index_video_view(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        video_id = data.get("video_id")

        if not video_id:
            return JsonResponse({"error": "Missing video_id"}, status=400)

        os.makedirs("/data", exist_ok=True)
        index_path = os.path.join("/data", f"faiss_index_{video_id}")


        if os.path.exists(index_path):
            return JsonResponse({"message": f"Video {video_id} is already indexed."})
        
        # Step 1: Fetch transcript
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        except Exception as e:
            return JsonResponse({"error": "Transcript not available in English or is disabled for this video."}, status=400)

        full_text = " ".join(chunk["text"] for chunk in transcript_list)

        # Step 2: Split text
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.create_documents([full_text])

        # Step 3: Embed and save
        

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}  # Force CPU
)
        
        vectorstore = FAISS.from_documents(chunks, embeddings)
        vectorstore.save_local(index_path)

        return JsonResponse({"message": f"Indexing complete for video ID: {video_id}"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
