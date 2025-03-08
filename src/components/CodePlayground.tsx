import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import { autocompletion } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
import { Play, RefreshCw, Copy, Check } from 'lucide-react';

interface CodePlaygroundProps {
  initialCode?: string;
  onRun?: (code: string, output: string) => void;
}

export default function CodePlayground({ initialCode = '', onRun }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      // Create a safe console.log replacement
      let outputBuffer = '';
      const safeConsole = {
        log: (...args: any[]) => {
          outputBuffer += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          outputBuffer += '🔴 Error: ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        },
        warn: (...args: any[]) => {
          outputBuffer += '⚠️ Warning: ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        }
      };

      // Create a safe evaluation context
      const evalContext = `
        "use strict";
        const console = {
          log: ${safeConsole.log.toString()},
          error: ${safeConsole.error.toString()},
          warn: ${safeConsole.warn.toString()}
        };
        ${code}
      `;

      // Execute the code in a new Function context
      new Function(evalContext)();
      
      setOutput(outputBuffer || 'Code executed successfully (no output)');
      onRun?.(code, outputBuffer);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(initialCode);
    setOutput('');
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium">JavaScript Playground</h3>
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-1"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={resetCode}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Reset
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 disabled:bg-gray-600"
            >
              <Play size={14} />
              Run
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">
        <div className="border-b lg:border-b-0 lg:border-r border-gray-700">
          <CodeMirror
            value={code}
            height="300px"
            theme={vscodeDark}
            extensions={[
              javascript({ jsx: true }),
              basicSetup(),
              autocompletion(),
              linter(),
              lintGutter()
            ]}
            onChange={(value) => setCode(value)}
            className="text-sm"
          />
        </div>
        
        <div className="bg-black p-4">
          <h4 className="text-gray-400 text-sm mb-2">Output:</h4>
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
            {output || 'Run your code to see the output here...'}
          </pre>
        </div>
      </div>
    </div>
  );
}