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
  Button,
  CardMedia,
  CircularProgress,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://laundry-app.synoventum.site";
const COUPONS_ENDPOINT = "/api/admin/coupons";
const COUPON_ADD_ENDPOINT = "/api/admin/coupon";
const COUPON_UPDATE_ENDPOINT = "/api/coupons/update";
const COUPON_DELETE_ENDPOINT = "/api/coupons";

// Form validation schema
const couponSchema = Yup.object().shape({
  code: Yup.string().required("Coupon code is required"),
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  discount_type: Yup.string().required("Discount type is required"),
  discount_value: Yup.number()
    .required("Discount value is required")
    .positive("Discount value must be positive"),
  min_order_value: Yup.number().min(0, "Minimum order value cannot be negative"),
  max_discount: Yup.number().min(0, "Max discount cannot be negative"),
  valid_from: Yup.date().required("Valid from date is required"),
  valid_to: Yup.date()
    .required("Valid to date is required")
    .min(Yup.ref("valid_from"), "Valid to date must be after valid from date"),
  is_active: Yup.boolean(),
});

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
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

  // Format status for display
  const formatStatus = (isActive) => {
    return isActive ? (
      <MDTypography variant="caption" color="success" fontWeight="medium">
        Active
      </MDTypography>
    ) : (
      <MDTypography variant="caption" color="error" fontWeight="medium">
        Inactive
      </MDTypography>
    );
  };

  // Format discount value for display
  const formatDiscount = (coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% off (max ₹${coupon.max_discount})`;
    }
    return `₹${coupon.discount_value} off`;
  };

  // Fetch coupons data
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}${COUPONS_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCoupons(response.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formik for Add Coupon form
  const addFormik = useFormik({
    initialValues: {
      code: "",
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_value: 0,
      max_discount: 0,
      valid_from: "",
      valid_to: "",
      is_active: true,
      image: null,
    },
    validationSchema: couponSchema,
    onSubmit: async (values) => {
      try {
        setUploading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = {
          code: values.code,
          title: values.title,
          description: values.description,
          discount_type: values.discount_type,
          discount_value: values.discount_value,
          min_order_value: values.min_order_value,
          max_discount: values.max_discount,
          valid_from: values.valid_from,
          valid_to: values.valid_to,
          is_active: values.is_active,
        };

        await axios.post(`${API_BASE_URL}${COUPON_ADD_ENDPOINT}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        fetchCoupons();
        setIsAddModalOpen(false);
        addFormik.resetForm();
        setImagePreview(null);
      } catch (error) {
        console.error("Error adding coupon:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  // Formik for Edit Coupon form
  const editFormik = useFormik({
    initialValues: {
      code: "",
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_value: 0,
      max_discount: 0,
      valid_from: "",
      valid_to: "",
      is_active: true,
      image: null,
    },
    validationSchema: couponSchema,
    onSubmit: async (values) => {
      try {
        setUploading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = {
          code: values.code,
          title: values.title,
          description: values.description,
          discount_type: values.discount_type,
          discount_value: values.discount_value,
          min_order_value: values.min_order_value,
          max_discount: values.max_discount,
          valid_from: values.valid_from,
          valid_to: values.valid_to,
          is_active: values.is_active,
        };

        await axios.put(
          `${API_BASE_URL}${COUPON_UPDATE_ENDPOINT}/${selectedCoupon.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        fetchCoupons();
        setIsEditModalOpen(false);
        setImagePreview(null);
      } catch (error) {
        console.error("Error updating coupon:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  // Delete coupon
  const deleteCoupon = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_BASE_URL}${COUPON_DELETE_ENDPOINT}/${selectedCoupon.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCoupons();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting coupon:", error);
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
  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    editFormik.setValues({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      min_order_value: parseFloat(coupon.min_order_value),
      max_discount: parseFloat(coupon.max_discount),
      valid_from: coupon.valid_from.split("T")[0],
      valid_to: coupon.valid_to.split("T")[0],
      is_active: coupon.is_active === 1,
      image: null,
    });
    setImagePreview(coupon.image);
    setIsEditModalOpen(true);
  };

  // Filter coupons based on search
  const filteredCoupons = coupons.filter((coupon) => {
    if (
      searchQuery &&
      !coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !coupon.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !coupon.id.toString().includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  // Columns for data table
  const columns = [
    { Header: "ID", accessor: "id", width: "8%" },
    { Header: "Code", accessor: "code", width: "12%" },
    { Header: "Title", accessor: "title", width: "15%" },
    {
      Header: "Description",
      accessor: "description",
      width: "20%",
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
      Header: "Discount",
      accessor: "discount",
      width: "15%",
      Cell: ({ row }) => formatDiscount(row.original),
    },
    {
      Header: "Status",
      accessor: "is_active",
      width: "10%",
      Cell: ({ value }) => formatStatus(value),
    },
    {
      Header: "Valid Until",
      accessor: "valid_to",
      width: "12%",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "10%",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="info"
            size="small"
            onClick={() => {
              setSelectedCoupon(row.original);
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
              setSelectedCoupon(row.original);
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
    fetchCoupons();
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
                  Coupon Management
                </MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search coupons..."
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
                    Add Coupon
                  </MDButton>
                </Box>
              </MDBox>

              <MDBox pt={3} pb={3}>
                <DataTable
                  table={{ columns, rows: filteredCoupons }}
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

      {/* Coupon Detail Modal */}
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
          {selectedCoupon && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  Coupon #{selectedCoupon.id}
                </Typography>
                {formatStatus(selectedCoupon.is_active)}
              </Box>

              <Grid container spacing={3}>
                {selectedCoupon.image && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Coupon Image
                    </Typography>
                    <CardMedia
                      component="img"
                      image={selectedCoupon.image}
                      alt="Coupon"
                      sx={{ maxHeight: 300, width: "100%", borderRadius: 1 }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Code:</strong> {selectedCoupon.code}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Title:</strong> {selectedCoupon.title}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Description:</strong> {selectedCoupon.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Discount Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type:</strong> {selectedCoupon.discount_type === "percentage" ? "Percentage" : "Fixed Amount"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Value:</strong> {selectedCoupon.discount_value} {selectedCoupon.discount_type === "percentage" ? "%" : "₹"}
                  </Typography>
                  {selectedCoupon.discount_type === "percentage" && (
                    <Typography variant="body1">
                      <strong>Max Discount:</strong> ₹{selectedCoupon.max_discount}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    <strong>Min Order Value:</strong> ₹{selectedCoupon.min_order_value}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Validity
                  </Typography>
                  <Typography variant="body1">
                    <strong>Valid From:</strong> {formatDate(selectedCoupon.valid_from)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Valid To:</strong> {formatDate(selectedCoupon.valid_to)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Meta Information
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {formatDate(selectedCoupon.created_at)}
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

      {/* Add Coupon Modal */}
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
            Add New Coupon
          </Typography>
          <form onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  name="code"
                  value={addFormik.values.code}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.code && Boolean(addFormik.errors.code)}
                  helperText={addFormik.touched.code && addFormik.errors.code}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Discount Type"
                  name="discount_type"
                  value={addFormik.values.discount_type}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.discount_type && Boolean(addFormik.errors.discount_type)}
                  helperText={addFormik.touched.discount_type && addFormik.errors.discount_type}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={`Discount Value (${addFormik.values.discount_type === "percentage" ? "%" : "₹"})`}
                  name="discount_value"
                  type="number"
                  value={addFormik.values.discount_value}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.discount_value && Boolean(addFormik.errors.discount_value)}
                  helperText={addFormik.touched.discount_value && addFormik.errors.discount_value}
                />
              </Grid>
              {addFormik.values.discount_type === "percentage" && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Discount (₹)"
                    name="max_discount"
                    type="number"
                    value={addFormik.values.max_discount}
                    onChange={addFormik.handleChange}
                    error={addFormik.touched.max_discount && Boolean(addFormik.errors.max_discount)}
                    helperText={addFormik.touched.max_discount && addFormik.errors.max_discount}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Min Order Value (₹)"
                  name="min_order_value"
                  type="number"
                  value={addFormik.values.min_order_value}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.min_order_value && Boolean(addFormik.errors.min_order_value)}
                  helperText={addFormik.touched.min_order_value && addFormik.errors.min_order_value}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valid From"
                  name="valid_from"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={addFormik.values.valid_from}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.valid_from && Boolean(addFormik.errors.valid_from)}
                  helperText={addFormik.touched.valid_from && addFormik.errors.valid_from}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valid To"
                  name="valid_to"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={addFormik.values.valid_to}
                  onChange={addFormik.handleChange}
                  error={addFormik.touched.valid_to && Boolean(addFormik.errors.valid_to)}
                  helperText={addFormik.touched.valid_to && addFormik.errors.valid_to}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addFormik.values.is_active}
                      onChange={addFormik.handleChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active Coupon"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Coupon Image (Optional)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="add-coupon-image"
                  type="file"
                  onChange={(e) => handleImageChange(e, addFormik)}
                />
                <label htmlFor="add-coupon-image">
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
                {uploading ? <CircularProgress size={24} color="inherit" /> : "Add Coupon"}
              </MDButton>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Edit Coupon Modal */}
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
            Edit Coupon #{selectedCoupon?.id}
          </Typography>
          <form onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  name="code"
                  value={editFormik.values.code}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.code && Boolean(editFormik.errors.code)}
                  helperText={editFormik.touched.code && editFormik.errors.code}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Discount Type"
                  name="discount_type"
                  value={editFormik.values.discount_type}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.discount_type && Boolean(editFormik.errors.discount_type)}
                  helperText={editFormik.touched.discount_type && editFormik.errors.discount_type}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={`Discount Value (${editFormik.values.discount_type === "percentage" ? "%" : "₹"})`}
                  name="discount_value"
                  type="number"
                  value={editFormik.values.discount_value}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.discount_value && Boolean(editFormik.errors.discount_value)}
                  helperText={editFormik.touched.discount_value && editFormik.errors.discount_value}
                />
              </Grid>
              {editFormik.values.discount_type === "percentage" && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Discount (₹)"
                    name="max_discount"
                    type="number"
                    value={editFormik.values.max_discount}
                    onChange={editFormik.handleChange}
                    error={editFormik.touched.max_discount && Boolean(editFormik.errors.max_discount)}
                    helperText={editFormik.touched.max_discount && editFormik.errors.max_discount}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Min Order Value (₹)"
                  name="min_order_value"
                  type="number"
                  value={editFormik.values.min_order_value}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.min_order_value && Boolean(editFormik.errors.min_order_value)}
                  helperText={editFormik.touched.min_order_value && editFormik.errors.min_order_value}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valid From"
                  name="valid_from"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={editFormik.values.valid_from}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.valid_from && Boolean(editFormik.errors.valid_from)}
                  helperText={editFormik.touched.valid_from && editFormik.errors.valid_from}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valid To"
                  name="valid_to"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={editFormik.values.valid_to}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.valid_to && Boolean(editFormik.errors.valid_to)}
                  helperText={editFormik.touched.valid_to && editFormik.errors.valid_to}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormik.values.is_active}
                      onChange={editFormik.handleChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active Coupon"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Coupon Image (Optional)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-coupon-image"
                  type="file"
                  onChange={(e) => handleImageChange(e, editFormik)}
                />
                <label htmlFor="edit-coupon-image">
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
                {uploading ? <CircularProgress size={24} color="inherit" /> : "Update Coupon"}
              </MDButton>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <DialogTitle>
          Delete Coupon #{selectedCoupon?.id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this coupon? This action cannot be undone.
          </Typography>
          {selectedCoupon?.image && (
            <Box mt={2}>
              <CardMedia
                component="img"
                image={selectedCoupon.image}
                alt="Coupon"
                sx={{ maxHeight: 150, width: "auto", borderRadius: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIsDeleteModalOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={deleteCoupon} color="error">
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}