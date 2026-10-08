import { Button, Drawer } from "@mui/material";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { useState } from "react";

import ChatUI from "./ChatUI";

type Props<T> = {
  vehicleData: T;
  label?: string;
  variant?: "contained" | "soft";
};

const ChatDrawer = <T,>({
  vehicleData,
  label = "Ask about these results",
  variant = "soft",
}: Props<T>) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<ChatBubbleOutlineOutlined />}
        variant={variant === "contained" ? "contained" : "text"}
        sx={{
          minHeight: 44,
          px: 2,
          ...(variant === "soft" && {
            bgcolor: "primary.light",
            color: "primary.dark",
            "&:hover": { bgcolor: "#D9E6F6" },
          }),
        }}
      >
        {label}
      </Button>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <ChatUI vehicleData={vehicleData} />
      </Drawer>
    </>
  );
};

export default ChatDrawer;
