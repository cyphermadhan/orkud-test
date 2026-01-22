import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data storage file
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data structure
let data = {
  users: [],
  posts: [],
  comments: [],
  likes: [],
  follows: [],
  supportTickets: []
};

// Load data from file if it exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    data = JSON.parse(fileData);
  } catch (error) {
    console.log('Error loading data, starting fresh');
  }
}

// Save data to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize with a default user if no users exist
if (data.users.length === 0) {
  const defaultUser = {
    id: uuidv4(),
    username: 'demo_user',
    email: 'demo@example.com',
    bio: 'Welcome to Orkud!',
    createdAt: new Date().toISOString()
  };
  data.users.push(defaultUser);
  saveData();
}

// Get current user (mock - in real app this would come from auth)
app.get('/api/user/current', (req, res) => {
  const currentUser = data.users[0] || null;
  res.json(currentUser);
});

// Get all posts
app.get('/api/posts', (req, res) => {
  const { userId } = req.query;
  const posts = data.posts.map(post => {
    const author = data.users.find(u => u.id === post.userId);
    const likes = data.likes.filter(l => l.postId === post.id);
    const comments = data.comments.filter(c => c.postId === post.id);
    const isLiked = userId ? data.likes.some(l => l.postId === post.id && l.userId === userId) : false;
    return {
      ...post,
      author: author ? { id: author.id, username: author.username } : null,
      likesCount: likes.length,
      commentsCount: comments.length,
      isLiked
    };
  });
  // Sort by newest first
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

// Create a post
app.post('/api/posts', (req, res) => {
  const { content, userId } = req.body;
  if (!content || !userId) {
    return res.status(400).json({ error: 'Content and userId are required' });
  }

  const post = {
    id: uuidv4(),
    content,
    userId,
    createdAt: new Date().toISOString()
  };

  data.posts.push(post);
  saveData();

  const author = data.users.find(u => u.id === userId);
  res.json({
    ...post,
    author: author ? { id: author.id, username: author.username } : null,
    likesCount: 0,
    commentsCount: 0
  });
});

// Get post by ID
app.get('/api/posts/:id', (req, res) => {
  const post = data.posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const author = data.users.find(u => u.id === post.userId);
  const likes = data.likes.filter(l => l.postId === post.id);
  const comments = data.comments
    .filter(c => c.postId === post.id)
    .map(comment => {
      const commentAuthor = data.users.find(u => u.id === comment.userId);
      return {
        ...comment,
        author: commentAuthor ? { id: commentAuthor.id, username: commentAuthor.username } : null
      };
    });

  res.json({
    ...post,
    author: author ? { id: author.id, username: author.username } : null,
    likesCount: likes.length,
    commentsCount: comments.length,
    comments: comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  });
});

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
  const { userId } = req.body;
  const postId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'UserId is required' });
  }

  const existingLike = data.likes.find(l => l.postId === postId && l.userId === userId);
  if (existingLike) {
    // Unlike
    data.likes = data.likes.filter(l => l.id !== existingLike.id);
    saveData();
    return res.json({ liked: false, likesCount: data.likes.filter(l => l.postId === postId).length });
  }

  const like = {
    id: uuidv4(),
    postId,
    userId,
    createdAt: new Date().toISOString()
  };

  data.likes.push(like);
  saveData();

  res.json({ liked: true, likesCount: data.likes.filter(l => l.postId === postId).length });
});

// Comment on a post
app.post('/api/posts/:id/comment', (req, res) => {
  const { content, userId } = req.body;
  const postId = req.params.id;

  if (!content || !userId) {
    return res.status(400).json({ error: 'Content and userId are required' });
  }

  const comment = {
    id: uuidv4(),
    postId,
    content,
    userId,
    createdAt: new Date().toISOString()
  };

  data.comments.push(comment);
  saveData();

  const commentAuthor = data.users.find(u => u.id === userId);
  res.json({
    ...comment,
    author: commentAuthor ? { id: commentAuthor.id, username: commentAuthor.username } : null
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(data.users);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = data.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const posts = data.posts.filter(p => p.userId === user.id);
  const followers = data.follows.filter(f => f.followingId === user.id);
  const following = data.follows.filter(f => f.followerId === user.id);

  res.json({
    ...user,
    postsCount: posts.length,
    followersCount: followers.length,
    followingCount: following.length
  });
});

// Follow a user
app.post('/api/users/:id/follow', (req, res) => {
  const { userId } = req.body;
  const followingId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'UserId is required' });
  }

  if (userId === followingId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const existingFollow = data.follows.find(f => f.followerId === userId && f.followingId === followingId);
  if (existingFollow) {
    // Unfollow
    data.follows = data.follows.filter(f => f.id !== existingFollow.id);
    saveData();
    return res.json({ following: false });
  }

  const follow = {
    id: uuidv4(),
    followerId: userId,
    followingId,
    createdAt: new Date().toISOString()
  };

  data.follows.push(follow);
  saveData();

  res.json({ following: true });
});

// Check if user is following another user
app.get('/api/users/:id/follow-status', (req, res) => {
  const { userId } = req.query;
  const followingId = req.params.id;

  if (!userId) {
    return res.json({ following: false });
  }

  const isFollowing = data.follows.some(f => f.followerId === userId && f.followingId === followingId);
  res.json({ following: isFollowing });
});

// Search posts
app.get('/api/search/posts', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  const query = q.toLowerCase();
  const matchingPosts = data.posts
    .filter(post => post.content.toLowerCase().includes(query))
    .map(post => {
      const author = data.users.find(u => u.id === post.userId);
      const likes = data.likes.filter(l => l.postId === post.id);
      const comments = data.comments.filter(c => c.postId === post.id);
      return {
        ...post,
        author: author ? { id: author.id, username: author.username } : null,
        likesCount: likes.length,
        commentsCount: comments.length
      };
    });

  res.json(matchingPosts);
});

// Search users
app.get('/api/search/users', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  const query = q.toLowerCase();
  const matchingUsers = data.users.filter(user =>
    user.username.toLowerCase().includes(query) ||
    (user.email && user.email.toLowerCase().includes(query))
  );

  res.json(matchingUsers);
});

// Update user profile
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, bio } = req.body;

  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (bio !== undefined) user.bio = bio;

  saveData();
  res.json(user);
});

// Delete user profile
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  data.users = data.users.filter(u => u.id !== userId);
  data.posts = data.posts.filter(p => p.userId !== userId);
  data.comments = data.comments.filter(c => c.userId !== userId);
  data.likes = data.likes.filter(l => l.userId !== userId);
  data.follows = data.follows.filter(f => f.followerId !== userId && f.followingId !== userId);

  saveData();
  res.json({ success: true });
});

// Create support ticket
app.post('/api/support/tickets', (req, res) => {
  const { subject, message, userId } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const ticket = {
    id: uuidv4(),
    subject,
    message,
    userId: userId || null,
    status: 'open',
    createdAt: new Date().toISOString()
  };

  data.supportTickets.push(ticket);
  saveData();

  res.json(ticket);
});

// Get support tickets (for current user)
app.get('/api/support/tickets', (req, res) => {
  const { userId } = req.query;
  let tickets = data.supportTickets;

  if (userId) {
    tickets = tickets.filter(t => t.userId === userId);
  }

  res.json(tickets);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
