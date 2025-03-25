
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SystemUpdateChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add a welcome message on component mount
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu assistente de atualização do sistema. Como posso ajudar a melhorar o LaTransfer hoje?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would send the message to an AI service
      // For now, we'll simulate a response
      setTimeout(() => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: 'Este é um protótipo da interface de chat para atualizações do sistema. Em uma implementação completa, estaria integrado com uma API de IA para fornecer respostas reais e implementar as atualizações solicitadas.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Atualização do Sistema
        </CardTitle>
        <CardDescription>
          Interaja com o assistente para implementar atualizações e melhorias no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[70vh]">
          <ScrollArea className="flex-1 p-4 mb-4 border rounded-md bg-gray-50">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua solicitação de atualização..."
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-2">Enviar</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemUpdateChat;
