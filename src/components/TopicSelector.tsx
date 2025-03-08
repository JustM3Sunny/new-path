import React from 'react';
import { Code2, Server, FileCode } from 'lucide-react';

interface TopicSelectorProps {
  onSelect: (topic: 'react' | 'nodejs' | 'javascript') => void;
}

export default function TopicSelector({ onSelect }: TopicSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
      <button
        onClick={() => onSelect('javascript')}
        className="flex flex-col items-center p-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl text-white hover:shadow-lg transform hover:-translate-y-1 transition-all"
      >
        <FileCode size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Learn JavaScript</h2>
        <p className="text-center text-yellow-100">
          Master the fundamentals of programming with JavaScript
        </p>
      </button>

      <button
        onClick={() => onSelect('react')}
        className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white hover:shadow-lg transform hover:-translate-y-1 transition-all"
      >
        <Code2 size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Learn React</h2>
        <p className="text-center text-blue-100">
          Master modern web development with React through interactive lessons
        </p>
      </button>

      <button
        onClick={() => onSelect('nodejs')}
        className="flex flex-col items-center p-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl text-white hover:shadow-lg transform hover:-translate-y-1 transition-all"
      >
        <Server size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Learn Node.js</h2>
        <p className="text-center text-green-100">
          Build powerful backend applications with Node.js step by step
        </p>
      </button>
    </div>
  );
}