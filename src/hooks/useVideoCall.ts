import { useState, useRef, useCallback, useEffect } from 'react';
import Peer, { MediaConnection, DataConnection } from 'peerjs';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  sender: 'local' | 'remote';
  senderName: string;
  content: string;
  timestamp: Date;
}

interface UseVideoCallOptions {
  roomId: string;
  userName: string;
  isInitiator: boolean;
}

export const useVideoCall = ({ roomId, userName, isInitiator }: UseVideoCallOptions) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remoteUserName, setRemoteUserName] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);

  const peerRef = useRef<Peer | null>(null);
  const mediaConnectionRef = useRef<MediaConnection | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalStreamRef = useRef<MediaStream | null>(null);

  // Generate deterministic peer IDs based on room
  const localPeerId = isInitiator ? `jamm-doc-${roomId}` : `jamm-pat-${roomId}`;
  const remotePeerId = isInitiator ? `jamm-pat-${roomId}` : `jamm-doc-${roomId}`;

  const startDurationTimer = useCallback(() => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartTimeRef.current = null;
    setCallDuration(0);
  }, []);

  const setupDataConnection = useCallback((conn: DataConnection) => {
    dataConnectionRef.current = conn;

    conn.on('open', () => {
      conn.send({ type: 'identity', name: userName });
    });

    conn.on('data', (data: any) => {
      if (data.type === 'identity') {
        setRemoteUserName(data.name);
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          sender: 'remote',
          senderName: data.senderName,
          content: data.content,
          timestamp: new Date(data.timestamp),
        }]);
      }
    });

    conn.on('close', () => {
      dataConnectionRef.current = null;
    });
  }, [userName]);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setLocalStream(stream);
      originalStreamRef.current = stream;
      return stream;
    } catch (error: any) {
      console.error('Media access error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error("Accès caméra/micro refusé. Vérifiez les permissions du navigateur.");
      } else if (error.name === 'NotFoundError') {
        toast.error("Aucune caméra ou micro détecté.");
      } else {
        toast.error("Erreur d'accès aux périphériques média.");
      }
      return null;
    }
  }, []);

  const startCall = useCallback(async () => {
    setIsConnecting(true);
    const stream = await initializeMedia();
    if (!stream) {
      setIsConnecting(false);
      return;
    }

    const peer = new Peer(localPeerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('Peer opened with ID:', id);

      if (isInitiator) {
        // Doctor waits for patient to connect
        toast.info("En attente du patient...");
      } else {
        // Patient calls doctor
        setTimeout(() => {
          const call = peer.call(remotePeerId, stream);
          handleMediaConnection(call, stream);

          const dataConn = peer.connect(remotePeerId);
          setupDataConnection(dataConn);
        }, 1500);
      }
    });

    // Doctor receives call from patient
    peer.on('call', (call) => {
      call.answer(stream);
      handleMediaConnection(call, stream);
    });

    peer.on('connection', (conn) => {
      setupDataConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (err.type === 'unavailable-id') {
        toast.error("Session déjà en cours. Rafraîchissez la page.");
      } else if (err.type === 'peer-unavailable') {
        toast.error("Le correspondant n'est pas encore connecté. Réessayez dans quelques secondes.");
        setIsConnecting(false);
      } else {
        toast.error(`Erreur de connexion: ${err.type}`);
      }
    });

    peer.on('disconnected', () => {
      console.log('Peer disconnected');
    });
  }, [localPeerId, remotePeerId, isInitiator, initializeMedia, setupDataConnection]);

  const handleMediaConnection = useCallback((call: MediaConnection, localMediaStream: MediaStream) => {
    mediaConnectionRef.current = call;

    call.on('stream', (remote) => {
      setRemoteStream(remote);
      setIsConnected(true);
      setIsConnecting(false);
      startDurationTimer();
      toast.success("Connexion établie !");
    });

    call.on('close', () => {
      setRemoteStream(null);
      setIsConnected(false);
      stopDurationTimer();
      toast.info("L'appel a été terminé.");
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      toast.error("Erreur durant l'appel.");
    });
  }, [startDurationTimer, stopDurationTimer]);

  const endCall = useCallback(() => {
    mediaConnectionRef.current?.close();
    dataConnectionRef.current?.close();
    
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    originalStreamRef.current?.getTracks().forEach(t => t.stop());
    
    peerRef.current?.destroy();
    peerRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setScreenStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoOff(false);
    stopDurationTimer();
  }, [localStream, screenStream, stopDurationTimer]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(prev => !prev);
    }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing, restore camera
      screenStream?.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      if (originalStreamRef.current && mediaConnectionRef.current) {
        const videoTrack = originalStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          const sender = (mediaConnectionRef.current as any).peerConnection
            ?.getSenders()
            ?.find((s: RTCRtpSender) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        setLocalStream(originalStreamRef.current);
      }
      toast.info("Partage d'écran arrêté.");
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: false,
        });
        
        setScreenStream(screen);
        setIsScreenSharing(true);

        // Replace video track in the peer connection
        const screenTrack = screen.getVideoTracks()[0];
        if (mediaConnectionRef.current) {
          const sender = (mediaConnectionRef.current as any).peerConnection
            ?.getSenders()
            ?.find((s: RTCRtpSender) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }

        // Create a combined stream for local display
        const combinedStream = new MediaStream();
        screen.getVideoTracks().forEach(t => combinedStream.addTrack(t));
        localStream?.getAudioTracks().forEach(t => combinedStream.addTrack(t));
        setLocalStream(combinedStream);

        // When user stops sharing via browser UI
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        toast.success("Partage d'écran activé.");
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error("Impossible de partager l'écran.");
        }
      }
    }
  }, [isScreenSharing, screenStream, localStream]);

  const sendMessage = useCallback((content: string) => {
    if (!dataConnectionRef.current || !content.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'local',
      senderName: userName,
      content: content.trim(),
      timestamp: new Date(),
    };

    dataConnectionRef.current.send({
      type: 'chat',
      senderName: userName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    });

    setMessages(prev => [...prev, message]);
  }, [userName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isMuted,
    isVideoOff,
    isScreenSharing,
    messages,
    remoteUserName,
    callDuration,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    localPeerId,
    remotePeerId,
  };
};
