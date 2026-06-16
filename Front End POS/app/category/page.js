'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import categoryService from '@/services/category.service';

const PORT = 'http://localhost:8080';

export default function CategoryPage() {
  // 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordTotal, setRecordTotal] = useState(0);

  
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchName, setSearchName] = useState('');

  // Form Dialog (Entry Block) States
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [category, setCategory] = useState({ id: 0, name: '', image: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Confirm Delete Dialog States
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  // Alert Snackbar States
  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });

  
  const getAllCategories = () => {
    setLoading(true);
    
    const paginationModel = {
      page: page + 1, 
      itemsPerPage: rowsPerPage,
      search: { name: searchName },
      sortBy: [{ key: 'id', order: 'desc' }]
    };

    categoryService.GetAll(paginationModel)
      .then((res) => {
        setItems(res.data.data || []);
        setRecordTotal(res.data.total || 0);
      })
      .catch((err) => {
        showSnackbar(err.message || 'Error fetching data', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  
  useEffect(() => {
    getAllCategories();
  }, [page, rowsPerPage]);

 
  
  const handleSearch = () => {
    setPage(0); 
    getAllCategories();
  };

  const handleReset = () => {
    setSearchName('');
    setPage(0);
   
    setLoading(true);
    categoryService.GetAll({ page: 1, itemsPerPage: rowsPerPage, search: { name: '' }, sortBy: [{ key: 'id', order: 'desc' }] })
      .then((res) => {
        setItems(res.data.data || []);
        setRecordTotal(res.data.total || 0);
      }).finally(() => setLoading(false));
  };

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };

  
  const handleOpenCreate = () => {
    setIsEdit(false);
    setCategory({ id: 0, name: '', image: '' });
    setPreviewImage(null);
    setSelectedFile(null);
    setOpenDialog(true);
  };

  
  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCategory({ id: item.id, name: item.name, image: item.image });
    setPreviewImage(item.image ? `${PORT}/uploads/images/category/${item.image}` : null);
    setSelectedFile(null);
    setOpenDialog(true);
  };

  
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

 
  const handleSave = (e) => {
    e.preventDefault();
    if (!category.name.trim()) {
      showSnackbar('Category Name is required', 'error');
      return;
    }

   
    const saveData = {
      id: category.id,
      name: category.name,
      image: selectedFile ? selectedFile : category.image 
    };

    categoryService.Save(saveData)
      .then((res) => {
        const isSuccess = res.data.success;
        showSnackbar(res.data.message, isSuccess ? 'success' : 'error');
        if (isSuccess) {
          setOpenDialog(false);
          getAllCategories();
        }
      })
      .catch((err) => {
        showSnackbar(err.message, 'error');
      });
  };


  const handleOpenDelete = (id) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  
  const handleConfirmDelete = () => {
    categoryService.Delete(selectedId)
      .then((res) => {
        const isSuccess = res.data.success;
        showSnackbar(res.data.message, isSuccess ? 'success' : 'error');
        setOpenConfirm(false);
        getAllCategories();
      })
      .catch((err) => {
        showSnackbar(err.message, 'error');
      });
  };

  return (
    <Box sx={{ width: '100%' }}>
      
      {}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>Search Option</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Category Name"
              variant="outlined"
              size="small"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              sx={{ minWidth: 250 }}
            />
            <Button variant="contained" color="warning" size="small" startIcon={<ClearIcon />} onClick={handleReset}>
              Clear
            </Button>
            <Button variant="contained" color="primary" size="small" startIcon={<SearchIcon />} onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {}
      <Card elevation={3}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Category List
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} size="small" onClick={handleOpenCreate}>
            Add Category
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="category table">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">Loading details...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">No data found</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <IconButton color="orange" onClick={() => handleOpenEdit(row)} sx={{ color: 'orange', mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDelete(row.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Avatar
                        src={row.image ? `${PORT}/uploads/images/category/${row.image}` : '/logo.png'}
                        alt="Category Image"
                        variant="rounded"
                        sx={{ width: 45, height: 45 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {}
        <TablePagination
          rowsPerPageOptions={[1, 2, 3, 10, 20, 40]}
          component="div"
          count={recordTotal}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEdit ? 'Edit Category' : 'Category Entry'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 1 }}>
              <TextField
                label="Category Name"
                variant="outlined"
                fullWidth
                required
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
              />
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                  Category Image:
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mr: 2 }}
                >
                  Upload File
                  <input type="file" hidden accept="image/*" onChange={onFileChange} />
                </Button>
                
                {previewImage && (
                  <Box sx={{ mt: 2 }}>
                    <img src={previewImage} alt="Preview" style={{ maxWidth: '120px', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="warning">
              Back
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Alert</DialogTitle>
        <DialogContent>
          <Typography>Are you sure want to delete this category?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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