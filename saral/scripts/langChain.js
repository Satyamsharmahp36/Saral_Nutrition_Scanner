import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_KEY,
})

export async function getAnswer(question) {
  let answer = ""
  try {
    answer = await llm.predict(question)
  } catch (e) {
    console.error(e)
  }
  return answer
}
