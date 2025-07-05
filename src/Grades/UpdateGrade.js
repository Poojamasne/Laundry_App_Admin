import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

export default function UpdateGrade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState({ name: "" });
  const [loading, setLoading] = useState(true);

  // Fetch grade details
  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const response = await axios.get(`https://api.blissiq.cloud/admin/grade/${id}`);
        if (response.data.success) {
          setGrade(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching grade:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrade();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGrade({ ...grade, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`https://api.blissiq.cloud/admin/grade/${id}`, {
        name: grade.name,
      });
      if (response.data.success) {
        alert("Grade updated successfully!");
        navigate("/grades");
      }
    } catch (error) {
      console.error("Error updating grade:", error);
      alert("Failed to update the grade.");
    }
  };

  if (loading) {
    return (
      <MDTypography variant="h6" color="text">
        Loading...
      </MDTypography>
    );
  }

  return (
    <MDBox>
      <MDTypography variant="h4" gutterBottom>
        Update Grade
      </MDTypography>
      <form onSubmit={handleSubmit}>
        <MDBox marginBottom={2}>
          <MDTypography variant="h6">Grade Name</MDTypography>
          <input
            type="text"
            name="name"
            value={grade.name}
            onChange={handleChange}
            placeholder="Enter grade name"
            style={{
              padding: "8px",
              width: "100%",
              border: "1px solid gray",
              borderRadius: "4px",
            }}
          />
        </MDBox>
        <MDButton variant="contained" color="success" type="submit">
          Update
        </MDButton>
        <MDButton
          variant="outlined"
          color="secondary"
          style={{ marginLeft: "8px" }}
          onClick={() => navigate("/grades")}
        >
          Cancel
        </MDButton>
      </form>
    </MDBox>
  );
}
