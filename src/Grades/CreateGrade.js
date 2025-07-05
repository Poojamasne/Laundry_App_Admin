import { useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function CreateGrade({ fetchGrades }) {
  const [formData, setFormData] = useState({
    name: "",
    universityId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://api.blissiq.cloud/admin/grade/", formData);

      if (response.data.success) {
        alert("Grade created successfully!");
        fetchGrades();
        setFormData({ name: "", universityId: "" });
      }
    } catch (error) {
      console.error("Error creating grade:", error);
      alert("Failed to create grade.");
    }
  };

  return (
    <Grid container justifyContent="center" style={{ marginTop: "20px" }}>
      <Grid item xs={12} sm={8} md={6} lg={5}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h4" gutterBottom>
              Create Grade
            </MDTypography>
            <form onSubmit={handleSubmit}>
              <MDBox mb={3}>
                <TextField
                  label="Grade Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </MDBox>
              <MDBox mb={3}>
                <TextField
                  label="University ID"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </MDBox>
              <MDBox display="flex" justifyContent="flex-end">
                <MDButton type="submit" variant="gradient" color="success">
                  Submit
                </MDButton>
              </MDBox>
            </form>
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default CreateGrade;
