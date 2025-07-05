import { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  Box,
  TextField,
  Typography,
  Modal,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CardMedia,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API_BASE_URL = "https://laundry-app.synoventum.site";
const CATEGORY_ENDPOINT = "/api/category";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [newCategory, setNewCategory] = useState({
    category_name: "",
    category_image: null,
  });
  const [editCategory, setEditCategory] = useState({
    id: "",
    category_name: "",
    category_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}${CATEGORY_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });
      
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showSnackbar("Error fetching categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const formData = new FormData();
      formData.append("category_name", newCategory.category_name);
      if (newCategory.category_image) {
        formData.append("category_image", newCategory.category_image);
      }

      await axios.post(`${API_BASE_URL}${CATEGORY_ENDPOINT}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      fetchCategories();
      setIsCreateModalOpen(false);
      setNewCategory({ category_name: "", category_image: null });
      setImagePreview(null);
      showSnackbar("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      showSnackbar("Error creating category", "error");
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const formData = new FormData();
      formData.append("category_name", editCategory.category_name);
      if (editCategory.category_image) {
        formData.append("category_image", editCategory.category_image);
      }

      await axios.put(`${API_BASE_URL}${CATEGORY_ENDPOINT}/${editCategory.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      fetchCategories();
      setIsEditModalOpen(false);
      setEditCategory({ id: "", category_name: "", category_image: null });
      setEditImagePreview(null);
      showSnackbar("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      showSnackbar("Error updating category", "error");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      await axios.delete(`${API_BASE_URL}${CATEGORY_ENDPOINT}/${selectedCategory.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchCategories();
      setIsDeleteModalOpen(false);
      showSnackbar("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      showSnackbar("Error deleting category", "error");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategory({ ...newCategory, category_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCategory({ ...editCategory, category_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredCategories = categories.filter((category) => {
    if (
      searchQuery &&
      !category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !category.id.toString().includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const openDetailModal = (category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditCategory({
      id: category.id,
      category_name: category.category_name,
      category_image: null,
    });
    setEditImagePreview(
      category.category_image 
        ? `${API_BASE_URL}/${category.category_image.replace(/\\/g, "/")}`
        : null
    );
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    { Header: "ID", accessor: "id", width: "8%" },
    { Header: "Name", accessor: "category_name", width: "20%" },
    {
      Header: "Image",
      accessor: "category_image",
      width: "15%",
      Cell: ({ value }) => (
        <Avatar
          src={value ? `${API_BASE_URL}/${value.replace(/\\/g, "/")}` : "/default-category.png"}
          variant="rounded"
          sx={{ width: 60, height: 60 }}
        />
      ),
    },
    {
      Header: "Created At",
      accessor: "created_at",
      width: "15%",
      Cell: ({ value }) => formatDate(value),
    },
    { Header: "Created By", accessor: "admin_name", width: "15%" },
    {
      Header: "Actions",
      accessor: "actions",
      width: "27%",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="info"
            size="small"
            onClick={() => openDetailModal(row.original)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() => openEditModal(row.original)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => openDeleteModal(row.original)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} sx={{ width: '100%', maxWidth: '100%', px: 0 }}>
        <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
          <Grid item xs={12} sx={{ px: 0 }}>
            <Card sx={{ width: '100%', margin: 0, boxShadow: 3 }}>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: 'calc(100% - 32px)' }}
              >
                <MDTypography variant="h6" color="white">
                  Category Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 1,
                      width: 250,
                    }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
                    }}
                  />
                  <MDButton
                    variant="gradient"
                    color="primary"
                    size="small"
                    onClick={() => setIsCreateModalOpen(true)}
                    sx={{
                      background: "linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)",
                      boxShadow: "0 3px 5px 2px rgba(156, 39, 176, .3)",
                      '&:hover': {
                        background: "linear-gradient(45deg, #7b1fa2 30%, #5e35b1 90%)"
                      }
                    }}
                  >
                    <AddIcon /> Add Category
                  </MDButton>
                </Box>
              </MDBox>

              <MDBox pt={3} pb={3} sx={{ width: '100%', px: 2 }}>
                <DataTable
                  table={{ columns, rows: filteredCategories }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  loading={loading}
                  sx={{ width: '100%' }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Create Category Modal */}
      <Dialog 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '600px',
            margin: 0,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" color="primary">Create New Category</MDTypography>
            <IconButton onClick={() => setIsCreateModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory.category_name}
            onChange={(e) => setNewCategory({ ...newCategory, category_name: e.target.value })}
            margin="normal"
            required
            sx={{ mb: 3 }}
          />
          
          <MDTypography variant="h6" gutterBottom color="text">
            Category Image
          </MDTypography>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={3}>
            {imagePreview ? (
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  p: 1,
                  border: "1px dashed",
                  borderColor: "primary.main",
                  borderRadius: 2
                }}
              >
                <CardMedia
                  component="img"
                  image={imagePreview}
                  alt="Preview"
                  sx={{ maxHeight: 200, width: "100%", borderRadius: 1 }}
                />
              </Card>
            ) : (
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  p: 2,
                  border: "1px dashed",
                  borderColor: "grey.400",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "grey.100"
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No image selected
                </Typography>
              </Card>
            )}
            <MDButton
              component="label"
              variant="gradient"
              color="primary"
              startIcon={<CloudUploadIcon />}
              sx={{
                background: "linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)",
                boxShadow: "0 3px 5px 2px rgba(156, 39, 176, .3)",
                '&:hover': {
                  background: "linear-gradient(45deg, #7b1fa2 30%, #5e35b1 90%)"
                }
              }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </MDButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <MDButton 
            onClick={() => setIsCreateModalOpen(false)} 
            variant="outlined" 
            color="secondary"
            sx={{ mr: 2 }}
          >
            Cancel
          </MDButton>
          <MDButton
            onClick={handleCreateCategory}
            variant="gradient"
            color="primary"
            disabled={!newCategory.category_name}
            sx={{
              background: "linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)",
              boxShadow: "0 3px 5px 2px rgba(156, 39, 176, .3)",
              '&:hover': {
                background: "linear-gradient(45deg, #7b1fa2 30%, #5e35b1 90%)"
              }
            }}
          >
            Create Category
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '600px',
            margin: 0,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" color="primary">Edit Category</MDTypography>
            <IconButton onClick={() => setIsEditModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Category Name"
            value={editCategory.category_name}
            onChange={(e) => setEditCategory({ ...editCategory, category_name: e.target.value })}
            margin="normal"
            required
            sx={{ mb: 3 }}
          />
          
          <MDTypography variant="h6" gutterBottom color="text">
            Category Image
          </MDTypography>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={3}>
            {editImagePreview ? (
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  p: 1,
                  border: "1px dashed",
                  borderColor: "primary.main",
                  borderRadius: 2
                }}
              >
                <CardMedia
                  component="img"
                  image={editImagePreview}
                  alt="Preview"
                  sx={{ maxHeight: 200, width: "100%", borderRadius: 1 }}
                />
              </Card>
            ) : (
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  p: 2,
                  border: "1px dashed",
                  borderColor: "grey.400",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "grey.100"
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No image selected
                </Typography>
              </Card>
            )}
            <MDButton
              component="label"
              variant="gradient"
              color="primary"
              startIcon={<CloudUploadIcon />}
              sx={{
                background: "linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)",
                boxShadow: "0 3px 5px 2px rgba(156, 39, 176, .3)",
                '&:hover': {
                  background: "linear-gradient(45deg, #7b1fa2 30%, #5e35b1 90%)"
                }
              }}
            >
              Change Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleEditImageUpload}
              />
            </MDButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <MDButton 
            onClick={() => setIsEditModalOpen(false)} 
            variant="outlined" 
            color="secondary"
            sx={{ mr: 2 }}
          >
            Cancel
          </MDButton>
          <MDButton
            onClick={handleUpdateCategory}
            variant="gradient"
            color="primary"
            disabled={!editCategory.category_name}
            sx={{
              background: "linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)",
              boxShadow: "0 3px 5px 2px rgba(156, 39, 176, .3)",
              '&:hover': {
                background: "linear-gradient(45deg, #7b1fa2 30%, #5e35b1 90%)"
              }
            }}
          >
            Update Category
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Modal open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: '90%', md: '60%' },
            maxWidth: 800,
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {selectedCategory && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">{selectedCategory.category_name}</Typography>
                <IconButton onClick={() => setIsDetailModalOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Category Image
                  </Typography>
                  {selectedCategory.category_image ? (
                    <CardMedia
                      component="img"
                      image={`${API_BASE_URL}/${selectedCategory.category_image.replace(/\\/g, "/")}`}
                      alt="Category"
                      sx={{ maxHeight: 300, width: "100%", borderRadius: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">No image available</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>ID:</strong> {selectedCategory.id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedCategory.category_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Admin Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Admin ID:</strong> {selectedCategory.admin_id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Admin Name:</strong> {selectedCategory.admin_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {formatDate(selectedCategory.created_at)}
                  </Typography>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" mt={3}>
                <MDButton
                  variant="gradient"
                  color="secondary"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </MDButton>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '500px',
            margin: 0,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{selectedCategory?.category_name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIsDeleteModalOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteCategory} color="error">
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}