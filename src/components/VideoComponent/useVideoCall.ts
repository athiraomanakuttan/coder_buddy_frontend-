import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { IceCandidateMessage, OfferMessage, AnswerMessage } from './types';

export const useVideoCall = (roomId: string, onCallEnd?: () => void) => {
    const socketRef = useRef<Socket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    
    const [isConnected, setIsConnected] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);
    const [isRecording, setIsRecording] = useState(false);

    const setupPeerConnection = async () => {
        const servers: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        peerConnection.current = new RTCPeerConnection(servers);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                if (peerConnection.current) {
                    console.log('Adding track:', track.kind);
                    peerConnection.current.addTrack(track, stream);
                }
            });

            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    };

    const startRecording = () => {
        if (!localStreamRef.current) return;

        const streams = [localStreamRef.current];
        if (remoteVideoRef.current?.srcObject) {
            streams.push(remoteVideoRef.current.srcObject as MediaStream);
        }

        const combinedStream = new MediaStream();
        streams.forEach(stream => {
            stream.getTracks().forEach(track => {
                combinedStream.addTrack(track);
            });
        });

        try {
            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: 'video/webm'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = `recording-${new Date().toISOString()}.webm`;
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                recordedChunksRef.current = [];
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            screenStreamRef.current = screenStream;

            const videoTrack = screenStream.getVideoTracks()[0];
            const senders = peerConnection.current?.getSenders();
            const videoSender = senders?.find(sender => 
                sender.track?.kind === 'video'
            );
            
            if (videoSender) {
                await videoSender.replaceTrack(videoTrack);
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            videoTrack.onended = () => {
                stopScreenShare();
            };

            setIsScreenSharing(true);
        } catch (error) {
            console.error('Error starting screen share:', error);
            alert('Failed to start screen sharing');
        }
    };

    const stopScreenShare = async () => {
        if (localStreamRef.current && peerConnection.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            
            const senders = peerConnection.current.getSenders();
            const videoSender = senders.find(sender => 
                sender.track?.kind === 'video'
            );
            
            if (videoSender) {
                await videoSender.replaceTrack(videoTrack);
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }

            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            
            setIsScreenSharing(false);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(!isVideoEnabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(!isAudioEnabled);
            }
        }
    };

    const endCall = () => {
        if (isRecording) {
            stopRecording();
        }
        if (isScreenSharing) {
            stopScreenShare();
        }
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        peerConnection.current?.close();
        socketRef.current?.emit('leave-room', { roomId });
        setIsConnected(false);
        onCallEnd?.();
    };

    useEffect(() => {
        socketRef.current = io(process.env.NEXT_PUBLIC_API_URI as string, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        const socket = socketRef.current;

        const initializeConnection = async () => {
            try {
                await setupPeerConnection();

                if (peerConnection.current) {
                    peerConnection.current.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit('ice-candidate', {
                                candidate: event.candidate,
                                roomId,
                                from: socket.id
                            });
                        }
                    };

                    peerConnection.current.ontrack = (event) => {
                        console.log('Received remote track:', event.streams[0]);
                        console.log('Track kind:', event.track.kind);
                        console.log('Track enabled:', event.track.enabled);
                        console.log('Track readyState:', event.track.readyState);
                        if (remoteVideoRef.current && event.streams[0]) {
                            console.log('Setting remote video source');
                            remoteVideoRef.current.srcObject = event.streams[0];
                            
                            // Add event listeners to the remote video element
                            remoteVideoRef.current.onloadedmetadata = () => {
                                console.log('Remote video metadata loaded');
                            };
                            remoteVideoRef.current.onplay = () => {
                                console.log('Remote video started playing');
                            };
                            remoteVideoRef.current?.play().catch(e => console.error('Error auto-playing:', e));
                        }
                    };

                    peerConnection.current.oniceconnectionstatechange = () => {
                        console.log('ICE Connection State:', peerConnection.current?.iceConnectionState);
                        console.log('Connection State:', peerConnection.current?.connectionState);
                        console.log('Signaling State:', peerConnection.current?.signalingState);
                    };
                    peerConnection.current.onconnectionstatechange = () => {
                        console.log('ICE Connection State:', peerConnection.current?.iceConnectionState);
                        if (peerConnection.current?.connectionState === 'failed') {
                            console.log('Peer connection failed, attempting to reconnect...');
                            socket.emit('join-room', { roomId });
                        }
                    };
                }
            } catch (error) {
                console.error('Error setting up connection:', error);
                alert('Failed to access camera/microphone');
            }
        };

        socket.on('connect', async () => {
    console.log('Socket connected, initializing connection...');
    await initializeConnection();
    console.log('Connection initialized, joining room...');
    socket.emit('join-room', { roomId }); 
});

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('room-full', () => {
            alert('Room is full. Only two participants are allowed.');
            onCallEnd?.();
        });

        socket.on('participant-count', async (count: number) => {
            console.log('Participant count:', count);
            setParticipantCount(count);
            if (count === 2 && !isConnected) {  // Add this check
                setIsConnected(true);
                try {
                    if (peerConnection.current && 
                        peerConnection.current.signalingState === 'stable' &&
                        !peerConnection.current.currentLocalDescription) {  // Check if we haven't already created an offer
                        console.log('Creating initial offer...');
                        const offer = await peerConnection.current.createOffer();
                        await peerConnection.current.setLocalDescription(offer);
                        socket.emit('offer', { 
                            offer,
                            roomId,
                            from: socket.id
                        });
                    }
                } catch (error) {
                    console.error('Error creating offer:', error);
                }
            }
        });

        socket.on('participant-left', () => {
            setIsConnected(false);
            setParticipantCount(prev => prev - 1);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
            if (isRecording) {
                stopRecording();
            }
        });

        socket.on('ice-candidate', async (data: IceCandidateMessage) => {
            try {
                if (data.candidate && peerConnection.current && data?.from !== socket.id) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        socket.on('offer', async (data: OfferMessage) => {
            if (!peerConnection.current || data.from === socket.id) return;
            
            console.log('Received offer from:', data.from, 'Current state:', peerConnection.current.signalingState);
            try {
                const pc = peerConnection.current;
                
                if (pc.signalingState !== "stable") {
                    console.log('Handling colliding offers...');
                    // Only the "polite" peer rolls back
                    if (data.from > socket.id!) {
                        await Promise.all([
                            pc.setLocalDescription({type: "rollback"}),
                            pc.setRemoteDescription(new RTCSessionDescription(data.offer))
                        ]);
                    } else {
                        console.log('Ignoring offer as impolite peer');
                        return;
                    }
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                }
                
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                socket.emit('answer', { 
                    answer,
                    to: data.from,
                    roomId,
                    from: socket.id
                });
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });
        

        socket.on('answer', async (data: AnswerMessage) => {
            console.log('Received answer, signaling state:', peerConnection.current?.signalingState);
    
            try {
                if (peerConnection.current && 
                    peerConnection.current.signalingState === 'have-local-offer') {
                    await peerConnection.current.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                } else {
                    console.log('Peer connection not in correct state for setting remote answer:', 
                               peerConnection.current?.signalingState);
                }
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        });

        return () => {
            endCall();
            socket.disconnect();
        };
    }, [roomId]);

    return {
        localVideoRef,
        remoteVideoRef,
        isConnected,
        isVideoEnabled,
        isAudioEnabled,
        isScreenSharing,
        isRecording,
        participantCount,
        toggleVideo,
        toggleAudio,
        startScreenShare,
        stopScreenShare,
        startRecording,
        stopRecording,
        endCall
    };
};