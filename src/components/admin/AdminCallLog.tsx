import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  RefreshCw,
  Play,
  Pause,
  FileText,
  Clock,
  ChevronRight,
  User,
} from "lucide-react";

interface CallRecord {
  id: string;
  direction: string;
  caller_phone: string | null;
  callee_phone: string | null;
  customer_name: string | null;
  customer_email: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  transcript: string | null;
  summary: string | null;
  status: string;
  call_sid: string | null;
  related_order_id: string | null;
  related_checkout_id: string | null;
  created_at: string;
}

const AdminCallLog = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const fetchCalls = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("call_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: "Error", description: "Failed to load call records", variant: "destructive" });
    } else {
      setCalls((data as unknown as CallRecord[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const togglePlayback = () => {
    if (!selectedCall?.recording_url) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(selectedCall.recording_url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSelectCall = (call: CallRecord) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    setSelectedCall(call);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-emerald-500/10 text-emerald-600",
      no_answer: "bg-amber-500/10 text-amber-600",
      busy: "bg-amber-500/10 text-amber-600",
      failed: "bg-destructive/10 text-destructive",
      in_progress: "bg-blue-500/10 text-blue-600",
    };
    return <Badge className={variants[status] || "bg-muted text-muted-foreground"}>{status}</Badge>;
  };

  const getDirectionIcon = (direction: string) =>
    direction === "inbound" ? (
      <PhoneIncoming className="h-4 w-4 text-blue-500" />
    ) : (
      <PhoneOutgoing className="h-4 w-4 text-emerald-500" />
    );

  // Stats
  const totalCalls = calls.length;
  const inboundCalls = calls.filter((c) => c.direction === "inbound").length;
  const outboundCalls = calls.filter((c) => c.direction === "outbound").length;
  const withRecordings = calls.filter((c) => c.recording_url).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Phone className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalCalls}</p>
            <p className="text-xs text-muted-foreground">Total Calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <PhoneIncoming className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{inboundCalls}</p>
            <p className="text-xs text-muted-foreground">Inbound</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <PhoneOutgoing className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{outboundCalls}</p>
            <p className="text-xs text-muted-foreground">Outbound</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <FileText className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{withRecordings}</p>
            <p className="text-xs text-muted-foreground">With Recordings</p>
          </CardContent>
        </Card>
      </div>

      {/* Call List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Log ({calls.length})
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={fetchCalls}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {calls.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No call records yet</p>
                  <p className="text-sm mt-1">Inbound and outbound call logs will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {calls.map((call) => (
                    <button
                      key={call.id}
                      onClick={() => handleSelectCall(call)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                        selectedCall?.id === call.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getDirectionIcon(call.direction)}
                            <span className="text-sm font-medium truncate">
                              {call.customer_name || call.callee_phone || call.caller_phone || "Unknown"}
                            </span>
                            {getStatusBadge(call.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(call.duration_seconds)}
                            </span>
                            {call.recording_url && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Recording
                              </Badge>
                            )}
                            {call.transcript && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Transcript
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(call.created_at).toLocaleDateString()}{" "}
                            {new Date(call.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Call Detail */}
        <Card className="lg:col-span-2">
          {selectedCall ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDirectionIcon(selectedCall.direction)}
                    <div>
                      <CardTitle className="text-lg">
                        {selectedCall.customer_name || "Unknown Caller"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selectedCall.created_at).toLocaleString()} •{" "}
                        {selectedCall.direction === "inbound" ? "Inbound" : "Outbound"} Call
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(selectedCall.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Call Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> Contact Details
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {selectedCall.customer_name && <p>Name: {selectedCall.customer_name}</p>}
                      {selectedCall.customer_email && <p>Email: {selectedCall.customer_email}</p>}
                      {selectedCall.caller_phone && <p>From: {selectedCall.caller_phone}</p>}
                      {selectedCall.callee_phone && <p>To: {selectedCall.callee_phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Call Details
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Duration: {formatDuration(selectedCall.duration_seconds)}</p>
                      <p>Status: {selectedCall.status}</p>
                      {selectedCall.call_sid && (
                        <p className="font-mono text-xs">SID: {selectedCall.call_sid}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recording Playback */}
                {selectedCall.recording_url && (
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Play className="h-4 w-4" /> Call Recording
                    </h4>
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="outline" onClick={togglePlayback}>
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" /> Play Recording
                          </>
                        )}
                      </Button>
                      <a
                        href={selectedCall.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedCall.summary && (
                  <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-semibold">AI Summary</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedCall.summary}
                    </p>
                  </div>
                )}

                {/* Transcript */}
                {selectedCall.transcript && (
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Full Transcript
                    </h4>
                    <ScrollArea className="max-h-[300px]">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedCall.transcript}
                      </p>
                    </ScrollArea>
                  </div>
                )}

                {/* No recording or transcript */}
                {!selectedCall.recording_url && !selectedCall.transcript && !selectedCall.summary && (
                  <div className="bg-muted/30 rounded-lg p-6 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recording or transcript available for this call.</p>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <Phone className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Select a call to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminCallLog;
