import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function EditUserInfo({ data, onChange, onSubmit, onClose, processing }) {
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => {
        const provinceNames = data.map((item) => item.name);
        setProvinces(provinceNames);
      })
      .catch((err) => {
        console.error("Lấy tỉnh thành thất bại:", err);
      });
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1,
          }}
        >
          Chỉnh sửa thông tin
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
            style={{ backgroundColor: "transparent", border: "none", cursor: "pointer" }}
          ></button>
        </DialogTitle>

        <DialogContent dividers>
          <form id="edit-user-form" onSubmit={onSubmit} noValidate>
            <FormControl fullWidth margin="normal">
              <InputLabel id="province-label">Sống tại</InputLabel>
              <Select
                labelId="province-label"
                name="Residence"
                value={data.Residence || ""}
                label="Sống tại"
                onChange={onChange}
                required
              >
                {provinces.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="birthplace-label">Đến từ</InputLabel>
              <Select
                labelId="birthplace-label"
                name="Birthplace"
                value={data.Birthplace || ""}
                label="Đến từ"
                onChange={onChange}
                required
              >
                {provinces.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Học tại"
              name="Education"
              value={data.Education || ""}
              onChange={onChange}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Sinh vào"
              name="DateOfBirth"
              type="date"
              value={data.DateOfBirth || ""}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={processing}>
            Hủy
          </Button>
          <Button
            form="edit-user-form"
            type="submit"
            variant="contained"
            disabled={processing}
            sx={{
              backgroundColor: "primary.dark",
              px: 4,
              py: 1.5,
              fontWeight: "600",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "primary.main",
              },
            }}
          >
            {processing ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
