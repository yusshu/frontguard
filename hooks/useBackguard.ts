import { Device } from "@/lib/device";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

export type Backguard = ReturnType<typeof useBackguard>;

export default function useBackguard(token: string) {
  const [ devices, setDevices ] = useState<Record<string, Device<any>>>(null);

  const ws = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL!,
    {
      reconnectInterval: 2000,
      reconnectAttempts: Number.MAX_VALUE,
      shouldReconnect: () => true,
      onOpen: () => {
        ws.sendMessage("HELLO client " + token);
      },
    },
  );

  useEffect(() => {
    const data = ws.lastMessage?.data;
    if (!data) return;

    const text = data.toString().trim();
    console.log("[WS]", text);

    const spaceIndex = text.indexOf(" ");
    const cmd = spaceIndex === -1 ? text : text.slice(0, spaceIndex);
    const body = spaceIndex === -1 ? "" : text.slice(spaceIndex + 1);

    if (cmd === "DEVICE_ALL") {
      setDevices(JSON.parse(body));
      return;
    }

    if (cmd === "DEVICE") {
      const [ deviceId, ...jsonPart ] = body.split(" ");
      const state = JSON.parse(jsonPart.join(" "));

      setDevices((prev) => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          state,
        },
      }));
      return;
    }

    console.warn("[WS] Unknown command", cmd);
  }, [ ws.lastMessage ]);

  return {
    sendMessage: ws.sendMessage,
    devices,
    readyState: ws.readyState,
  };
}