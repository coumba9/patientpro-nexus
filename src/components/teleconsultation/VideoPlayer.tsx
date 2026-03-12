import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
  label?: string;
  className?: string;
  isVideoOff?: boolean;
  userName?: string;
}

export const VideoPlayer = ({
  stream,
  muted = false,
  mirrored = false,
  label,
  className,
  isVideoOff = false,
  userName,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-muted", className)}>
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={cn(
            "w-full h-full object-cover",
            mirrored && "scale-x-[-1]"
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {(userName || label || '?')[0].toUpperCase()}
              </span>
            </div>
            {(userName || label) && (
              <span className="text-sm text-muted-foreground">{userName || label}</span>
            )}
          </div>
        </div>
      )}
      {label && stream && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-xs font-medium text-foreground">
          {label}
        </div>
      )}
    </div>
  );
};
