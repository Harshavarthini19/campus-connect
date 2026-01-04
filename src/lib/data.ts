// Types (kept for compatibility with existing components that may import them)
export interface Issue {
  id: string;
  title: string;
  description: string;
  type: 'infrastructure' | 'harassment' | 'technical' | 'suggestion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in-progress' | 'under-review' | 'resolved' | 'closed';
  location: {
    name: string;
    coordinates?: { lat: number; lng: number };
  };
  reporterId: string;
  reporterName: string;
  isAnonymous: boolean;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Campus Locations (kept as this is static reference data)
export const campusLocations = [
  { name: 'Main Library', coordinates: { lat: 40.7128, lng: -74.006 } },
  { name: 'Science Building', coordinates: { lat: 40.7118, lng: -74.005 } },
  { name: 'Engineering Building', coordinates: { lat: 40.7148, lng: -74.007 } },
  { name: 'Student Center', coordinates: { lat: 40.7158, lng: -74.004 } },
  { name: 'Dormitory A', coordinates: { lat: 40.7133, lng: -74.009 } },
  { name: 'Dormitory B', coordinates: { lat: 40.7138, lng: -74.008 } },
  { name: 'Sports Complex', coordinates: { lat: 40.7168, lng: -74.003 } },
  { name: 'Cafeteria', coordinates: { lat: 40.7143, lng: -74.006 } },
  { name: 'Administration Building', coordinates: { lat: 40.7123, lng: -74.007 } },
  { name: 'Parking Lot A', coordinates: { lat: 40.7113, lng: -74.008 } },
  { name: 'Auditorium', coordinates: { lat: 40.7153, lng: -74.005 } },
  { name: 'Health Center', coordinates: { lat: 40.7163, lng: -74.006 } },
];
