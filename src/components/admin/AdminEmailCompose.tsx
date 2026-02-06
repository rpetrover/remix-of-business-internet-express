import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, PenLine } from 'lucide-react';

const AdminEmailCompose = () => {
  const [to, setTo] = useState('');
  const [toName, setToName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: { to, toName, subject, body },
      });

      if (error) throw error;

      toast({ title: 'Email Sent', description: `Email sent to ${to}` });
      setTo('');
      setToName('');
      setSubject('');
      setBody('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="h-5 w-5" />
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="to">To (Email) *</Label>
              <Input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toName">Recipient Name</Label>
              <Input
                id="toName"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email message..."
              rows={10}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSending}>
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminEmailCompose;
