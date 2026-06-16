'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid, TextField, Button,
  IconButton, Snackbar, Alert, Divider, Autocomplete, InputAdornment
} from '@mui/material';
import {
  ArrowCircleLeft as ArrowLeftIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import userService from '@/services/user.service';

export default function UserEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const port = "http://localhost:8080";

  // Form States
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  // UI States
  const [roleList, setRoleList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };

  // Initial Loading (Roles & Edit Check)
  useEffect(() => {
    userService.GetRoleList()
      .then((res) => setRoleList(res.data || []))
      .catch((err) => showSnackbar(err.message, 'error'));

    if (userId && parseInt(userId) > 0) {
      setIsEdit(true);
      userService.GetById(parseInt(userId))
        .then((res) => {
          if (res.data) {
            setName(res.data.name || '');
            setPreviewImage(`${port}/uploads/images/user/${res.data.image}`);
            
            userService.GetRoleList().then((roleRes) => {
              const currentRole = roleRes.data?.find(r => r.id === res.data.role_id);
              setSelectedRole(currentRole || null);
            });
          }
        })
        .catch((err) => showSnackbar(err.message, 'error'));
    }
  }, [userId]);

  // File Change Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Validation & Submit
  const handleSave = (e) => {
    e.preventDefault();
    let tempErrors = {};

    if (!name.trim()) tempErrors.name = 'This field is required.';
    if (!isEdit && !password.trim()) tempErrors.password = 'This field is required.';
    if (!selectedRole) tempErrors.role = 'This field is required.';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    
    const payload = {
      id: userId ? parseInt(userId) : 0,
      name,
      password,
      role_id: selectedRole.id,
      image: imageFile || (isEdit ? previewImage.split('/').pop() : '') 
    };

    userService.Save(payload)
      .then((res) => {
        showSnackbar(res.data?.message || 'Action completed successfully', 'success');
        setTimeout(() => router.push('/user'), 1000);
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
              <IconButton color="primary" onClick={() => router.push('/user')}>
                <ArrowLeftIcon fontSize="large" />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>User Entry</Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleSave} noValidate sx={{ mt: 2 }}>
            <Grid container spacing={3} alignItems="center">
              
              {/* User Name */}
              <Grid item xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
                <Typography>User Name <span style={{ color: 'red' }}>*</span> :</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }); }}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={6} />

              {/* Password */}
              <Grid item xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
                <Typography>Password <span style={{ color: 'red' }}>*</span> :</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small"
                  disabled={isEdit}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} />

              {/* Select Role */}
              <Grid item xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
                <Typography>Select Role <span style={{ color: 'red' }}>*</span> :</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  size="small"
                  options={roleList}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedRole}
                  onChange={(event, newValue) => {
                    setSelectedRole(newValue);
                    setErrors({ ...errors, role: '' });
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      error={!!errors.role} 
                      helperText={errors.role} 
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} />

              {/* Image Input */}
              <Grid item xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
                <Typography>Image :</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="outlined" component="label" size="small" fullWidth>
                  Upload File
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {previewImage && (
                  <Box sx={{ mt: 2 }}>
                    <img src={previewImage} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                  </Box>
                )}
              </Grid>
            </Grid>

            {/* Form Buttons */}
            <Grid container sx={{ mt: 4 }}>
              <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                <Button variant="contained" color="warning" size="small" onClick={() => router.push('/user')} sx={{ mr: 2 }}>
                  Back
                </Button>
                <Button type="submit" variant="contained" color="primary" size="small">
                  {isEdit ? "Update" : "Save"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.color === 'success' ? 'success' : 'error'}>{snackbar.text}</Alert>
      </Snackbar>
    </Box>
  );
}