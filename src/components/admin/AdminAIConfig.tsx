import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bot, Save, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TrainingExample {
  inbound: string;
  response: string;
}

interface AIConfig {
  id: string;
  mode: string;
  system_prompt: string;
  training_examples: TrainingExample[];
  is_active: boolean;
}

const AdminAIConfig = () => {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newExampleInbound, setNewExampleInbound] = useState('');
  const [newExampleResponse, setNewExampleResponse] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('email_ai_config')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setConfig({
          ...data,
          training_examples: (data.training_examples as any as TrainingExample[]) || [],
        });
      }
      setIsLoading(false);
    };

    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!config) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('email_ai_config')
      .update({
        mode: config.mode,
        system_prompt: config.system_prompt,
        training_examples: config.training_examples as any,
        is_active: config.is_active,
      })
      .eq('id', config.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save configuration', variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'AI agent configuration updated' });
    }
    setIsSaving(false);
  };

  const addExample = () => {
    if (!config || !newExampleInbound.trim() || !newExampleResponse.trim()) return;

    setConfig({
      ...config,
      training_examples: [
        ...config.training_examples,
        { inbound: newExampleInbound, response: newExampleResponse },
      ],
    });
    setNewExampleInbound('');
    setNewExampleResponse('');
  };

  const removeExample = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      training_examples: config.training_examples.filter((_, i) => i !== index),
    });
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading AI config...</div>;
  if (!config) return <div className="text-center py-12 text-muted-foreground">No AI configuration found.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> Email AI Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure how the AI agent handles inbound emails. In "auto" mode it replies immediately; in "draft" mode it creates a draft for your review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">AI Agent Active</Label>
              <p className="text-sm text-muted-foreground">Enable or disable the AI email agent</p>
            </div>
            <Switch
              checked={config.is_active}
              onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
            />
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Response Mode</Label>
              <p className="text-sm text-muted-foreground">
                {config.mode === 'auto' ? 'AI sends replies automatically' : 'AI drafts replies for your review'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.mode === 'draft' ? 'default' : 'outline'}>Draft</Badge>
              <Switch
                checked={config.mode === 'auto'}
                onCheckedChange={(checked) => setConfig({ ...config, mode: checked ? 'auto' : 'draft' })}
              />
              <Badge variant={config.mode === 'auto' ? 'default' : 'outline'}>Auto</Badge>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="text-base">System Prompt</Label>
            <p className="text-sm text-muted-foreground">Tell the AI how to behave and respond to emails</p>
            <Textarea
              value={config.system_prompt}
              onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
              rows={6}
              placeholder="You are a helpful business email assistant..."
            />
          </div>

          {/* Training Examples */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Training Examples</Label>
              <p className="text-sm text-muted-foreground">Provide example email/response pairs to guide the AI's tone and approach</p>
            </div>

            {config.training_examples.map((example, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="shrink-0">Example {index + 1}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeExample(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">INBOUND EMAIL:</p>
                    <p className="text-sm mt-1">{example.inbound}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">EXPECTED RESPONSE:</p>
                    <p className="text-sm mt-1">{example.response}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">Add Training Example</p>
                <div className="space-y-2">
                  <Label className="text-xs">Example Inbound Email</Label>
                  <Textarea
                    value={newExampleInbound}
                    onChange={(e) => setNewExampleInbound(e.target.value)}
                    rows={3}
                    placeholder="Hi, I'm interested in getting business internet for my office at 123 Main St..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expected AI Response</Label>
                  <Textarea
                    value={newExampleResponse}
                    onChange={(e) => setNewExampleResponse(e.target.value)}
                    rows={3}
                    placeholder="Thank you for your interest! We'd love to help you find the perfect internet solution..."
                  />
                </div>
                <Button variant="outline" size="sm" onClick={addExample} disabled={!newExampleInbound.trim() || !newExampleResponse.trim()}>
                  <Plus className="h-4 w-4 mr-2" /> Add Example
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={saveConfig} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIConfig;
