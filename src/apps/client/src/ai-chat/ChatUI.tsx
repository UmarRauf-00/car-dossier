import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  type MessageModel,
} from "@chatscope/chat-ui-kit-react";
import { Box } from "@mui/system";
import { Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { graphqlServer } from "../helpers/const";

// Same host as the GraphQL endpoint, minus the /graphql path
const apiOrigin = new URL(graphqlServer).origin;
const insightsUrl = `${apiOrigin}/api/anthropic_insights`;
const suggestionsUrl = `${apiOrigin}/api/anthropic_suggestions`;

type Props = {
  vehicleData?: unknown;
};

const ChatUI = ({ vehicleData }: Props) => {
  const storageKey = "car-dossier-chat-messages";

  // Load once on mount; fall back to an empty chat if nothing's saved
  const [messages, setMessages] = useState<MessageModel[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch {
      return [];
    }
  });

  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Ask Claude for starter questions whenever the vehicle data changes
  useEffect(() => {
    if (!vehicleData) return;
    let cancelled = false;

    fetch(suggestionsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleData }),
    })
      .then((res) => (res.ok ? res.json() : { questions: [] }))
      .then(({ questions }) => {
        if (!cancelled) setSuggestions(questions ?? []);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [vehicleData]);

  // Save whenever messages change (keep only the last 50)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50)));
    } catch {
      // storage full or blocked; chat still works, just won't persist
    }
  }, [storageKey, messages]);

  const addMessage = (text: string, direction: "incoming" | "outgoing") =>
    setMessages((prev) => [
      ...prev,
      {
        message: text,
        sentTime: new Date().toLocaleTimeString(),
        sender: direction === "outgoing" ? "You" : "Claude",
        direction,
        position: "single",
      },
    ]);

  // MessageInput hands back HTML (it's a contenteditable), so use the
  // plain-text argument for both display and the API call
  const handleSend = (_html: string, textContent: string) =>
    sendQuestion(textContent);

  const sendQuestion = async (text: string) => {
    const userQuestion = text.trim();
    if (!userQuestion) return;

    // Once a suggestion is asked, stop offering it
    setSuggestions((prev) => prev.filter((q) => q !== userQuestion));

    // Earlier turns, so Claude can follow up on previous answers. Skips the
    // greeting (index 0) because the conversation has to start with the user.
    const history = messages.slice(1).map((m) => ({
      role: m.direction === "outgoing" ? "user" : "assistant",
      content: m.message,
    }));

    addMessage(userQuestion, "outgoing");
    setIsTyping(true);

    try {
      const res = await fetch(insightsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuestion, vehicleData, history }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const { message } = await res.json();
      const reply = (message?.content ?? [])
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("");

      addMessage(reply || "No response.", "incoming");
    } catch (err) {
      console.error(err);
      addMessage("Something went wrong, please try again.", "incoming");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box
      style={{
        position: "relative",
        height: "100%",
        width: "342px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {suggestions.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 1 }}>
          {suggestions.map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              variant="outlined"
              disabled={isTyping}
              onClick={() => sendQuestion(q)}
              sx={{
                height: "auto",
                "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
              }}
            />
          ))}
        </Box>
      )}
      <MainContainer style={{ flex: 1, minHeight: 0 }}>
        <ChatContainer>
          <MessageList
            typingIndicator={
              isTyping ? (
                <TypingIndicator content="DefoNotClaude is typing" />
              ) : null
            }
          >
            {messages.map((m, i) => (
              <Message key={i} model={m} />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            onSend={handleSend}
            attachButton={false}
            disabled={isTyping}
          />
        </ChatContainer>
      </MainContainer>
    </Box>
  );
};

export default ChatUI;
