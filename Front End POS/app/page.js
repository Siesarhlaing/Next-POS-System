'use client';

import { useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: username,
        password: password
      });

      console.log("=== BACKEND RAW RESPONSE ===", response.data);

      
      if (response.data && response.data.success === false) {
        setError(response.data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return; 
      }

      
      let rawToken = response.data?.token || response.data?.data?.token;

      if (rawToken) {
        let cleanToken = rawToken;
        if (typeof rawToken === 'string' && rawToken.startsWith('Bearer ')) {
          cleanToken = rawToken.replace('Bearer ', '').trim();
        }

        
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('pos_user', JSON.stringify({ token: cleanToken, username: username }));

       
        window.location.href = '/home';
      } else {
        setError('Login passed but no token retrieved from server.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Invalid username or password. Connection refused.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#eef2f3' }}>
      <Card sx={{ minWidth: 350, p: 2, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#1a2035' }}>
            Next YGN POS LOGIN
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ bgcolor: '#1a2035', mt: 1 }}>
              {loading ? 'Logging in...' : 'LOGIN'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}