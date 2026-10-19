"use client";

import { useState } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

const prompts = ["Analyze market trends", "Compare competitors", "SWOT for this industry", "Summarize uploaded report"];

export function AIAssistantPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function send(text = input) {
    const message = text.trim();
    if (!message) return;
    setMessages(prev => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/assistant/chat", { message });
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Sparkles size={16} />AI Assistant</CardTitle><button className="text-xs text-primary" onClick={() => window.location.assign("/ai-assistant")}>Open chat</button></CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap gap-2">{prompts.map(prompt => <button key={prompt} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground" onClick={() => send(prompt)}>{prompt}</button>)}</div>
        <div className="max-h-32 overflow-auto rounded-lg border border-border p-3 text-sm">{messages.length ? messages.slice(-3).map((m, i) => <p key={i} className={m.role === "assistant" ? "text-muted-foreground" : "font-medium"}>{m.content}</p>) : <p className="text-muted-foreground">Ask about market insights, trends, and competition.</p>}</div>
        {error && <p className="text-xs text-red-300">{error}</p>}
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); send(); }}><Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your question..." /><Button disabled={loading} className="px-3"><Send size={16} /></Button><Button type="button" variant="ghost" className="px-3" onClick={() => setMessages([])} aria-label="Clear conversation"><Trash2 size={16} /></Button></form>
      </CardContent>
    </Card>
  );
}
