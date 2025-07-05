import { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  Box,
  TextField,
  Typography,
  Modal,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon, // Add this import
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Button from "@mui/material/Button";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://laundry-app.synoventum.site";
const BANNERS_ENDPOINT = "/api/banner";
const BANNER_ADD_ENDPOINT = "/api/banner/add";
const BANNER_UPDATE_ENDPOINT = "/api/banner/update";
const BANNER_DELETE_ENDPOINT = "/api/banner/delete";

// Form validation schema
const bannerSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
});

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Fetch banners data
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}${BANNERS_ENDPOINT}`);
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formik for Add Banner form
  const addFormik = useFormik({
    initialValues: {
      title: "",
      description: "",
      image: null,
    },
    validationSchema: bannerSchema,
    onSubmit: async (values) => {
      try {
        setUploading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("image", values.image);

        await axios.post(`${API_BASE_URL}${BANNER_ADD_ENDPOINT}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        fetchBanners();
        setIsAddModalOpen(false);
        addFormik.resetForm();
        setImagePreview(null);
      } catch (error) {
        console.error("Error adding banner:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  // Formik for Edit Banner form
  const editFormik = useFormik({
    initialValues: {
      title: "",
      description: "",
      image: null,
    },
    validationSchema: bannerSchema,
    onSubmit: async (values) => {
      try {
        setUploading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        if (values.image) {
          formData.append("image", values.image);
        }

        await axios.put(
          `${API_BASE_URL}${BANNER_UPDATE_ENDPOINT}/${selectedBanner.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        fetchBanners();
        setIsEditModalOpen(false);
        setImagePreview(null);
      } catch (error) {
        console.error("Error updating banner:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  // Delete banner
  const deleteBanner = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_BASE_URL}${BANNER_DELETE_ENDPOINT}/${selectedBanner.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchBanners();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  // Handle image change for preview
  const handleImageChange = (event, formik) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open edit modal and set initial values
  const openEditModal = (banner) => {
    setSelectedBanner(banner);
    editFormik.setValues({
      title: banner.title,
      description: banner.description,
      image: null,
    });
    setImagePreview(banner.image);
    setIsEditModalOpen(true);
  };

  // Filter banners based on search
  const filteredBanners = banners.filter((banner) => {
    if (
      searchQuery &&
      !banner.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !banner.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !banner.id.toString().includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  // Columns for data table
  const columns = [
    { Header: "ID", accessor: "id", width: "8%" },
    { Header: "Title", accessor: "title", width: "20%" },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ value }) => (
        <Typography variant="body2" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {value}
        </Typography>
      ),
    },
    {
      Header: "Image",
      accessor: "image",
      width: "20%",
      Cell: ({ value }) => (
        <CardMedia
          component="img"
          image={value}
          alt="Banner"
          sx={{ height: 60, width: "auto", borderRadius: 1 }}
        />
      ),
    },
    {
      Header: "Created At",
      accessor: "created_at",
      width: "15%",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "15%",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="info"
            size="small"
            onClick={() => {
              setSelectedBanner(row.original);
              setIsDetailModalOpen(true);
            }}
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
            onClick={() => {
              setSelectedBanner(row.original);
              setIsDeleteModalOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Initial data fetch
  useEffect(() => {
    fetchBanners();
  }, []);

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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Banner Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search banners..."
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
                    color="dark"
                    onClick={() => setIsAddModalOpen(true)}
                    startIcon={<AddIcon />}
                  >
                    Add Banner
                  </MDButton>
                </Box>
              </MDBox>

              <MDBox pt={3} pb={3}>
                <DataTable
                  table={{ columns, rows: filteredBanners }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  loading={loading}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Banner Detail Modal */}
      <Modal open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxWidth: 800,
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {selectedBanner && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  Banner #{selectedBanner.id}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Banner Image
                  </Typography>
                  <CardMedia
                    component="img"
                    image={selectedBanner.image}
                    alt="Banner"
                    sx={{ maxHeight: 300, width: "100%", borderRadius: 1 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Title:</strong> {selectedBanner.title}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Description:</strong> {selectedBanner.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Meta Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {formatDate(selectedBanner.created_at)}
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

      {/* Add Banner Modal */}
      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxWidth: 600,
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Add New Banner
          </Typography>
          <form onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={addFormik.values.title}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.title && Boolean(addFormik.errors.title)}
                  helperText={addFormik.touched.title && addFormik.errors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={addFormik.values.description}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.description && Boolean(addFormik.errors.description)}
                  helperText={addFormik.touched.description && addFormik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Banner Image
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="add-banner-image"
                  type="file"
                  onChange={(e) => handleImageChange(e, addFormik)}
                />
                <label htmlFor="add-banner-image">
                  <Button variant="contained" component="span">
                    Upload Image
                  </Button>
                </label>
                {imagePreview && (
                  <Box mt={2}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Preview"
                      sx={{ maxHeight: 200, width: "auto", borderRadius: 1 }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
              <MDButton
                variant="gradient"
                color="secondary"
                onClick={() => {
                  setIsAddModalOpen(false);
                  addFormik.resetForm();
                  setImagePreview(null);
                }}
              >
                Cancel
              </MDButton>
              <MDButton
                variant="gradient"
                color="primary"
                type="submit"
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} color="inherit" /> : "Add Banner"}
              </MDButton>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Edit Banner Modal */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxWidth: 600,
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Edit Banner #{selectedBanner?.id}
          </Typography>
          <form onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={editFormik.values.title}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.title && Boolean(editFormik.errors.title)}
                  helperText={editFormik.touched.title && editFormik.errors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={editFormik.values.description}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.description && Boolean(editFormik.errors.description)}
                  helperText={editFormik.touched.description && editFormik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Banner Image
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-banner-image"
                  type="file"
                  onChange={(e) => handleImageChange(e, editFormik)}
                />
                <label htmlFor="edit-banner-image">
                  <Button variant="contained" component="span">
                    Change Image
                  </Button>
                </label>
                {imagePreview && (
                  <Box mt={2}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Preview"
                      sx={{ maxHeight: 200, width: "auto", borderRadius: 1 }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
              <MDButton
                variant="gradient"
                color="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setImagePreview(null);
                }}
              >
                Cancel
              </MDButton>
              <MDButton
                variant="gradient"
                color="primary"
                type="submit"
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} color="inherit" /> : "Update Banner"}
              </MDButton>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <DialogTitle>
          Delete Banner #{selectedBanner?.id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this banner? This action cannot be undone.
          </Typography>
          {selectedBanner?.image && (
            <Box mt={2}>
              <CardMedia
                component="img"
                image={selectedBanner.image}
                alt="Banner"
                sx={{ maxHeight: 150, width: "auto", borderRadius: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIsDeleteModalOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={deleteBanner} color="error">
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}