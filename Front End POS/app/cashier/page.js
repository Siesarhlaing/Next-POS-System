'use client'; // cashier/page.js

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  AddCircle as AddIcon,
  RemoveCircle as MinusIcon,
  Payment as PaymentIcon,
  Print as PrintIcon
} from '@mui/icons-material';

import categoryService from "@/services/category.service"; 
import saleService from "@/services/sale.service";
import dropdownService from "@/services/dropdown.service";

const PORT = "http://localhost:8080";

// ==========================================

// ==========================================
const CardDialog = forwardRef(({ onAddToCart }, ref) => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({ id: null, name: '', price: 0, image: '' });
  const [qty, setQty] = useState(1);

  useImperativeHandle(ref, () => ({
    OpenDialog(data) {
      setItem(data);
      setQty(1);
      setOpen(true);
    }
  }));

  const handleAdd = () => {
    if (qty > 0) {
      onAddToCart({
        ...item,
        qty: qty,
        total: item.price * qty
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, mt: 1 }}>
          <Avatar
            src={item.image ? `${PORT}/uploads/images/item/${item.image}` : '/logo.png'}
            variant="rounded"
            sx={{ width: 120, height: 120, mx: 'auto' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
          <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>{item.price} MMK</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}>
            <IconButton color="error" onClick={() => setQty(prev => Math.max(1, prev - 1))}>
              <MinusIcon fontSize="large" />
            </IconButton>
            
            <TextField
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              slotProps={{
                input: {
                  min: 1,
                  style: { textAlign: 'center', fontWeight: 'bold' }
                }
              }}
              size="small"
              sx={{ width: 80 }}
            />
            
            <IconButton color="primary" onClick={() => setQty(prev => prev + 1)}>
              <AddIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        <Button onClick={() => setOpen(false)} variant="contained" color="error" fullWidth sx={{ mr: 1 }}>
          CANCEL
        </Button>
        <Button onClick={handleAdd} variant="contained" color="success" fullWidth sx={{ ml: 1 }}>
          ADD TO CART
        </Button>
      </DialogActions>
    </Dialog>
  );
});
CardDialog.displayName = "CardDialog";


// ==========================================
// 
// ==========================================
function RightDrawer({ receiptItems, onRemoveItem, onUpdateQty, onSaveReceipt }) {
  
  const increase = (item) => {
    const updated = { ...item, qty: item.qty + 1 };
    updated.total = updated.qty * updated.price;
    onUpdateQty(updated);
  };

  const decrease = (item) => {
    if (item.qty > 1) {
      const updated = { ...item, qty: item.qty - 1 };
      updated.total = updated.qty * updated.price;
      onUpdateQty(updated);
    }
  };

  const totalAmount = receiptItems.reduce((acc, i) => acc + i.total, 0);

  const printSection = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Card elevation={4} sx={{ height: { xs: 'auto', md: 'calc(100vh - 40px)' }, display: 'flex', flexDirection: 'column', p: 2, position: 'sticky', top: 20 }}>
      <Box id="print-section" sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>NEXT TGI SHOP</Typography>
          <Typography variant="caption" display="block" color="text.secondary">ABC Housing, Kamaryut Tps, Yangon</Typography>
          <Typography variant="caption" display="block" color="text.secondary">09 - 900 900 900</Typography>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '11px', p: 1 }}>Action</TableCell>
                <TableCell sx={{ fontSize: '11px', p: 1 }}>Name</TableCell>
                <TableCell sx={{ fontSize: '11px', p: 1 }} align="center">QTY</TableCell>
                <TableCell sx={{ fontSize: '11px', p: 1 }} align="right">Price</TableCell>
                <TableCell sx={{ fontSize: '11px', p: 1 }} align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receiptItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>Cart is empty</TableCell>
                </TableRow>
              ) : (
                receiptItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ p: 0.5 }}>
                      <IconButton size="small" color="error" onClick={() => onRemoveItem(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: '11px', p: 0.5 }}>{item.name}</TableCell>
                    <TableCell sx={{ p: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <IconButton size="small" color="error" onClick={() => decrease(item)}>
                          <MinusIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>{item.qty}</Typography>
                        <IconButton size="small" color="primary" onClick={() => increase(item)}>
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '11px', p: 0.5 }} align="right">{item.price}</TableCell>
                    <TableCell sx={{ fontSize: '11px', p: 0.5 }} align="right">{item.total}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {receiptItems.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, my: 2 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Total Amount:</Typography>
            <Typography sx={{ fontWeight: 'bold', color: 'green' }}>{totalAmount} MMK</Typography>
          </Box>
        )}
        <Typography variant="caption" display="block" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary', fontStyle: 'italic' }}>
          Thank you...
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2, borderTop: '1px solid #ddd' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="small"
          startIcon={<PaymentIcon />}
          disabled={receiptItems.length === 0}
          onClick={onSaveReceipt}
        >
          PAYMENT
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="small"
          startIcon={<PrintIcon />}
          disabled={receiptItems.length === 0}
          onClick={printSection}
        >
          RECEIPT
        </Button>
      </Box>
    </Card>
  );
}


// ==========================================

