import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

export default function SellerFeed() {
  usePageTitle('Seller Feed');
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/sellers/posts');
      setPosts(data.data?.posts || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await api.post('/sellers/posts', { content: newPost.trim() });
      setNewPost('');
      toast.success('Post created!');
      fetchPosts();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-2">Feed</h1>
      <p className="text-text-secondary mb-8">Share updates, process photos, and new product drops with your customers</p>

      <Card className="mb-8">
        <CardContent className="p-4">
          <form onSubmit={handlePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's new in your workshop?"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-text-muted">Share your craft journey with your customers</p>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={posting || !newPost.trim()}>
                  <Send size={14} className="mr-1" /> {posting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No posts yet. Share your first update!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">{user?.name?.[0] || 'S'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{user?.name}</span>
                      <span className="text-xs text-text-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    {post.images?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {post.images.map((img, i) => (
                          <img key={i} loading="lazy" src={img.url} alt="" className="w-24 h-24 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
