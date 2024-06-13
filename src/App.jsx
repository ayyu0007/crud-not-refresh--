import axios from 'axios';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from 'react-query';

// Create a QueryClient instance
const queryClient = new QueryClient();

const fetchPosts = async () => {
  const res = await axios.get('http://localhost:3030/posts');
  return res.data;
};

const createPost = async (newPost) => {
  const res = await axios.post('http://localhost:3030/posts', newPost);
  return res.data;
};

const updatePost = async (updatedPost) => {
  const res = await axios.put(`http://localhost:3030/posts/${updatedPost.id}`, updatedPost);
  return res.data;
};

const deletePost = async (id) => {
  await axios.delete(`http://localhost:3030/posts/${id}`);
};

const Axios = () => {
  const [data, setData] = useState({ name: '', email: '' });
  const [update, setUpdate] = useState({});

  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery('posts', fetchPosts);

  const createMutation = useMutation(createPost, {
    onSuccess: (newPost) => {
      queryClient.setQueryData('posts', (oldPosts) => [...oldPosts, newPost]);
    }
  });

  const updateMutation = useMutation(updatePost, {
    onSuccess: (updatedPost) => {
      queryClient.setQueryData('posts', (oldPosts) =>
        oldPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
      );
    }
  });

  const deleteMutation = useMutation(deletePost, {
    onSuccess: (_, id) => {
      queryClient.setQueryData('posts', (oldPosts) =>
        oldPosts.filter(post => post.id !== id)
      );
    }
  });

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    createMutation.mutate(data);
    setData({ name: '', email: '' });
  };

  const handleEdit = (index) => {
    let all = posts[index];
    setUpdate(all);
    console.log(all);
  };

  const handleFinalUpdate = () => {
    updateMutation.mutate(update);
    setUpdate({});
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleUpdateChange = (e) => {
    setUpdate({ ...update, [e.target.name]: e.target.value });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <>
      <div>
        <input type="text" name='name' onChange={handleOnChange} value={data.name} />
        <input type="text" name='email' onChange={handleOnChange} value={data.email} />
        <button onClick={handleSubmit}>Submit</button>
      </div>

      <div>
        <input type="text" onChange={handleUpdateChange} value={update.name || ''} name='name' />
        <input type="text" onChange={handleUpdateChange} value={update.email || ''} name='email' />
        <button onClick={handleFinalUpdate}>Update</button>
      </div>

      {posts && posts.map((item, index) => (
        <div key={item.id}>
          <h1>{item.name}</h1>
          <h2>{item.email}</h2>
          <button onClick={() => handleEdit(index)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Axios />
  </QueryClientProvider>
);

export default App;
