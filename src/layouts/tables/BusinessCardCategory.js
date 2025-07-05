import { useEffect, useState } from "react";
import {
  IconButton,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  Card,
  Avatar,
  CardMedia,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tambola.chetakbooks.shop";

function BusinessCardCategory() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewCategoryData, setViewCategoryData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    name: "",
    image: "",
    status: "active",
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
    status: "active",
  });
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/business-card-category`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching category data:", error);
      showSnackbar("Error fetching categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return null;
      }

      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch(`${BASE_URL}/api/upload/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      return data.files[0].filename;
    } catch (error) {
      console.error("Error uploading file:", error);
      showSnackbar(error.message || "Error uploading file", "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleViewCategory = (category) => {
    setViewCategoryData(category);
    setOpenViewDialog(true);
  };

  const handleOpenEditDialog = (category) => {
    setEditData({
      id: category.id,
      name: category.name,
      image: category.image,
      status: category.status,
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleUpdateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/business-card-category/${editData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      showSnackbar("Category updated successfully");
      setOpenEditDialog(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      showSnackbar(error.message || "Error updating category", "error");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/business-card-category/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      showSnackbar("Category deleted successfully");
      setOpenDeleteDialog(false);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      showSnackbar(error.message || "Error deleting category", "error");
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/business-card-category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      showSnackbar("Category created successfully");
      setOpenCreateDialog(false);
      setNewCategory({
        name: "",
        image: "",
        status: "active",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      showSnackbar(error.message || "Error creating category", "error");
    }
  };

  // Helper to render a Chip for category status
  function getStatusChip(status) {
    let color = "default";
    let label = status;
    switch (status) {
      case "active":
        color = "success";
        label = "Active";
        break;
      case "inactive":
        color = "warning";
        label = "Inactive";
        break;
      default:
        color = "default";
        label = status;
    }
    return <Chip label={label} color={color} size="small" />;
  }

  // Helper to render category image
  function renderCategoryImage(filename) {
    if (!filename) return <MDTypography variant="caption">No Image</MDTypography>;

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          src={`${BASE_URL}/uploads/${filename}`}
          variant="rounded"
          sx={{ width: 80, height: 40 }}
          style={{ cursor: "pointer" }}
        />
      </Box>
    );
  }

  // Actions column cell component
  function ActionsColumnCell({ row, onView, onEdit, onDelete }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    return (
      <>
        <IconButton
          aria-label="more"
          aria-controls="actions-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onView(row.original);
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="View" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEdit(row.original);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete(row.original.id);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </>
    );
  }

  ActionsColumnCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }).isRequired,
    }).isRequired,
    onView: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  // Define columns for DataTable
  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    {
      Header: "Image",
      accessor: "image",
      Cell: ({ value }) => renderCategoryImage(value),
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => getStatusChip(value),
    },
    {
      Header: "Created At",
      accessor: "created_at",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: (cellProps) => (
        <ActionsColumnCell
          {...cellProps}
          onView={handleViewCategory}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      ),
    },
  ];

  const filteredCategories = categories
    .filter((category) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        category.name.toLowerCase().includes(searchTermLower) ||
        category.id.toString().includes(searchTermLower)
      );
    })
    .filter((category) => {
      if (statusFilter === "all") return true;
      return category.status === statusFilter;
    });

  // Apply pagination
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <MDTypography variant="h6" color="black">
                    Business Card Categories
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <FormControl sx={{ minWidth: 120 }} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                        sx={{ width: 150, height: 35 }}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search categories"
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateDialog}
                    >
                      Create Category
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: paginatedCategories }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredCategories.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Category Details View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5">Category Details</MDTypography>
            <IconButton onClick={() => setOpenViewDialog(false)}>
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          {viewCategoryData && (
            <MDBox>
              <MDBox mb={3}>
                <MDTypography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Basic Information
                </MDTypography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDTypography>
                      <strong>ID:</strong> {viewCategoryData.id}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography>
                      <strong>Name:</strong> {viewCategoryData.name}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography>
                      <strong>Image:</strong> {viewCategoryData.image || "No image"}
                    </MDTypography>
                  </Grid>
                  {viewCategoryData.image && (
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="center" my={2}>
                        <CardMedia
                          component="img"
                          image={`${BASE_URL}/uploads/${viewCategoryData.image}`}
                          sx={{ width: "100%", maxWidth: 400, height: "auto" }}
                          alt="Category Image"
                        />
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <MDTypography>
                      <strong>Status:</strong> {getStatusChip(viewCategoryData.status)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography>
                      <strong>Created At:</strong>{" "}
                      {new Date(viewCategoryData.created_at).toLocaleString()}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography>
                      <strong>Updated At:</strong>{" "}
                      {new Date(viewCategoryData.updated_at).toLocaleString()}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} variant="contained" color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <MDBox mt={2} mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Category Name"
                  fullWidth
                  margin="normal"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="edit-category-upload"
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const filename = await handleFileUpload(file);
                      if (filename) {
                        setEditData({
                          ...editData,
                          image: filename,
                        });
                      }
                    }
                  }}
                />
                <label htmlFor="edit-category-upload">
                  <Button variant="contained" component="span" startIcon={<AddIcon />}>
                    Upload New Image
                  </Button>
                </label>
                {uploading && <CircularProgress size={24} />}
                {editData.image && (
                  <Box mt={2}>
                    <CardMedia
                      component="img"
                      image={`${BASE_URL}/uploads/${editData.image}`}
                      sx={{ width: 200, height: 100 }}
                      alt="Category Preview"
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    label="Status"
                    required
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateCategory} color="error" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDBox mt={2} mb={3}>
            <MDTypography>
              Are you sure you want to delete this category? This action cannot be undone.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5">Create New Category</MDTypography>
            <IconButton onClick={() => setOpenCreateDialog(false)}>
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Category Name"
                  fullWidth
                  margin="normal"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="create-category-upload"
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const filename = await handleFileUpload(file);
                      if (filename) {
                        setNewCategory({
                          ...newCategory,
                          image: filename,
                        });
                      }
                    }
                  }}
                />
                <label htmlFor="create-category-upload">
                  <Button variant="contained" component="span" startIcon={<AddIcon />}>
                    Upload Image
                  </Button>
                </label>
                {uploading && <CircularProgress size={24} />}
                {newCategory.image && (
                  <Box mt={2}>
                    <CardMedia
                      component="img"
                      image={`${BASE_URL}/uploads/${newCategory.image}`}
                      sx={{ width: 200, height: 100 }}
                      alt="Category Preview"
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newCategory.status}
                    onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                    label="Status"
                    required
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} color="error" variant="contained">
            Create Category
          </Button>
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

export default BusinessCardCategory;
