import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';
import { MessageSquare, Send, Code2 } from 'lucide-react';
import CodePlayground from './CodePlayground';

interface ChatProps {
    messages: Message[];
    onSendMessage: (content: string, output?: string) => void;
    loading?: boolean;
}

export default function Chat({ messages, onSendMessage, loading = false }: ChatProps) {
    const [input, setInput] = useState('');
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onSendMessage(input);
            setInput('');
            setShowCodeEditor(false);
        }
    };

    const handleCodeRun = (code: string, output: string) => {
        if (code.trim()) {
            onSendMessage(`Here's my code solution:\n\`\`\`javascript\n${code}\n\`\`\`\nOutput:\n\`\`\`\n${output}\n\`\`\``, output);
            setShowCodeEditor(false);
        }
    };

    return (
        <div className="flex flex-col h-[40rem] w-full max-w-4xl bg-white rounded-lg shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare size={16} />
                                <span className="font-medium">
                                    {message.role === 'user' ? 'You' : 'AI Tutor'}
                                </span>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>

                            {message.codeChallenge && message.codeChallenge.initialCode && (
                                <div className="mt-4">
                                    <CodePlayground
                                        initialCode={message.codeChallenge.initialCode}
                                        onRun={handleCodeRun}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg animate-pulse flex space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>
                )}
                {showCodeEditor && !loading && (
                    <div className="mt-4">
                        <CodePlayground onRun={handleCodeRun} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowCodeEditor(!showCodeEditor)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Code2 size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={loading ? 'AI is thinking...' : 'Ask a question or request a coding challenge...'}
                        disabled={loading}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
