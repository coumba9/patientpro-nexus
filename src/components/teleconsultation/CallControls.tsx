import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isConnected: boolean;
  showChat: boolean;
  showNotes?: boolean;
  unreadMessages: number;
  isDoctor?: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleNotes?: () => void;
  onEndCall: () => void;
}

export const CallControls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isConnected,
  showChat,
  showNotes,
  unreadMessages,
  isDoctor,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleNotes,
  onEndCall,
}: CallControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-card border-t border-border rounded-b-xl">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onToggleMute}
            disabled={!isConnected}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isMuted ? 'Activer le micro' : 'Couper le micro'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onToggleVideo}
            disabled={!isConnected}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onToggleScreenShare}
            disabled={!isConnected}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isScreenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={showChat ? "default" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleChat}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                {unreadMessages}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>Chat</TooltipContent>
      </Tooltip>

      {isDoctor && onToggleNotes && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showNotes ? "default" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleNotes}
            >
              <FileText className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notes de consultation</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full ml-4"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Terminer l'appel</TooltipContent>
      </Tooltip>
    </div>
  );
};
