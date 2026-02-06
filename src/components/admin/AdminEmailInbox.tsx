import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Mail, MailOpen, Reply, Bot, RefreshCw, Send, Inbox, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Email {
  id: string;
  direction: string;
  from_email: string;
  from_name: string | null;
  to_email: string;
  to_name: string | null;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  status: string;
  ai_draft: string | null;
  ai_auto_replied: boolean;
  created_at: string;
}

const AdminEmailInbox = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const { toast } = useToast();

  const fetchEmails = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load emails', variant: 'destructive' });
    } else {
      setEmails(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const markAsRead = async (email: Email) => {
    if (email.status === 'received') {
      await supabase.from('emails').update({ status: 'read' }).eq('id', email.id);
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'read' } : e));
    }
    setSelectedEmail(email);
    if (email.ai_draft) {
      setReplyText(email.ai_draft);
    } else {
      setReplyText('');
    }
  };

  const generateAIDraft = async () => {
    if (!selectedEmail) return;
    setIsGeneratingDraft(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-reply', {
        body: {
          emailId: selectedEmail.id,
          subject: selectedEmail.subject,
          body: selectedEmail.body_text || selectedEmail.body_html || '',
          fromEmail: selectedEmail.from_email,
          fromName: selectedEmail.from_name,
        },
      });

      if (error) throw error;

      setReplyText(data.draft);
      // Save draft to email record
      await supabase.from('emails').update({ ai_draft: data.draft }).eq('id', selectedEmail.id);

      toast({ title: 'AI Draft Generated', description: 'Review and edit before sending.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to generate AI draft', variant: 'destructive' });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const sendReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;
    setIsSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: {
          to: selectedEmail.from_email,
          toName: selectedEmail.from_name,
          subject: `Re: ${selectedEmail.subject}`,
          body: replyText,
          inReplyTo: selectedEmail.id,
        },
      });

      if (error) throw error;

      await supabase.from('emails').update({ status: 'replied' }).eq('id', selectedEmail.id);
      setEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, status: 'replied' } : e));
      setReplyText('');
      toast({ title: 'Reply Sent', description: `Reply sent to ${selectedEmail.from_email}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send reply', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      received: 'bg-primary/10 text-primary',
      read: 'bg-muted text-muted-foreground',
      replied: 'bg-success/10 text-success',
      sent: 'bg-success/10 text-success',
      draft: 'bg-accent/10 text-accent',
      failed: 'bg-destructive/10 text-destructive',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Email List */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Emails
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchEmails}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {emails.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No emails yet</p>
                <p className="text-sm mt-1">Inbound emails will appear here once the webhook is configured.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {emails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => markAsRead(email)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    } ${email.status === 'received' ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {email.direction === 'inbound' ? (
                        <ArrowDownLeft className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm truncate">{email.from_name || email.from_email}</span>
                          {getStatusBadge(email.status)}
                        </div>
                        <p className="text-sm truncate mt-1">{email.subject || '(No subject)'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(email.created_at).toLocaleDateString()} {new Date(email.created_at).toLocaleTimeString()}
                        </p>
                        {email.ai_auto_replied && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            <Bot className="h-3 w-3 mr-1" /> AI Replied
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Email Detail / Reply */}
      <Card className="lg:col-span-2">
        {selectedEmail ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedEmail.subject || '(No subject)'}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    From: {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    To: {selectedEmail.to_email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedEmail.created_at).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(selectedEmail.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email body */}
              <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-auto">
                {selectedEmail.body_html ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} className="prose prose-sm max-w-none" />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{selectedEmail.body_text || 'No content'}</p>
                )}
              </div>

              {/* Reply section for inbound emails */}
              {selectedEmail.direction === 'inbound' && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Reply className="h-4 w-4" /> Reply
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAIDraft}
                      disabled={isGeneratingDraft}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {isGeneratingDraft ? 'Generating...' : 'AI Draft'}
                    </Button>
                  </div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows={6}
                  />
                  <div className="flex justify-end">
                    <Button onClick={sendReply} disabled={isSending || !replyText.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-[600px] text-muted-foreground">
            <div className="text-center">
              <MailOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select an email to view</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminEmailInbox;
