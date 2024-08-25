'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert({ user_id: user?.id, content: input, role: 'user' })
        .select();

      if (error) throw error;

      // Simulate AI response (replace this with actual AI integration)
      const aiResponse = "This is a placeholder response. In a real implementation, this would be the response from Claude AI.";

      // Save AI response to Supabase
      const { error: aiError } = await supabase
        .from('messages')
        .insert({ user_id: user?.id, content: aiResponse, role: 'assistant' });

      if (aiError) throw aiError;

      const assistantMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Chat with Claude</h2>
      <div className="h-80 overflow-y-auto mb-4 border rounded-md p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-center">
            <span className="inline-block p-2 rounded-lg bg-gray-200">
              Claude is thinking...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {isAuthenticated ? (
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow border rounded-l-md p-2"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Please log in to send messages.</p>
      )}
    </div>
  );
};

export default Chatbot;