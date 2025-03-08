import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAIResponse } from './lib/gemini';
import TopicSelector from './components/TopicSelector';
import Chat from './components/Chat';
import SkillAssessment from './components/SkillAssessment';
import { Message, Conversation, UserSkills, UserPreferences, CodeChallenge } from './types';
import { Brain } from 'lucide-react';
import { saveToLocalStorage, getFromLocalStorage } from './utils/storage';

function App() {
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<'react' | 'nodejs' | 'javascript' | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedPreferences = getFromLocalStorage('userPreferences');
    if (savedPreferences) {
      setUserPreferences(savedPreferences);
      
      // Restore last conversation if it exists
      const lastConversation = savedPreferences.conversations[savedPreferences.conversations.length - 1];
      if (lastConversation) {
        setCurrentConversation(lastConversation);
        setSelectedTopic(lastConversation.topic);
      }
    }
  }, []);

  const handleSkillAssessmentComplete = (username: string, skills: UserSkills) => {
    const newPreferences: UserPreferences = {
      username,
      skills,
      conversations: [],
    };
    setUserPreferences(newPreferences);
    saveToLocalStorage('userPreferences', newPreferences);
  };

  const handleTopicSelect = async (topic: 'react' | 'nodejs' | 'javascript') => {
    if (!userPreferences) return;

    setSelectedTopic(topic);
    setLoading(true);
    setError(null);

    try {
      const newConversation: Conversation = {
        id: uuidv4(),
        topic,
        messages: [
          {
            id: uuidv4(),
            role: 'assistant',
            content: `Welcome to the ${topic} learning journey! I see you're at a ${userPreferences.skills[topic].level} level. Let's start with some concepts appropriate for your experience level. What would you like to learn about?`,
            timestamp: Date.now(),
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentConversation(newConversation);
      
      const updatedPreferences = {
        ...userPreferences,
        conversations: [...userPreferences.conversations, newConversation],
      };
      setUserPreferences(updatedPreferences);
      saveToLocalStorage('userPreferences', updatedPreferences);
    } catch (error) {
      setError('Failed to start conversation. Please try again.');
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string, output?: string) => {
    if (!currentConversation || !userPreferences) return;

    setLoading(true);
    setError(null);

    try {
      const newMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: output ? `${content}\n\nCode output:\n${output}` : content,
        timestamp: Date.now(),
      };

      const updatedMessages = [...currentConversation.messages, newMessage];

      const aiResponse = await getAIResponse(
        updatedMessages,
        currentConversation.topic,
        userPreferences.skills[currentConversation.topic].level
      );

      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse.text,
        timestamp: Date.now(),
        codeChallenge: aiResponse.codeChallenge,
      };

      const finalMessages = [...updatedMessages, aiMessage];

      const updatedConversation = {
        ...currentConversation,
        messages: finalMessages,
        updated_at: new Date().toISOString(),
      };

      setCurrentConversation(updatedConversation);
      
      const updatedPreferences = {
        ...userPreferences,
        conversations: userPreferences.conversations.map(conv =>
          conv.id === currentConversation.id ? updatedConversation : conv
        ),
      };
      setUserPreferences(updatedPreferences);
      saveToLocalStorage('userPreferences', updatedPreferences);
    } catch (error) {
      setError('Failed to get AI response. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userPreferences) {
    return <SkillAssessment onComplete={handleSkillAssessmentComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-500" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                AI Learning Platform
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {userPreferences.username}
              </span>
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Change Topic
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {!selectedTopic ? (
          <TopicSelector onSelect={handleTopicSelect} />
        ) : (
          <div className="h-[calc(100vh-12rem)]">
            <Chat
              messages={currentConversation?.messages || []}
              onSendMessage={handleSendMessage}
              loading={loading}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;