'use client'

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface Scout {
  id: string;
  userQuery: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
  };
  todos: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface AllScoutsProps {
  className?: string;
}

export default function AllScouts({ className = '' }: AllScoutsProps) {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScouts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scouts');
      const data = await response.json();
      console.log('Fetched scouts data:', data); // Debug log
      if (data.scouts) {
        setScouts(data.scouts);
        console.log('Total scouts found:', data.scouts.length); // Debug log
      }
    } catch (error) {
      console.error('Error fetching scouts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch scouts when component mounts
  useEffect(() => {
    fetchScouts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodoStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading scouts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No scouts found</p>
              <p className="text-sm mt-2">Create a new scout to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {scouts.map((scout) => (
                <div 
                  key={scout.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Scout Query
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {scout.userQuery}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scout.status)}`}>
                        {scout.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>User: {scout.user.email}</span>
                      <span>Created: {new Date(scout.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {scout.todos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">
                          Tasks ({scout.todos.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {scout.todos.map((todo) => (
                            <div 
                              key={todo.id}
                              className="flex justify-between items-center text-xs bg-white/5 rounded px-3 py-2"
                            >
                              <span className="text-gray-300 truncate flex-1 mr-2">{todo.title}</span>
                              <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${getTodoStatusColor(todo.status)}`}>
                                {todo.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 