import AgoraRTC from 'agora-rtc-sdk-ng';

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
    this.appId = import.meta.env.VITE_AGORA_APP_ID || 'your-app-id';
  }

  async initialize() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  async joinChannel(channelName, token, uid, onUserJoined, onUserLeft) {
    if (!this.client) await this.initialize();
    
    // Event listeners for remote users
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        this.remoteUsers[user.uid] = user;
        onUserJoined(user);
      }
      
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    });

    this.client.on('user-unpublished', (user) => {
      delete this.remoteUsers[user.uid];
      onUserLeft(user);
    });

    // Join the channel
    await this.client.join(this.appId, channelName, token || null, uid || null);
    
    // Create and publish local tracks
    [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
    
    return {
      localAudioTrack: this.localAudioTrack,
      localVideoTrack: this.localVideoTrack
    };
  }

  async leaveChannel() {
    // Destroy local tracks
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    
    // Leave the channel
    await this.client?.leave();
    
    this.remoteUsers = {};
    this.localAudioTrack = null;
    this.localVideoTrack = null;
  }

  // Mute/unmute local audio
  toggleMute() {
    if (this.localAudioTrack) {
      const muted = !this.localAudioTrack.muted;
      this.localAudioTrack.setMuted(muted);
      return muted;
    }
    return false;
  }

  // Enable/disable local video
  toggleVideo() {
    if (this.localVideoTrack) {
      const disabled = !this.localVideoTrack.muted;
      this.localVideoTrack.setMuted(disabled);
      return disabled;
    }
    return false;
  }
}

export default new AgoraService();