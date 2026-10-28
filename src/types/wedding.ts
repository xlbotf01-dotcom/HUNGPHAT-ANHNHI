export interface WeddingConfig {
  couple: {
    groomDisplayName: string;
    brideDisplayName: string;
    groomFullName: string;
    brideFullName: string;
    weddingDate: string; // YYYY-MM-DD
    weddingTime: string; // HH:mm
    timezone: string;
  };
  cover: {
    enabled: boolean;
    invitationLabel: string;
    guestGreeting: string;
    invitationMessage: string;
    coverButtonText: string;
    dragonPhoenixUrl: string;
    sealText: string;
  };
  hero: {
    enabled: boolean;
    toplineLabel: string;
    ceremonyLabel: string;
    blessingQuote: string;
    floralImageUrl: string;
    dragonImageUrl: string;
  };
  loveStory?: {
    enabled: boolean;
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      year: string;
      title: string;
      description: string;
      imageUrl?: string;
    }>;
  };
  families: {
    enabled: boolean;
    heading: string;
    invitationSubtitle: string;
    guestName: string;
    sectionTitle: string;
    groomFamilyHeading: string;
    groomParents: string[];
    groomAddress: string;
    brideFamilyHeading: string;
    brideParents: string[];
    brideAddress: string;
    ceremonyTitle: string;
    dayOfWeek: string;
    timeDescription: string;
    lunarDate: string;
    detailsDragonUrl?: string;
    detailsFloralTopUrl?: string;
    detailsFloralBottomUrl?: string;
  };
  timeline: {
    enabled: boolean;
    title: string;
    events: Array<{
      id: string;
      time: string;
      title: string;
      description?: string;
      enabled: boolean;
    }>;
  };
  portraits: {
    enabled: boolean;
    groomImageUrl: string;
    brideImageUrl: string;
    groomAlt?: string;
    brideAlt?: string;
    verse: string;
  };
  venue: {
    enabled: boolean;
    heading: string;
    venueName: string;
    venueAddress: string;
    directionsUrl: string;
    mapEmbedUrl: string;
    couplePortraitUrl: string;
  };
  countdown: {
    enabled: boolean;
    completedMessage: string;
  };
  calendar: {
    enabled: boolean;
  };
  gallery: {
    enabled: boolean;
    backdropUrl: string;
    items: Array<{
      id: string;
      url: string;
      alt: string;
      caption?: string;
      enabled: boolean;
    }>;
  };
  rsvp: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    allowDietary: boolean;
    allowGuestCount: boolean;
  };
  wishes: {
    enabled: boolean;
    title: string;
    requireApproval: boolean;
  };
  banking: {
    enabled: boolean;
    title: string;
    subtitle: string;
    groom: {
      enabled: boolean;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      qrImageUrl: string;
    };
    bride: {
      enabled: boolean;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      qrImageUrl: string;
    };
  };
  closing: {
    enabled: boolean;
    portraitUrl: string;
    quote: string;
    hostName: string;
    hostSubtitle: string;
    closingInvitation: string;
  };
  music: {
    enabled: boolean;
    audioUrl: string;
    volume: number;
    loop: boolean;
  };
  seo: {
    pageTitle: string;
    metaDescription: string;
    socialTitle: string;
    socialDescription: string;
    socialImageUrl: string;
  };
}

export interface RSVPSubmission {
  id: string;
  guestName: string;
  phone?: string;
  attending: 'attending' | 'not_attending';
  guestCount: number;
  side: 'groom' | 'bride' | 'mutual';
  message?: string;
  dietary?: string;
  createdAt: string;
}

export interface WeddingWish {
  id: string;
  senderName: string;
  message: string;
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
}

export interface AdminStats {
  totalRsvp: number;
  attendingCount: number;
  notAttendingCount: number;
  totalGuests: number;
  pendingWishes: number;
  approvedWishes: number;
  lastUpdated: string;
}
