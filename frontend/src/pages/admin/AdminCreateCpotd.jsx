import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, Play, Code } from 'lucide-react';
import { useAdminCreate } from '../../hooks/useAdminCreate';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminCreateCpotd = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    sampleTestCases: [{ id: 1, input: '', expected: '' }],
    hiddenTestCases: [{ id: 1, input: '', expected: '' }],
    solutionExplanation: '',
  });
  const { loading, error, success, createCpotd } = useAdminCreate();
  const navigate = useNavigate();

  const addTestCase = (type) => {
    const newId = formData[type].length + 1;
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { id: newId, input: '', expected: '' }],
    }));
  };

  const removeTestCase = (type, id) => {
    if (formData[type].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [type]: prev[type].filter((tc) => tc.id !== id),
      }));
    }
  };

  const updateTestCase = (type, id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    }));
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.solutionExplanation.trim()
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    if (
      formData.sampleTestCases.some((tc) => !tc.input.trim() || !tc.expected.trim()) ||
      formData.hiddenTestCases.some((tc) => !tc.input.trim() || !tc.expected.trim())
    ) {
      toast.error('Please fill all test cases');
      return;
    }

    const cpotdData = {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      sampleTestCases: formData.sampleTestCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
      })),
      hiddenTestCases: formData.hiddenTestCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
      })),
      solutionExplanation: formData.solutionExplanation,
    };

    try {
      await createCpotd(cpotdData);
      toast.success('CPOTD created successfully!');
      navigate('/admin/cpotd');
    } catch (err) {
      toast.error(error || 'Failed to create CPOTD');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 lg:ml-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent dark:text-white">
            Create Manual CPOTD
          </h1>
          <p className="text-xl text-gray-600 mt-2 dark:text-white">
            Create custom Coding Problem of the Day
          </p>
        </div>
        {/*  GENERATE BUTTON */}
        <Button
          onClick={async () => {
            try {
              await api.post('/api/cpotd/generate');
              toast.success(' CPOTD Generated!');
            } catch {
              toast.error('Failed to generate');
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          ⚡ Quick Trigger Cpotd Question
        </Button>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div>
            <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 block mb-3">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder="Enter problem title..."
              className="h-16 text-xl"
            />
          </div>
          <div>
            <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 block mb-3">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="Enter problem description..."
              className="h-32 text-lg resize-none"
              rows={6}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                Difficulty
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(v) => updateFormField('difficulty', v)}
              >
                <SelectTrigger className="h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Test Cases */}
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl text-white font-bold">
              📋 Sample Test Cases
            </div>
            <Badge variant="secondary">Visible to users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {formData.sampleTestCases.map((tc) => (
            <div
              key={tc.id}
              className="flex gap-4 p-6 border border-gray-200 dark:border-gray-700 rounded-3xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20"
            >
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Input
                </label>
                <Input
                  value={tc.input}
                  onChange={(e) =>
                    updateTestCase('sampleTestCases', tc.id, 'input', e.target.value)
                  }
                  placeholder="Enter input..."
                  className="font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Expected Output
                </label>
                <Input
                  value={tc.expected}
                  onChange={(e) =>
                    updateTestCase('sampleTestCases', tc.id, 'expected', e.target.value)
                  }
                  placeholder="Enter expected output..."
                  className="font-mono"
                />
              </div>
              {formData.sampleTestCases.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  className="self-end mt-10 p-3 rounded-2xl h-fit"
                  onClick={() => removeTestCase('sampleTestCases', tc.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 w-full h-16 text-lg font-semibold rounded-3xl"
            onClick={() => addTestCase('sampleTestCases')}
          >
            <Plus className="w-6 h-6 mr-3" />
            Add Sample Test Case
          </Button>
        </CardContent>
      </Card>

      {/* Hidden Test Cases */}
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white font-bold">
              🔒 Hidden Test Cases
            </div>
            <Badge variant="destructive">Secret tests</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {formData.hiddenTestCases.map((tc) => (
            <div
              key={tc.id}
              className="flex gap-4 p-6 border border-gray-200 dark:border-gray-700 rounded-3xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20"
            >
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Input
                </label>
                <Input
                  value={tc.input}
                  onChange={(e) =>
                    updateTestCase('hiddenTestCases', tc.id, 'input', e.target.value)
                  }
                  placeholder="Enter input..."
                  className="font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Expected Output
                </label>
                <Input
                  value={tc.expected}
                  onChange={(e) =>
                    updateTestCase('hiddenTestCases', tc.id, 'expected', e.target.value)
                  }
                  placeholder="Enter expected output..."
                  className="font-mono"
                />
              </div>
              {formData.hiddenTestCases.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  className="self-end mt-10 p-3 rounded-2xl h-fit"
                  onClick={() => removeTestCase('hiddenTestCases', tc.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-400 w-full h-16 text-lg font-semibold rounded-3xl"
            onClick={() => addTestCase('hiddenTestCases')}
          >
            <Plus className="w-6 h-6 mr-3" />
            Add Hidden Test Case
          </Button>
        </CardContent>
      </Card>

      {/* Solution Explanation */}
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Solution Explanation</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <Textarea
            value={formData.solutionExplanation}
            onChange={(e) => updateFormField('solutionExplanation', e.target.value)}
            placeholder="Detailed solution explanation..."
            className="h-48 text-lg resize-none font-mono"
            rows={8}
          />
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-12 pt-8">
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin/cpotd')}
              className="px-12 py-8 rounded-3xl font-bold text-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={submitForm}
              disabled={loading}
              size="lg"
              className="px-16 py-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-2xl text-xl rounded-3xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Creating CPOTD...
                </>
              ) : (
                'Create CPOTD'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateCpotd;
