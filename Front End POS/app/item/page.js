'use client';

import { useState, useEffect, useCallback } from 'react';
import ItemService from '@/services/item.service'; 
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';


const BACKEND_URL = 'http://localhost:8080'; 

export default function ItemPage() {
  // Global States
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search States
  const [searchName, setSearchName] = useState('');
  const [searchCategoryId, setSearchCategoryId] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategoryId, setNewItemCategoryId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

 
  const fetchCategoryList = useCallback(async () => {
    try {
      const response = await ItemService.GetCategoryList();
      const categoryData = response.data?.data || response.data || [];
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching category list:", err);
      setError(err.response?.data?.message || 'Failed to load category dropdown list.');
    }
  }, []);


  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        itemsPerPage: rowsPerPage,
        page: page,
        sortBy: [{ key: 'id', order: 'desc' }],
        search: {
          name: searchName,
          category_id: searchCategoryId
        }
      };
      
      const response = await ItemService.GetAll(params);
      const fetchedData = response.data?.data || response.data;
      
      setItems(fetchedData?.rows || fetchedData || []);
      setTotalItems(fetchedData?.count || (fetchedData || []).length);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.response?.data?.message || 'Request failed with status code 401. Session expired.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchName, searchCategoryId]);

  
  useEffect(() => {
    fetchCategoryList(); 
    fetchItems();        
  }, [fetchCategoryList, fetchItems]);


  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '-') return 'https://via.placeholder.com/40?text=No+Img';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
   
    return `${BACKEND_URL}/uploads/images/item/${imagePath}`;
  };

  // Search & Clear Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); 
    fetchItems();
  };

  const handleClear = () => {
    setSearchName('');
    setSearchCategoryId('');
    setPage(1);
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1); 
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

 
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategoryId) {
      alert("Please fill all required fields");
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        name: newItemName,
        price: newItemPrice,
        category_id: newItemCategoryId,
        image: selectedFile,
        deleted: false
      };

      const response = await ItemService.Save(payload);
      
      if (response.data) {
        
        setNewItemName('');
        setNewItemPrice('');
        setNewItemCategoryId('');
        setSelectedFile(null);
        setOpenAddDialog(false); 
        
       
        fetchItems();
      }
    } catch (err) {
      console.error("Error saving item:", err);
      alert(err.response?.data?.message || "Failed to save item. 401 Unauthorized.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f4f6f9', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1a2035' }}>
        POS Dashboard / Item Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search Options Section */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Search Option</Typography>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Item Name"
              size="small"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              select
              label="Category"
              size="small"
              value={searchCategoryId}
              onChange={(e) => setSearchCategoryId(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value=""><em>All Categories</em></MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" color="primary" size="medium">
              SEARCH
            </Button>
            <Button variant="outlined" color="secondary" size="medium" onClick={handleClear}>
              CLEAR
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Item List Table Section */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Item List</Typography>
            {}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
            >
              ADD ITEM
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price (MMK)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category_name || item.category?.name || '-'}</TableCell>
                      <TableCell>
                        {}
                        <Box 
                          component="img" 
                          src={getImageUrl(item.image)} 
                          alt={item.name}
                          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', border: '1px solid #eee' }} 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=Error'; }}
                        />
                      </TableCell>
                      <TableCell>{Number(item.price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalItems}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {}
      {/* ======================================================= */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
          Add New Product Item
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveItem}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <TextField
              label="Item Name *"
              fullWidth
              size="small"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
            
            <TextField
              label="Price (MMK) *"
              type="number"
              fullWidth
              size="small"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              required
            />

            <TextField
              select
              label="Select Category *"
              fullWidth
              size="small"
              value={newItemCategoryId}
              onChange={(e) => setNewItemCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>

            {/* Image File Input Uploader */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>Product Image</Typography>
              <Button variant="outlined" component="label" fullWidth size="small" sx={{ textTransform: 'none' }}>
                {selectedFile ? selectedFile.name : 'Choose Image File...'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Button>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa', borderTop: '1px solid #eee' }}>
            <Button 
              onClick={() => setOpenAddDialog(false)} 
              variant="outlined" 
              color="secondary" 
              startIcon={<CancelIcon />}
              disabled={saveLoading}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="success" 
              startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saveLoading}
            >
              {saveLoading ? 'SAVING...' : 'SAVE ITEM'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
}