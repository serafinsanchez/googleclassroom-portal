import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { 
  Sparkles, 
  Star, 
  Compass, 
  Map, 
  Mountain, 
  Flag,
  Heart,
  Shield,
  Swords,
  Crown
} from 'lucide-react';
import axios from 'axios';

const WritingAnalyzer = ({ documentId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/drive/files/${documentId}/content`,
          { withCredentials: true }
        );
        setDocumentContent(response.data.content);
      } catch (error) {
        setError('Failed to load document content');
      }
    };

    if (documentId) {
      fetchContent();
    }
  }, [documentId]);

  const analyzeDocument = async () => {
    if (!documentContent) {
      setError('No document content available to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        'http://localhost:3000/api/analyze-writing',
        { text: documentContent },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setAnalysis(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.error || 'Failed to analyze writing');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="writing-analyzer">
      <button
        className={`analyzer-button ${
          isLoading ? 'analyzer-button-loading' : 'analyzer-button-ready'
        }`}
        onClick={analyzeDocument}
        disabled={isLoading || !documentContent}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Spinner size="sm" className="mr-2" />
            <span>Discovering Powers...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Sparkles className="icon mr-2" />
            <span>Reveal Writing Powers</span>
            <Sparkles className="icon ml-2" />
          </div>
        )}
      </button>

      {analysis && (
        <div className="space-y-8">
          {/* Writer Level Banner */}
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Crown className="icon mr-2 text-yellow-600" />
                  Level {analysis.writerLevel} Writer
                </h2>
                <p className="text-yellow-800">+{analysis.xpGained} XP Gained!</p>
              </div>
              <div className="text-5xl">🏆</div>
            </div>
          </div>

          {/* Writing Powers */}
          <div className="card">
            <h2 className="card-header">
              <Swords className="icon mr-2 text-purple-500" />
              Writing Powers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.writingPowers.map((power, index) => (
                <div key={index} className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-purple-700">{power.name}</h3>
                  <div className="flex items-center my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`icon ${
                          i < power.level ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-purple-600">{power.description}</p>
                  {power.examples && (
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">Magic Words: </span>
                      {power.examples.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quest Progress */}
          <div className="card">
            <h2 className="card-header">
              <Compass className="icon mr-2 text-blue-500" />
              Quest Progress
            </h2>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{analysis.questProgress.mainQuest}</span>
                <span>{analysis.questProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${analysis.questProgress.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analysis.questProgress.achievements.map((achievement, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3 text-center">
                  <Star className="inline-block text-yellow-500 mb-1" />
                  <div className="text-sm font-medium text-blue-700">{achievement}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Magical Elements */}
          <div className="card">
            <h2 className="card-header">
              <Sparkles className="icon mr-2 text-indigo-500" />
              Magical Elements
            </h2>
            <div className="space-y-4">
              {analysis.magicalElements.spells.map((spell, index) => (
                <div key={index} className="bg-indigo-50 rounded-lg p-4">
                  <div className="font-semibold text-indigo-700">{spell.name}</div>
                  <div className="text-sm text-indigo-600 mt-1">Power: {spell.power}</div>
                  <div className="text-sm italic mt-2">{spell.example}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Quests */}
          <div className="card">
            <h2 className="card-header">
              <Map className="icon mr-2 text-green-500" />
              Next Adventures
            </h2>
            <div className="space-y-4">
              {analysis.nextQuests.map((quest, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-bold text-green-700 flex items-center">
                    <Flag className="icon mr-2" />
                    {quest.title}
                  </h3>
                  <div className="text-sm text-green-600 mt-1">
                    <span className="font-semibold">Reward: </span>
                    {quest.reward}
                  </div>
                  <div className="text-sm mt-2 italic">{quest.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingAnalyzer; 