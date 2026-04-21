import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { uploadResumeAndAnalyze, clearAnalysis, setFileName, selectResume } from '@/redux/resumeSlice';
import Navbar from '@/components/Navbar';
import UploadArea from '@/components/ui/UploadArea';
import Footer from '@/components/Footer';

export default function ResumeAnalyzer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { loading, analysis, fileName } = useSelector(selectResume);
  const [showResult, setShowResult] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    dispatch(setFileName(file.name));
    toast.success('Resume uploaded successfully!');
  }, [dispatch]);

  const handleAnalyze = useCallback(() => {
    if (!selectedFile) {
      toast.error('Please select a PDF resume first');
      return;
    }

    if (user?.credits < 20) {
      toast.error('Need 20 credits. Check dashboard.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);
    dispatch(uploadResumeAndAnalyze(formData));
    setShowResult(true);
  }, [selectedFile, user, dispatch]);

  const handleCloseResult = useCallback(() => {
    dispatch(clearAnalysis());
    setSelectedFile(null);
    setShowResult(false);
  }, [dispatch]);

  return (
    <>
      <Navbar />
     <div className="pt-16 lg:pl-64 p-4  bg-gray-100 dark:bg-gray-950 min-h-screen transition-colors duration-300 lg:mt-14 md:mt-14">
        <div className="flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AI Resume Analyzer <Sparkles className="inline ml-2" />
                </h1>
                <p className="text-gray-600 mt-2">Upload your PDF resume for FAANG-level feedback (20 credits)</p>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="bg-yellow-200 dark:bg-gray-950 cursor-pointer">
                Dashboard
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Upload PDF Resume
                </CardTitle>
                <CardDescription>
                  Drag & drop or click to select. Max 5MB PDF only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UploadArea 
                  onFileSelect={handleFileSelect} 
                  fileName={fileName}
                />

                {user && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Badge>Credits: {user.credits}</Badge>
                    <span className="text-sm text-gray-600">Cost: 20 credits</span>
                  </div>
                )}

                <Button 
                  onClick={handleAnalyze}
                  disabled={loading || !selectedFile || !user?.credits || user.credits < 20}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Resume (20 credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Dialog open={showResult && analysis} onOpenChange={setShowResult}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>AI Analysis Complete</DialogTitle>
                </DialogHeader>
                {analysis && (
                  <div className="space-y-6 pt-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {analysis.score}/100
                      </div>
                      <Badge className={`text-lg px-4 py-2 ${analysis.interviewReady ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {analysis.interviewReady ? 'Interview Ready' : 'Needs Work'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-2">{analysis.recommendedRole}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.strengths.map((strength, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            Weaknesses
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.weaknesses.map((weakness, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                            {analysis.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-sm">{"• " + suggestion}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3 pt-4">
                      <Button className="flex-1 " onClick={() => setShowResult(false)}>
                        Analyze Again
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate('/planner-history')}
                      >
                        View Planners
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
