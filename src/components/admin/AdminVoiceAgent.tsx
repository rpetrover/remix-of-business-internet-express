import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ExternalLink, AlertCircle, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminVoiceAgent = () => {
  const [agentId, setAgentId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      toast({ title: 'Connected', description: 'Voice agent is now active.' });
    },
    onDisconnect: () => {
      toast({ title: 'Disconnected', description: 'Voice agent session ended.' });
    },
    onError: (error) => {
      console.error('Voice agent error:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Failed to connect to voice agent. Check your Agent ID and try again.',
      });
    },
  });

  const startConversation = useCallback(async () => {
    if (!agentId.trim()) {
      toast({ variant: 'destructive', title: 'Agent ID Required', description: 'Enter your ElevenLabs Agent ID first.' });
      return;
    }

    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
        body: { agentId: agentId.trim() },
      });

      if (error || !data?.signed_url) {
        throw new Error(error?.message || 'Failed to get signed URL');
      }

      await conversation.startSession({
        signedUrl: data.signed_url,
      });
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      if (error.name === 'NotAllowedError') {
        toast({
          variant: 'destructive',
          title: 'Microphone Access Required',
          description: 'Please enable microphone access to use voice features.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: error.message || 'Could not start voice agent session.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === 'connected';

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" /> Voice Agent
          </CardTitle>
          <CardDescription>
            AI-powered voice agent using ElevenLabs Conversational AI. Test your agent directly from this panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Setup */}
          <div className="space-y-3">
            <Label htmlFor="agent-id">ElevenLabs Agent ID</Label>
            <div className="flex gap-2">
              <Input
                id="agent-id"
                placeholder="Enter your ElevenLabs Agent ID..."
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                disabled={isConnected}
                className="font-mono text-sm"
              />
              <a
                href="https://elevenlabs.io/app/conversational-ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon" title="Open ElevenLabs Dashboard">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Create an agent at{' '}
              <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                elevenlabs.io
              </a>{' '}
              and paste the Agent ID here.
            </p>
          </div>

          {/* Live Status */}
          {isConnected && (
            <div className="bg-accent/30 border border-accent rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {conversation.isSpeaking ? (
                    <Mic className="h-8 w-8 text-primary animate-pulse" />
                  ) : (
                    <MicOff className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {conversation.isSpeaking ? 'Agent is speaking...' : 'Listening...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Voice session active — speak into your microphone
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isConnected && !agentId.trim() && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Setup Instructions</p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Go to <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ElevenLabs Conversational AI</a></li>
                    <li>Create a new agent and configure its voice & persona</li>
                    <li>Copy the Agent ID and paste it above</li>
                    <li>Click "Start Session" to begin a live conversation</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Badge
              variant={isConnected ? 'default' : 'outline'}
              className={isConnected ? 'bg-green-500 text-white' : 'text-muted-foreground'}
            >
              <Phone className="h-3 w-3 mr-1" />
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Not Connected'}
            </Badge>

            {isConnected ? (
              <Button variant="destructive" onClick={stopConversation}>
                <PhoneOff className="h-4 w-4 mr-2" /> End Session
              </Button>
            ) : (
              <Button onClick={startConversation} disabled={isConnecting || !agentId.trim()}>
                <Mic className="h-4 w-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Start Session'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVoiceAgent;
