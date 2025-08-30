'use client';

import { useState } from 'react';

const Dashboard = () => {
  const [salary, setSalary] = useState('');
  const [goals, setGoals] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    housing: false,
    utilities: false,
    food: false,
    transportation: false,
    health: false,
  });

  const [yearlyExpenses, setYearlyExpenses] = useState({
    insurance: false,
    tax: false,
    medical: false,
    travel: false,
    maintenance: false,
  });

  const [messages, setMessages] = useState<
    { role: string; content: JSX.Element | string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveDetails = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: (
          <p>
            ✅ Got it! Salary: <strong>${salary}</strong>. Expenses saved. Now
            tell me your <strong>financial goals</strong> 👉
          </p>
        ),
      },
    ]);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if details are filled before goals
    if (
      !salary ||
      (Object.values(monthlyExpenses).every((val) => !val) &&
        Object.values(yearlyExpenses).every((val) => !val))
    ) {
      setErrorMessage('⚠️ Please enter your salary and select expenses first.');
      return;
    }

    if (!goals.trim()) {
      setErrorMessage('⚠️ Please tell me your financial goals before sending.');
      return;
    }

    setErrorMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: goals }]);
    const userGoal = goals;
    setGoals('');
    setLoading(true);

    try {
      // Show simulated typing/loading effect
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⏳ Loading...' },
      ]);

      await new Promise((res) => setTimeout(res, 1000));

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '⚙️ Processing your details...' },
      ]);

      await new Promise((res) => setTimeout(res, 1000));

      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salary,
          goals: userGoal,
          monthlyExpenses,
          yearlyExpenses,
        }),
      });

      const result = await response.json();

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: result.advice || 'No advice available.' },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Error fetching advice. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Content Area */}
      <main className="flex-1 flex flex-col p-6 space-y-6">
        {/* Interactive Form */}
        <div className="bg-gray-800 text-white p-6 rounded-lg">
          <p className="mb-2">
            👋🏻 Hi! I am your <strong>Personal Finance Advisor 😊 </strong>
          </p>
          <p className="mb-4">
            Please enter your <strong>monthly salary</strong>, select your
            expenses, and then tell me your <strong>financial goals</strong>{' '}
            in the chat 👇🏻
          </p>

          {/* Salary Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Enter Your Monthly Salary
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500"
              placeholder="e.g. 5000"
            />
          </div>

          {/* Monthly Expenses */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Monthly Expenses</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(monthlyExpenses).map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      monthlyExpenses[key as keyof typeof monthlyExpenses]
                    }
                    onChange={(e) =>
                      setMonthlyExpenses((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>

          {/* Yearly Expenses */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Yearly Expenses</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(yearlyExpenses).map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={yearlyExpenses[key as keyof typeof yearlyExpenses]}
                    onChange={(e) =>
                      setYearlyExpenses((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveDetails}
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          >
            Save Details
          </button>
        </div>

        {/* Error message above chat */}
        {errorMessage && (
          <div className="bg-red-500 text-white p-2 rounded text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-gray-900 p-4 rounded-lg overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 p-3 rounded-lg max-w-[75%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white self-end ml-auto text-right'
                  : 'bg-gray-700 text-white self-start mr-auto text-left'
              }`}
            >
              <div>{msg.content}</div>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={handleGoalSubmit}
          className="mt-2 w-full flex items-center bg-gray-800 rounded-full px-3 py-2"
        >
          {/* Input Field */}
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Tell me your goals... e.g. Save for a house"
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
          />

          {/* Send Button */}
          <button
            type="submit"
            className="bg-white text-black rounded-full p-2 ml-2 hover:bg-gray-200"
            disabled={loading}
          >
            ⬆
          </button>
        </form>
      </main>
    </div>
  );
};

export default Dashboard;
