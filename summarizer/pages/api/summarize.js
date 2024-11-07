import Groq from 'groq-sdk';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import csv from 'csv-parser';
import fetch from 'node-fetch';
import { Readable } from 'stream';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_TEXT_LENGTH = 5000; // Define a max length for the input text

export default async function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'File upload error.' });
      }

      try {
        let text = req.body.text || '';

        // Extract text from file, if present
        if (req.file) {
          const fileText = await extractTextFromFile(req.file);
          text += fileText;
        }

        // Extract text from link, if present
        if (req.body.link) {
          const linkText = await extractTextFromLink(req.body.link);
          text += linkText;
        }

        // Truncate the text if it exceeds the max length
        text = text.slice(0, MAX_TEXT_LENGTH);

        // Call the summarization API
        const chatCompletion = await getGroqChatCompletion(text);
        res.status(200).json(chatCompletion.choices[0]?.message?.content);
      } catch (error) {
        console.error('Error in /api/summarize handler:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}

async function getGroqChatCompletion(prompt) {
  return groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama3-8b-8192',
  });
}

async function extractTextFromFile(file) {
  const buffer = file.buffer;
  const mimeType = file.mimetype;

  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (mimeType === 'text/csv') {
    return new Promise((resolve, reject) => {
      const results = [];
      Readable.from(buffer.toString())
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results.map(row => Object.values(row).join(' ')).join(' ')))
        .on('error', reject);
    });
  } else {
    throw new Error('Unsupported file type.');
  }
}

async function extractTextFromLink(link) {
  const response = await fetch(link);
  const text = await response.text();
  return text;
}
