import React, { useState, useRef, useEffect } from 'react';
import '../App.css';

const Terminal = () => {
  const dirTree: Record<string, string[]> = {
    home: ['pets', 'hobbies', 'resume'],
    resume: ['chakyeth_resume.pdf'],
    pets: ['fish.jpg', 'egg.jpg', 'fosters1.jpg', 'fosters2.jpg', 'fosters3.jpg'],
    hobbies: ['snowboarding', 'motorcycles', 'coding', 'learning']
  }

  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[][]>([]);
  const [currentDir, setCurrentDir] = useState(Object.keys(dirTree)[0]);
  const [initialText] = useState<string[]>([
    `       *     ,MMM8&&&.            *
            MMMM88&&&&&    .
     .     MMMM88&&&&&&&
           MMM88&&&&&&&&
       *   'MMM88&&&&&&'
             'MMM8&&&'      *
           |\\_____/|
           )       (             .              *
          =\\       /=
            )=====(       *
      *    /       \\         hi, i'm chak 🚀
          |         |        welcome to my
         /           \\       lil terminal
         \\           /
    _/\\_/\\\\____  ___/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_
    |  |  |  |( (  |  |  |  |  |  |  |  |  |  |
    |  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
    |  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
    |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
    |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
    `
    ,
    '✨working commands✨ (a man page if you will):',
    '     ls - display all folders/files',
    '     clear - clear terminal',
    '     cd <directory> - navigate to another folder',
    '     open <file> - open a .pdf or .png file',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const textMeasureRef = useRef<HTMLSpanElement>(null);

  interface Commands {
    ls: () => string;
    clear: () => string;
    cd: (dir: string) => string;
    open: (file: string) => string | Promise<string>;
  }

  const commands: Commands = {
    ls: () => {
      let listDir: string[];
      switch (currentDir) {
        case Object.keys(dirTree)[0]:
          listDir = dirTree.home;
          break;
        case Object.keys(dirTree)[1]:
          listDir = dirTree.resume;
          break;
        case Object.keys(dirTree)[2]:
          listDir = dirTree.pets;
          break;
        case Object.keys(dirTree)[3]:
          listDir = dirTree.hobbies;
          break;
        default:
          listDir = [];
          break;
      }

      return listDir.map((item) => item).join('  ');
    },
    clear: () => {
      setOutput([]);
      return '';
    },
    cd: (dir: string) => {
      if (currentDir === Object.keys(dirTree)[0]) {
        switch (dir) {
          case '~':
          case '..':
            setCurrentDir(Object.keys(dirTree)[0]);
            return 'No change - Currently in home directory';
          case 'resume':
          case 'resume/':
            setCurrentDir(Object.keys(dirTree)[1]);
            return 'Changed to resume directory';
          case 'pets':
          case 'pets/':
            setCurrentDir(Object.keys(dirTree)[2]);
            return 'Changed to pets directory';
          case 'hobbies':
          case 'hobbies/':
            setCurrentDir(Object.keys(dirTree)[3]);
            return 'Changed to hobbies directory';
          default:
            return 'No such directory';
        }
      } else {
        switch (dir) {
          case '~':
          case '..':
            setCurrentDir(Object.keys(dirTree)[0]);
            return 'Changed to home directory';
          default:
            return 'No such directory';
        }
      }
    },
    open: (file: string) => {
      if (currentDir === Object.keys(dirTree)[0] || currentDir === Object.keys(dirTree)[3]){
        return `There are no files available to open.`
      } else if (currentDir === Object.keys(dirTree)[1]) {
        return `available for hire. email me at chak.yeth@gmail.com for my resume. 🙏`
      }

      if (dirTree[currentDir]?.includes(file)) {
        const filePath = `/assets/${currentDir}/${file}`;
        const fullPath = `${window.location.origin}${filePath}`;

        return fetch(fullPath, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              window.open(fullPath, '_blank', 'noopener,noreferrer');
              return `Opening ${file}`;
            } else {
              return 'File not found';
            }
          })
          .catch(() => {
            return 'File not found';
          });
      } else {
        return (`No such file ${file}`);
      }
    },

  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
  
    const [command, ...args] = input.trim().split(' ');
  
    if (command === 'clear') {
      commands.clear();
    } else {
      const result =
        command in commands
          ? await (commands[command as keyof Commands] as (...args: string[]) => Promise<string>)(...args)
          : 'Command not found';
  
      setOutput((prev) => [...prev, [`$ ${input}`, result]]);
    }
  
    setInput('');
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  
    if (textMeasureRef.current) {
      const textWidth = input
        ? textMeasureRef.current.offsetWidth + 10
        : textMeasureRef.current.offsetWidth;
      document.documentElement.style.setProperty('--text-width', `${textWidth}px`);
    }
  }, [input, output]);

  return (
    <div className="terminal-container">
      <div className="terminal">
        <div className="status-bar">
          <div className="window-buttons">
            <div className="red-circle"></div>
            <div className="yellow-circle"></div>
            <div className="green-circle"></div>
          </div>
          <div>user@chakyeth</div>
        </div>
        <div className="output" ref={outputRef}>
          {initialText.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}

          {output.map((line, idx) => (
            <div key={idx} className="output-line">
              <span className="output-prompt">{line[0]}</span>
              <div className="output-response">{line[1]}</div>
            </div>
          ))}
        </div>
        <div className="input">
          <div className="static-input">
            {currentDir === 'home' ? '~/' : `${currentDir}/`}
          </div>
          <div className="dynamic-input">
            <span className="static-input">$</span>
            <span ref={textMeasureRef} className="hidden-text">{input || ' '}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="cursor"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
