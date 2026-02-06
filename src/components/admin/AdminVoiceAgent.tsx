import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, ExternalLink, AlertCircle } from 'lucide-react';

const AdminVoiceAgent = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" /> Outbound Voice Agent
          </CardTitle>
          <CardDescription>
            AI-powered outbound calling agent for marketing and customer outreach using ElevenLabs Conversational AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Setup Required</p>
                <p className="text-sm text-muted-foreground">
                  To enable the voice agent, an ElevenLabs API key is needed. The voice agent will:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Make outbound calls to prospects and customers</li>
                  <li>Follow a customizable call script</li>
                  <li>Qualify leads and schedule follow-ups</li>
                  <li>Log call outcomes automatically</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll need to create an ElevenLabs account and configure a Conversational AI Agent at{' '}
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    elevenlabs.io <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Calls Made</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Leads Qualified</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">--</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Badge variant="outline" className="text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" /> Not Connected
            </Badge>
            <Button disabled>
              Configure Voice Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVoiceAgent;
