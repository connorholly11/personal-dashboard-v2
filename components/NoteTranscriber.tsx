
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import OpenAI from 'openai';
import { useAuth } from '../contexts/AuthContext'
interface Recording {
  id: string;
  date: Date;
  audioUrl: string;
  transcript: string;
}

const NoteTranscriber: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

  useEffect(() => {
    const q = query(collection(db, 'recordings'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordingsData: Recording[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as Recording));
      setRecordings(recordingsData);
    });

    return () => unsubscribe();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Error accessing microphone. Please check your permissions.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        try {
          console.log('Transcribing audio...');

          // Create a File object from the Blob
          const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

          const response = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
          });

          console.log('Transcription result:', response);

          const newRecording: Omit<Recording, 'id'> = {
            date: new Date(),
            audioUrl,
            transcript: response.text,
          };

          await addDoc(collection(db, 'recordings'), newRecording);

          setTranscript(newRecording.transcript);
        } catch (err: any) {
          console.error('Error transcribing audio:', err);
          setError(`Error transcribing audio: ${err.message}`);
        }
      };
    }
  };

  const playRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setTranscript(recording.transcript);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Note Transcriber</h2>
      <div className="flex space-x-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-full ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {transcript && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Latest Transcript:</h3>
          <p className="bg-gray-100 p-4 rounded-md min-h-[100px]">{transcript}</p>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Past Recordings:</h3>
        <ul className="space-y-2">
          {recordings.map((recording) => (
            <li key={recording.id} className="bg-gray-100 p-4 rounded-md">
              <p>Date: {new Date(recording.date).toLocaleString()}</p>
              <button
                onClick={() => playRecording(recording)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Play & View Transcript
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedRecording && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Selected Recording:</h3>
          <audio controls src={selectedRecording.audioUrl} className="w-full mb-4" />
          <p className="bg-gray-100 p-4 rounded-md">{selectedRecording.transcript}</p>
        </div>
      )}
    </div>
  );
};

export default NoteTranscriber;