// ==========================================
export default function CashierPage() {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [receiptItems, setReceiptItems] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, text: '', color: 'success' });
  const cardRef = useRef(null);

  const getCategoryList = () => {
    const mockParam = {
      itemsPerPage: -1,
      sortBy: [{ key: 'id', order: 'asc' }],
      page: 1,
      search: { name: '' }
    };

    categoryService.GetAll(mockParam)
      .then((res) => {
        const allCategory = { id: null, name: "All", image: null };
        let backendCategories = [];

        if (res.data) {
          if (Array.isArray(res.data.data)) {
            backendCategories = res.data.data;
          } else if (Array.isArray(res.data.content)) {
            backendCategories = res.data.content;
          } else if (Array.isArray(res.data)) {
            backendCategories = res.data;
          }
        }

        setCategoryList([allCategory, ...backendCategories]);
      })
      .catch((err) => showSnackbar(err.message || 'Unauthorized access', 'error'));
  };

  const getItemList = (categoryId) => {
    dropdownService.GetItemListByCategoryId(categoryId)
      .then((res) => {
        setItemList(res.data || []);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    getCategoryList();
    getItemList(null);
  }, []);

  const handleCategoryChange = (id) => {
    setSelectedCategoryId(id);
    getItemList(id);
  };

  const showSnackbar = (text, color = 'success') => {
    setSnackbar({ open: true, text, color });
  };

  const handleAddToCart = (addItem) => {
    setReceiptItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === addItem.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === addItem.id
            ? { ...i, qty: i.qty + addItem.qty, total: (i.qty + addItem.qty) * i.price }
            : i
        );
      } else {
        return [...prevItems, { ...addItem, total: addItem.qty * addItem.price }];
      }
    });
  };

  const handleRemoveItem = (id) => {
    setReceiptItems((prev) => prev.filter((x) => x.id !== id));
  };

  const handleUpdateQty = (updatedItem) => {
    setReceiptItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleSaveReceipt = () => {
    if (receiptItems.length === 0) return;
    
    const d = new Date();
    const payload = {
      dateTime: `${d.getFullYear()} - ${d.getMonth() + 1} - ${d.getDate()}`,
      items: receiptItems.map((i) => ({
        id: i.id,
        name: i.name,
        category_id: i.category_id,
        image: i.image,
        price: i.price,
        deleted: false,
        qty: i.qty,
        total: i.total,
      })),
    };

    saleService.Save(payload)
      .then((res) => {
        showSnackbar(res.data.message, res.data.success ? "success" : "error");
        if (res.data.success) {
          setReceiptItems([]);
        }
      })
      .catch((err) => {
        showSnackbar(err.message, "error");
      });
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' }, gap: 3 }}>
        
        {}
        <Box>
          {}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
            Category
          </Typography>
          
          {}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 4, width: '100%' }}>
            {categoryList.map((cate, i) => {
              const isSelected = cate.id === selectedCategoryId;
              return (
                
                <Box key={i} sx={{ width: { xs: 'calc(50% - 6px)', sm: 'auto' }, minWidth: { sm: '110px' } }}>
                  <Card 
                    elevation={isSelected ? 4 : 1}
                    sx={{ 
                      bgcolor: isSelected ? '#1976d2' : 'white',
                      color: isSelected ? 'white' : 'inherit',
                      borderRadius: 2,
                      transition: '0.2s',
                      border: '1px solid #e0e0e0',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                    }}
                  >
                    <CardActionArea onClick={() => handleCategoryChange(cate.id)} sx={{ p: 1, textAlign: 'center' }}>
                      <Avatar
                        src={cate.image ? `${PORT}/uploads/images/category/${cate.image}` : '/logo.png'}
                        variant="rounded"
                        sx={{ width: 45, height: 45, mx: 'auto', mb: 1, borderRadius: 1, bgcolor: '#f5f5f5' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }} noWrap>{cate.name}</Typography>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Items Section */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
            Choose Items
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {itemList.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', py: 4 }}>
                <Typography color="text.secondary" align="center">
                  No items available in this category.
                </Typography>
              </Box>
            ) : (
              itemList.map((item, i) => (
                <Box key={i}>
                  <Card 
                    elevation={1} 
                    sx={{ 
                      borderRadius: 2, 
                      border: '1px solid #e0e0e0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <CardContent sx={{ p: 1.5, pb: '12px !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Avatar
                          src={item.image ? `${PORT}/uploads/images/item/${item.image}` : '/logo.png'}
                          variant="rounded"
                          sx={{ width: '100%', height: 120, borderRadius: 1, objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', color: '#2c3e50', mt: 0.5 }}>{item.name}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{Number(item.price).toLocaleString()} MMK</Typography>
                        <IconButton size="small" color="primary" onClick={() => cardRef.current?.OpenDialog(item)} sx={{ bgcolor: '#f0f7ff' }}>
                          <CartIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {}
        <Box>
          <RightDrawer
            receiptItems={receiptItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQty={handleUpdateQty}
            onSaveReceipt={handleSaveReceipt}
          />
        </Box>

      </Box>

      {/* Popups & Global Components */}
      <CardDialog ref={cardRef} onAddToCart={handleAddToCart} />
      
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