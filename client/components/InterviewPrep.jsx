import AceEditor from "react-ace";
import Markdown from "react-markdown";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-solarized_dark";
import { useState } from "react";

// import "ldrs/waveform";

const PROBLEMS = [
  "# Write a Python program to check if a string is a palindrome.",
  "# Write a Python program to find the factorial of a number.",
  "# Write a Python program to find the largest element in a list.",
  "# Write a Python program to reverse a string.",
  "# Write a Python program to count the frequency of each element in a list.",
  "# Write a Python program to check if a number is prime.",
  "# Write a Python program to find the common elements between two lists.",
  "# Write a Python program to sort a list of elements using the bubble sort algorithm.",
  "# Write a Python program to find the second largest number in a list.",
  "# Write a Python program to remove duplicates from a list.",
];

export const InterviewPrep = () => {
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [answer, setAnswer] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState();

  function onChange(value) {
    setAnswer(value);
  }

  function randomizeProblem() {
    const randomIndex = Math.floor(Math.random() * PROBLEMS.length);
    const randomProblem = PROBLEMS[randomIndex];
    setProblem(randomProblem);
  }

  async function checkAnswer() {
    setIsLoading(true);

    const response = await fetch("/api/explain/code", {
      method: "POST",
      body: JSON.stringify({
        problem,
        code: answer,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setResult(response.ok ? await response.text() : response.statusText);
    setIsLoading(false);
  }

  return (
    <div className="layout">
      <aside className="intro">
        <p>Use this tool to prepare for your first interview!</p>
        <p>
          Write your solution using python, and check if your answer satisfies
          the problem by clicking "Check your answer". If you want to try a
          different problem, click "Randomize problem".
        </p>
      </aside>

      <main className="main-content">
        <AceEditor
          className="editor"
          editorProps={{ $blockScrolling: true }}
          fontSize={14}
          height="100%"
          mode="python"
          name="editor"
          placeholder={problem}
          showPrintMargin={false}
          theme="solarized_dark"
          wrapEnabled={true}
          onChange={onChange}
        />
        <div className="result">
          {isLoading ? (
            <div className="loader-holder">
              <l-waveform
                size="35"
                stroke="3.5"
                speed="1"
                color="black"
              ></l-waveform>
            </div>
          ) : result ? (
            <Markdown>{result}</Markdown>
          ) : (
            'When you\'re ready, click "Check your answer".'
          )}
        </div>
      </main>

      <footer className="footer-bar">
        <h3 className="problem">{problem}</h3>
        <button disabled={isLoading} onClick={randomizeProblem}>
          Randomize problem
        </button>
        <button
          className="primary"
          disabled={isLoading || !answer}
          onClick={checkAnswer}
        >
          Check your answer
        </button>
      </footer>
    </div>
  );
};
