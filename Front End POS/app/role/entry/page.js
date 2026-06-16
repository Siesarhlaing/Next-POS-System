'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid, TextField, Button,
  IconButton, Snackbar, Alert, Divider
} from '@mui/material';

import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import roleService from '@/services/role.service';

export default function RoleEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('id'); 

  // States
  const [name, setName] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [errorText, setErrorText] = useState(''); 

  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };

 
  useEffect(() => {
    if (roleId && parseInt(roleId) > 0) {
      setIsEdit(true);
      roleService.GetById(parseInt(roleId))
        .then((res) => {
          if (res.data) {
            setName(res.data.name || '');
          }
        })
        .catch((err) => {
          showSnackbar(err.message, 'error');
        });
    }
  }, [roleId]);

  
  const handleSave = (e) => {
    e.preventDefault();

    
    if (!name.trim()) {
      setErrorText('Name is required');
      return;
    }

    const payload = {
      id: roleId ? parseInt(roleId) : 0,
      name: name
    };

    roleService.Save(payload)
      .then((res) => {
        showSnackbar(res.message || 'Saved successfully!', 'success');
       
        setTimeout(() => {
          router.push('/role');
        }, 1000);
      })
      .catch((err) => {
        showSnackbar(err.message, 'error');
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="primary" onClick={() => router.push('/role')}>
                <ArrowCircleLeftIcon fontSize="large" />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Role Entry</Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleSave} noValidate sx={{ mt: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
                <Typography sx={{ fontWeight: '500' }}>Role Name</Typography>
              </Grid>
              <Grid xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value) setErrorText(''); 
                  }}
                  error={!!errorText}
                  helperText={errorText}
                  required
                />
              </Grid>
            </Grid>

            {}
            <Grid container sx={{ mt: 4 }}>
              <Grid item xs={12} sm={7} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => router.push('/role')}
                  sx={{ mr: 2 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {isEdit ? 'Update' : 'Save'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.color === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}