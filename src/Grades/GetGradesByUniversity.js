import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // To get the university ID from URL

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

export default function GetGradesByUniversity() {
  const [grades, setGrades] = useState([]);
  const { universityId } = useParams(); // Get university ID from URL

  // Fetch grades by university
  const fetchGradesByUniversity = async () => {
    try {
      const response = await axios.get(
        `https://api.blissiq.cloud/admin/grade?universityId=${universityId}`
      );
      if (response.data.success) {
        setGrades(response.data.data); // Assuming the response contains a grades array
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  useEffect(() => {
    fetchGradesByUniversity();
  }, [universityId]);

  if (!grades.length) {
    return (
      <MDTypography variant="h6" color="text">
        No grades found or loading...
      </MDTypography>
    );
  }

  return (
    <MDBox>
      <MDTypography variant="h4" color="primary" gutterBottom>
        Grades for University ID: {universityId}
      </MDTypography>
      <MDBox
        component="table"
        width="100%"
        sx={{
          border: 1,
          borderColor: "gray",
          marginTop: 2,
          borderCollapse: "collapse",
        }}
      >
        <MDBox component="thead">
          <tr>
            <th style={{ padding: "8px", textAlign: "left", border: "1px solid gray" }}>ID</th>
            <th style={{ padding: "8px", textAlign: "left", border: "1px solid gray" }}>Name</th>
            <th style={{ padding: "8px", textAlign: "left", border: "1px solid gray" }}>Status</th>
            <th style={{ padding: "8px", textAlign: "left", border: "1px solid gray" }}>
              Created At
            </th>
          </tr>
        </MDBox>
        <MDBox component="tbody">
          {grades.map((grade) => (
            <tr key={grade.id}>
              <td
                style={{
                  padding: "8px",
                  textAlign: "left",
                  border: "1px solid gray",
                }}
              >
                {grade.id}
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "left",
                  border: "1px solid gray",
                }}
              >
                {grade.name}
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "left",
                  border: "1px solid gray",
                }}
              >
                {grade.isActive ? "Active" : "Inactive"}
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "left",
                  border: "1px solid gray",
                }}
              >
                {new Date(grade.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </MDBox>
      </MDBox>
    </MDBox>
  );
}
