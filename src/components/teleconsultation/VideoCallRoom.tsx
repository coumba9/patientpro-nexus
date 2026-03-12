import { useState, useCallback } from 'react';
import { useVideoCall } from '@/hooks/useVideoCall';
import { VideoPlayer } from './VideoPlayer';
import { CallControls } from './CallControls';
import { ConsultationChat } from './ConsultationChat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Loader2, Clock, Shield } from 'lucide-react';

interface VideoCallRoomProps {
  roomId: string;
  userName: string;
  isDoctor: boolean;
  remoteName?: string;
  onEndCall: () => void;
}

export const VideoCallRoom = ({
  roomId,
  userName,
  isDoctor,
  remoteName,
  onEndCall,
}: VideoCallRoomProps) => {
  const [showChat, setShowChat] = useState(false);
  const [readMessages, setReadMessages] = useState(0);

  const {
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
  } = useVideoCall({
    roomId,
    userName,
    isInitiator: isDoctor,
  });

  const unreadMessages = showChat ? 0 : messages.length - readMessages;

  const handleToggleChat = useCallback(() => {
    setShowChat(prev => {
      if (!prev) setReadMessages(messages.length);
      return !prev;
    });
  }, [messages.length]);

  const handleEndCall = useCallback(() => {
    endCall();
    onEndCall();
  }, [endCall, onEndCall]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Pre-call screen
  if (!localStream && !isConnecting) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 gap-6 min-h-[500px]">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Video className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {isDoctor ? 'Démarrer la téléconsultation' : 'Rejoindre la consultation'}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {isDoctor
              ? `Cliquez pour démarrer la session. Le patient pourra rejoindre avec le code : ${roomId}`
              : "Cliquez pour rejoindre la session vidéo avec votre médecin."}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Connexion chiffrée de bout en bout (WebRTC)</span>
          </div>
        </div>
        <Button size="lg" onClick={startCall} className="gap-2 px-8">
          <Video className="h-5 w-5" />
          {isDoctor ? 'Démarrer la session' : 'Rejoindre'}
        </Button>
      </Card>
    );
  }

  // Connecting screen
  if (isConnecting && !isConnected) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 gap-6 min-h-[500px]">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Connexion en cours...</h2>
          <p className="text-muted-foreground">
            {isDoctor
              ? "En attente de la connexion du patient..."
              : "Connexion au médecin en cours..."}
          </p>
        </div>
        <Button variant="outline" onClick={handleEndCall}>
          Annuler
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-background">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-green-500 hover:bg-green-500 animate-pulse">
            En direct
          </Badge>
          <span className="text-sm font-medium text-foreground">
            {remoteUserName || remoteName || (isDoctor ? 'Patient' : 'Médecin')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
        </div>
        {isScreenSharing && (
          <Badge variant="secondary" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Partage d'écran
          </Badge>
        )}
      </div>

      {/* Video area */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative p-2">
          {/* Remote video (main) */}
          <VideoPlayer
            stream={remoteStream}
            label={remoteUserName || remoteName || (isDoctor ? 'Patient' : 'Médecin')}
            className="w-full h-full min-h-[300px]"
            userName={remoteUserName || remoteName}
          />

          {/* Local video (PiP) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-background z-10">
            <VideoPlayer
              stream={localStream}
              muted
              mirrored={!isScreenSharing}
              label="Vous"
              className="w-full h-full"
              isVideoOff={isVideoOff}
              userName={userName}
            />
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 flex-shrink-0">
            <ConsultationChat
              messages={messages}
              onSendMessage={sendMessage}
              isConnected={isConnected}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isConnected={isConnected}
        showChat={showChat}
        unreadMessages={unreadMessages}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={handleToggleChat}
        onEndCall={handleEndCall}
      />
    </div>
  );
};
