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
import { useState } from "react";
import { graphqlServer } from "../helpers/const";

// Same host as the GraphQL endpoint, minus the /graphql path
const insightsUrl = `${new URL(graphqlServer).origin}/api/anthropic_insights`;

type Props = {
  vehicleData?: unknown;
};

const ChatUI = ({ vehicleData }: Props) => {
  const [messages, setMessages] = useState<MessageModel[]>([
    {
      message: "Ask me anything about these results.",
      sentTime: new Date().toLocaleTimeString(),
      sender: "Claude",
      direction: "incoming",
      position: "single",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

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
  const handleSend = async (_html: string, textContent: string) => {
    const userQuestion = textContent.trim();
    if (!userQuestion) return;

    addMessage(userQuestion, "outgoing");
    setIsTyping(true);

    try {
      const res = await fetch(insightsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuestion, vehicleData }),
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
    <Box style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={
              isTyping ? <TypingIndicator content="Claude is typing" /> : null
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
