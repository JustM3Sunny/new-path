export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeChallenge?: CodeChallenge;
};

export type CodeChallenge = {
  initialCode: string;
  expectedOutput?: string;
  description: string;
};

export type Conversation = {
  id: string;
  topic: 'react' | 'nodejs' | 'javascript';
  messages: Message[];
  created_at: string;
  updated_at: string;
};

export type UserSkills = {
  react: {
    level: 'beginner' | 'intermediate' | 'advanced';
    experience: string;
  };
  nodejs: {
    level: 'beginner' | 'intermediate' | 'advanced';
    experience: string;
  };
  javascript: {
    level: 'beginner' | 'intermediate' | 'advanced';
    experience: string;
  };
};

export type UserPreferences = {
  username: string;
  skills: UserSkills;
  conversations: Conversation[];
};