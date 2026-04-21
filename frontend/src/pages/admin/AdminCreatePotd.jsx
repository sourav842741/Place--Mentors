import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAdminCreate } from '../../hooks/useAdminCreate';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from "../../services/api.js";

const AdminCreatePotd = () => {
  const [questions, setQuestions] = useState([{ id: 1, text: '', options: ['', '', '', ''], correct: '', difficulty: 'easy', category: '', explanation: '' }]);
  const { loading, error, success, createPotd } = useAdminCreate();
  const navigate = useNavigate();

  const addQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([...questions, { id: newId, text: '', options: ['', '', '', ''], correct: '', difficulty: 'easy', category: '', explanation: '' }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (id, index, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, options: q.options.map((opt, i) => i === index ? value : opt) } : q));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (questions.length < 15) {
      console.log(" Less than 15 questions");
      toast.error('Minimum 15 questions required for POTD');
      return;
    }

    const hasEmpty = questions.some(q => 
      !q.text.trim() || 
      q.options.some(o => !o.trim()) || 
      !q.correct || 
      !q.explanation.trim() ||
      !q.category
    );
    if (hasEmpty) {
      console.log(" Empty fields detected");
      toast.error('Please fill all fields completely');
      return;
    }

    const potdData = {
      questions: questions.map(q => ({
        question: q.text.trim(),
        options: q.options.map(o => o.trim()),
        answer: q.correct,
        explanation: q.explanation.trim(),
        category: q.category,
        difficulty: q.difficulty
      }))
    };

    
    try {
      await createPotd(potdData);
  
      toast.success('POTD created successfully!');
      navigate('/admin/potd');
    } catch (err) {
   
      toast.error(error || 'Failed to create POTD');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 lg:ml-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent dark:text-white">
            Create Manual POTD
          </h1>
          <p className="text-xl text-gray-600 mt-2 dark:text-white">Create custom Problem of the Day (Minimum 15 questions)</p>
        </div>
        <Badge variant="secondary" className="text-lg px-6 py-3">
          {questions.length} Questions
        </Badge>
        <Button
    type="button"
    onClick={async () => {
      try {
        await api.post("/api/potd/generate");
        toast.success(" POTD Generated!");
      } catch {
        toast.error("Failed to generate");
      }
    }}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl ml-5"
  >
    ⚡ Quick Trigger Potd Question
  </Button>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white font-bold text-2xl">
              {questions.length}/15+
            </div>
            Question List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, qIndex) => (
            <div key={`question-${question.id}`} className="p-6 border border-gray-200 dark:border-gray-700 rounded-3xl bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-slate-900/50 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    Q{qIndex + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Question {qIndex + 1}</h3>
                </div>
                {questions.length > 1 && (
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Question Text */}
              <div className="space-y-2 mb-8">
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Question Text</label>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                  placeholder="Enter the question..."
                  className="h-16 text-xl resize-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Options</label>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3 p-4 border rounded-2xl bg-white/50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {String.fromCharCode(65 + oIndex)}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 block mb-2">Correct Answer</label>
                  <Select value={question.correct} onValueChange={(v) => updateQuestion(question.id, 'correct', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 block mb-2">Difficulty</label>
                  <Select value={question.difficulty} onValueChange={(v) => updateQuestion(question.id, 'difficulty', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 block mb-2">Category</label>
                 <Select
  value={question.category}
  onValueChange={(v) => updateQuestion(question.id, 'category', v)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="aptitude">Aptitude</SelectItem>
    <SelectItem value="reasoning">Reasoning</SelectItem>
    <SelectItem value="verbal">Verbal</SelectItem>
    <SelectItem value="technical">Technical</SelectItem>
  </SelectContent>
</Select>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Explanation</label>
                <Input
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                  placeholder="Detailed explanation for this question..."
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Question Button */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <Button 
              type="button"
              onClick={addQuestion} 
              size="lg" 
              className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-2xl text-xl px-12 py-8 rounded-3xl font-bold transform hover:scale-105 transition-all"
            >
              <Plus className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
              Add Another Question
            </Button>
          </CardContent>
        </Card>

      {/* Submit Section */}
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-12 pt-8">
          {questions.length < 15 && (
            <div className="flex items-center gap-3 p-6 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-3xl mb-8">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="font-bold text-xl text-orange-800 dark:text-orange-300">Minimum 15 Questions Required</h3>
                <p className="text-orange-700 dark:text-orange-200 mt-1">Add {15 - questions.length} more questions to enable submit</p>
              </div>
            </div>
          )}
          <div className="flex gap-4 justify-end">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/admin/potd')}
              className="px-12 py-8 rounded-3xl font-bold text-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading || questions.length < 15}
              size="lg"
              className="px-16 py-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-2xl text-xl rounded-3xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Creating POTD...
                </>
              ) : (
                'Create POTD'
              )}
            </Button>
          </div>
      </CardContent>
      </Card>
      </form>
    </div>
  );
};

export default AdminCreatePotd;

