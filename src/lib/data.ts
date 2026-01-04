// Types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  department: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

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

// Sample Data
const sampleUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.student@university.edu',
    password: 'password123',
    name: 'John Anderson',
    role: 'student',
    department: 'Computer Science',
    phone: '+1 555-0123',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'admin@university.edu',
    password: 'admin123',
    name: 'Sarah Mitchell',
    role: 'admin',
    department: 'Campus Operations',
    phone: '+1 555-0456',
    createdAt: '2023-06-01T09:00:00Z',
  },
  {
    id: 'user-3',
    email: 'prof.williams@university.edu',
    password: 'staff123',
    name: 'Dr. Robert Williams',
    role: 'staff',
    department: 'Engineering',
    phone: '+1 555-0789',
    createdAt: '2023-09-01T08:00:00Z',
  },
];

const sampleIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Broken Air Conditioning in Library',
    description: 'The AC unit in the main library reading area has been malfunctioning for the past week. It makes a loud noise and barely cools the room, making it difficult for students to concentrate.',
    type: 'infrastructure',
    priority: 'high',
    status: 'in-progress',
    location: { name: 'Main Library - Reading Hall', coordinates: { lat: 40.7128, lng: -74.006 } },
    reporterId: 'user-1',
    reporterName: 'John Anderson',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-28T14:30:00Z',
    updatedAt: '2024-12-29T09:15:00Z',
    assignedTo: 'user-2',
    comments: [
      {
        id: 'comment-1',
        issueId: 'issue-1',
        userId: 'user-2',
        userName: 'Sarah Mitchell',
        content: 'Maintenance team has been notified. They will inspect the AC unit tomorrow.',
        isInternal: false,
        createdAt: '2024-12-29T09:15:00Z',
      },
    ],
  },
  {
    id: 'issue-2',
    title: 'WiFi Connectivity Issues in Dormitory B',
    description: 'Students in Dormitory B are experiencing frequent WiFi disconnections, especially during evening hours. This is affecting our ability to attend online classes and submit assignments.',
    type: 'technical',
    priority: 'urgent',
    status: 'new',
    location: { name: 'Dormitory B - All Floors', coordinates: { lat: 40.7138, lng: -74.008 } },
    reporterId: 'user-1',
    reporterName: 'Anonymous',
    isAnonymous: true,
    attachments: [],
    createdAt: '2024-12-30T18:45:00Z',
    updatedAt: '2024-12-30T18:45:00Z',
    comments: [],
  },
  {
    id: 'issue-3',
    title: 'Suggestion: Add More Bike Parking',
    description: 'With the increasing number of students cycling to campus, we need more bike parking spaces near the Science Building. Current racks are always full by 9 AM.',
    type: 'suggestion',
    priority: 'low',
    status: 'under-review',
    location: { name: 'Science Building - Entrance', coordinates: { lat: 40.7118, lng: -74.005 } },
    reporterId: 'user-3',
    reporterName: 'Dr. Robert Williams',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-25T11:20:00Z',
    updatedAt: '2024-12-27T16:30:00Z',
    comments: [],
  },
  {
    id: 'issue-4',
    title: 'Elevator Out of Service',
    description: 'The main elevator in the Engineering Building has been out of service for 3 days. This is causing significant inconvenience for students with disabilities.',
    type: 'infrastructure',
    priority: 'urgent',
    status: 'resolved',
    location: { name: 'Engineering Building', coordinates: { lat: 40.7148, lng: -74.007 } },
    reporterId: 'user-1',
    reporterName: 'John Anderson',
    isAnonymous: false,
    attachments: [],
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-23T14:00:00Z',
    assignedTo: 'user-2',
    comments: [
      {
        id: 'comment-2',
        issueId: 'issue-4',
        userId: 'user-2',
        userName: 'Sarah Mitchell',
        content: 'The elevator has been repaired and is now fully operational. Thank you for your patience.',
        isInternal: false,
        createdAt: '2024-12-23T14:00:00Z',
      },
    ],
  },
  {
    id: 'issue-5',
    title: 'Harassment Incident Report',
    description: 'I witnessed inappropriate behavior in the cafeteria area. Details have been documented for review by the administration.',
    type: 'harassment',
    priority: 'high',
    status: 'in-progress',
    location: { name: 'Student Center - Cafeteria', coordinates: { lat: 40.7158, lng: -74.004 } },
    reporterId: 'user-1',
    reporterName: 'Anonymous',
    isAnonymous: true,
    attachments: [],
    createdAt: '2024-12-29T12:00:00Z',
    updatedAt: '2024-12-29T15:30:00Z',
    assignedTo: 'user-2',
    comments: [],
  },
];

const sampleNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Issue Status Updated',
    message: 'Your issue "Broken Air Conditioning in Library" is now being addressed.',
    type: 'info',
    isRead: false,
    createdAt: '2024-12-29T09:15:00Z',
    link: '/my-reports',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Issue Resolved',
    message: 'Great news! Your issue "Elevator Out of Service" has been resolved.',
    type: 'success',
    isRead: true,
    createdAt: '2024-12-23T14:00:00Z',
    link: '/my-reports',
  },
];

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'campus_users',
  ISSUES: 'campus_issues',
  NOTIFICATIONS: 'campus_notifications',
  CURRENT_USER: 'campus_current_user',
};

// Initialize localStorage with sample data
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(sampleIssues));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(sampleNotifications));
  }
};

// User Functions
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const createUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | undefined => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  users[index] = { ...users[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return users[index];
};

// Auth Functions
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const login = (email: string, password: string): User | null => {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logout = () => {
  setCurrentUser(null);
};

// Issue Functions
export const getIssues = (): Issue[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
  return data ? JSON.parse(data) : [];
};

export const getIssueById = (id: string): Issue | undefined => {
  return getIssues().find(i => i.id === id);
};

export const getIssuesByReporter = (reporterId: string): Issue[] => {
  return getIssues().filter(i => i.reporterId === reporterId);
};

export const createIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Issue => {
  const issues = getIssues();
  const newIssue: Issue = {
    ...issue,
    id: `issue-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  };
  issues.push(newIssue);
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  return newIssue;
};

export const updateIssue = (id: string, updates: Partial<Issue>): Issue | undefined => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === id);
  if (index === -1) return undefined;
  issues[index] = { ...issues[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  return issues[index];
};

export const deleteIssue = (id: string): boolean => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === id);
  if (index === -1) return false;
  issues.splice(index, 1);
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  return true;
};

export const addComment = (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Comment | undefined => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === issueId);
  if (index === -1) return undefined;
  
  const newComment: Comment = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  issues[index].comments.push(newComment);
  issues[index].updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  return newComment;
};

// Notification Functions
export const getNotifications = (userId: string): Notification[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = data ? JSON.parse(data) : [];
  return notifications.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = data ? JSON.parse(data) : [];
  
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  
  notifications.push(newNotification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  return newNotification;
};

export const markNotificationAsRead = (id: string) => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = data ? JSON.parse(data) : [];
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].isRead = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
};

export const markAllNotificationsAsRead = (userId: string) => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const notifications: Notification[] = data ? JSON.parse(data) : [];
  notifications.forEach(n => {
    if (n.userId === userId) n.isRead = true;
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

// Statistics
export const getStatistics = (userId?: string) => {
  const issues = userId ? getIssuesByReporter(userId) : getIssues();
  
  return {
    total: issues.length,
    new: issues.filter(i => i.status === 'new').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    underReview: issues.filter(i => i.status === 'under-review').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    closed: issues.filter(i => i.status === 'closed').length,
    byType: {
      infrastructure: issues.filter(i => i.type === 'infrastructure').length,
      harassment: issues.filter(i => i.type === 'harassment').length,
      technical: issues.filter(i => i.type === 'technical').length,
      suggestion: issues.filter(i => i.type === 'suggestion').length,
    },
    byPriority: {
      low: issues.filter(i => i.priority === 'low').length,
      medium: issues.filter(i => i.priority === 'medium').length,
      high: issues.filter(i => i.priority === 'high').length,
      urgent: issues.filter(i => i.priority === 'urgent').length,
    },
  };
};

// Campus Locations
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
