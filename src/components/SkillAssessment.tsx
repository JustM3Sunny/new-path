import React, { useState } from 'react';
import { UserSkills } from '../types';
import { saveToLocalStorage } from '../utils/storage';

interface SkillAssessmentProps {
  onComplete: (username: string, skills: UserSkills) => void;
}

export default function SkillAssessment({ onComplete }: SkillAssessmentProps) {
  const [username, setUsername] = useState('');
  const [skills, setSkills] = useState<UserSkills>({
    react: { level: 'beginner', experience: '' },
    nodejs: { level: 'beginner', experience: '' },
    javascript: { level: 'beginner', experience: '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(username, skills);
    saveToLocalStorage('userPreferences', { username, skills });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Welcome to AI Learning Platform
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Tell us about your programming experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              What should we call you?
            </label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          {(['javascript', 'react', 'nodejs'] as const).map((tech) => (
            <div key={tech} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {tech} Experience
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Skill Level
                </label>
                <select
                  value={skills[tech].level}
                  onChange={(e) => setSkills({
                    ...skills,
                    [tech]: { ...skills[tech], level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tell us more about your experience
                </label>
                <textarea
                  value={skills[tech].experience}
                  onChange={(e) => setSkills({
                    ...skills,
                    [tech]: { ...skills[tech], experience: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder={`Describe your ${tech} experience...`}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
}